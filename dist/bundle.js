'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const COMPONENT = 'component';
const SERVICE = 'service';

const APP_SERVICE = 'app';
const PARENT_SERVICE = 'parent';

const AFTER_INITIALIZED = 'afterInitialized';

const COMPONENT_TYPE = Symbol('componentType');
const INJECT = Symbol('inject');
const CONSTRUCT = Symbol('construct');
const PROVIDER = Symbol('provider');

var hasExclamationMark = function (str) {
    if (typeof str === 'string') {
        return str[str.length - 1] === '!';
    }
    return false;
};

const plainName = name => name.substring(0, name.length - 1);
const isExclamizedName = (name) => hasExclamationMark(name) || name === PARENT_SERVICE;

const waitForAndCallFactories = (providers, getFactory, extraOptions) =>
    providers
        .map(providerName => {
            const name = hasExclamationMark(providerName) ? plainName(providerName) : providerName;
            let factory = getFactory(name);
            if (typeof factory === 'function') {
                factory = factory(extraOptions);
            }
            return Promise.resolve(factory).then(value => {
                return {
                    providerName,
                    value
                };
            });
        });

function constructEntity (provider, extraProviders) {

    const _provider = provider.provider;
    let instance;

    if (typeof _provider === 'function') {

        const app = _provider[PROVIDER] || extraProviders ? new App({
            parent: provider.app,
            provider: [_provider[PROVIDER], extraProviders]
        }) : provider.app;

        const initializedServices = {};

        const copyFactories = (factories, to) => factories.forEach(factory => {
            to[factory.providerName] = factory.value;
        });

        if (_provider[CONSTRUCT]) {

            instance = _provider[CONSTRUCT]
                .then((constructProviders) => {
                    return typeof constructProviders === 'function' ? constructProviders() : constructProviders;
                })
                .then((constructProviders) => {
                    let fulfill;

                    const getServiceFactory = name => initializedServices[name] || app.factory(name, SERVICE);
                    const createInstance = (fn) => Reflect.construct(fn, constructProviders.map(getServiceFactory));
                    const constructFactories = waitForAndCallFactories(
                        constructProviders.filter(isExclamizedName),
                        getServiceFactory);

                    if (constructFactories.length) {
                        fulfill = Promise.all(constructFactories).then(factories => {
                            copyFactories(factories, initializedServices);
                            return createInstance(_provider);
                        });
                    } else {
                        fulfill = createInstance(_provider);
                    }

                    return fulfill;
                });

        } else {
            instance = Promise.resolve(new _provider);
        }

        if (_provider[INJECT]) {

            instance = Promise.all([instance, _provider[INJECT]])
                .then(([entity, injectProviders]) => {

                    const initializedComponents = {};
                    const getComponentFactory = name => initializedComponents[name] || app.factory(name, COMPONENT);

                    let fulfill = entity;

                    if (injectProviders.length) {

                        const injectFactories = waitForAndCallFactories(
                            injectProviders.filter(name => hasExclamationMark(name) && !initializedComponents[name]),
                            getComponentFactory,
                            {[PARENT_SERVICE]: entity});

                        if (injectFactories.length) {

                            fulfill = Promise.all([fulfill, Promise.all(injectFactories)])
                                .then(([entity, factories]) => {
                                    copyFactories(factories, initializedComponents);
                                    return entity;
                                });

                        }

                        fulfill = fulfill.then(entity => {

                            injectProviders.forEach(providerName => {
                                const name = hasExclamationMark(providerName) ? plainName(providerName) : providerName;
                                Object.defineProperty(entity, name, {
                                    value: getComponentFactory(providerName)
                                });
                            });

                            return entity;
                        });

                    }

                    return fulfill;
                });

        }

        instance = instance.then(entity => {
            const fn = entity[AFTER_INITIALIZED];
            if (typeof fn === 'function') {
                return Promise.resolve(fn.call(entity)).then(() => entity);
            } else {
                return entity;
            }
        });

    } else {
        instance = _provider;
    }

    return instance;

}

function createFactory (app, name, type) {

    const provider = app.providers.get(name, type);

    switch (type) {
        case SERVICE:
            return createServiceFactory(name, provider);
        case COMPONENT:
            return createComponentFactory(provider);
        default:
            throw new Error(`invalid provider type: ${type}`);
    }

}

function createServiceFactory (name, provider) {
    return () => {

        const services = provider.app.services;
        let instance = services.get(name);

        if (instance === undefined) {
            instance = constructEntity(provider);
            services.set(name, instance);
        }

        return instance;
    }
}

function createComponentFactory (provider) {
    return constructEntity.bind(null, provider);
}

function annotateProvider (provider, componentType, options) {

    provider[COMPONENT_TYPE] = componentType;

    if (options) {

        if (options.construct != null) {
            provider[CONSTRUCT] = Promise.resolve(options.construct);
        }

        if (options.inject != null) {
            provider[INJECT] = Promise.resolve(options.inject);
        }

        if (options.provider != null) {
            provider[PROVIDER] = options.provider;
        }

    }

    return provider;
}

class ProviderCollection {

    constructor (app, parent) {
        this.app = app;
        this.parent = parent || null;
        this.providers = new Map;
    }

    add (name, provider) {
        let provDef = this.providers.get(name);
        if (provDef === undefined) {
            provDef = {};
            this.providers.set(name, provDef);
        }

        provDef[provider[COMPONENT_TYPE] || SERVICE] = provider;
    }

    addProviders (providers) {
        if (!providers) return;
        if (Array.isArray(providers)) {
            providers.forEach(this.addProviders.bind(this));
        } else if (typeof providers === 'object') {
            Object.keys(providers).forEach((name) => this.add(name, providers[name]));
        }
    }

    get (name, type) {

        const isRoot = this.parent === null;
        let provider = this.providers.get(name);

        if (!provider) {
            if (isRoot) {
                throw new Error(`unknown provider: ${name}`);
            } else {
                return this.parent.get(name, type);
            }
        }

        provider = provider[type];

        if (!provider) {
            if (isRoot) {
                throw new Error(`unknown ${type} provider: ${name}`);
            } else {
                return this.parent.get(name, type);
            }
        }

        return {
            app: this.app,
            provider
        };

    }

}

class App {

    static Component (provider, options) {
        if (typeof provider === 'function') {
            return annotateProvider(provider, COMPONENT, options);
        } else {
            throw new Error('Component(..) needs a constructor/function as first parameter!');
        }
    }

    static Service (provider, options) {
        if (typeof provider === 'function') {
            return annotateProvider(provider, SERVICE, options);
        } else {
            throw new Error('Service(..) needs a constructor/function as first parameter!');
        }
    }

    constructor (options) {
        this.services = new Map;
        this.factories = {
            [COMPONENT]: new Map,
            [SERVICE]: new Map
        };
        const hasOptions = options != null;
        this.parent = hasOptions && options.parent ? options.parent : null;
        this.providers = new ProviderCollection(this, this.parent && this.parent.providers);
        if (hasOptions) {
            this.providers.addProviders(options.provider);
        }
    }

    /**
     * @return a promise which resolves to a service instance
     */
    service (name) {

        if (name === APP_SERVICE) {
            return this;
        }

        return this.factory(name, SERVICE)();

    }

    /**
     * @return a promise which resolves to a new entity (which is an instance of a component)
     */
    createEntity (name, options) {

        return Promise.resolve(this.factory(name, COMPONENT)(options));

    }

    /**
     * @return a function which returns a promise which resolves itself into a component
     */
    factory (name, type = COMPONENT) {

        if (name === APP_SERVICE) {
            return this;
        }

        try {
            return findOrCreateFactory(this, name, type);

        } catch (err) {
            if (name === PARENT_SERVICE) {
                return null;
            }
            throw err;
        }
    }

}

function findOrCreateFactory (app, name, type) {

    const factories = app.factories[type];
    let factory = factories.get(name);

    if (factory === undefined) {
        factory = createFactory(app, name, type);
        factories.set(name, factory);
    }

    return factory;

}

exports.COMPONENT = COMPONENT;
exports.SERVICE = SERVICE;
exports.APP_SERVICE = APP_SERVICE;
exports.App = App;
