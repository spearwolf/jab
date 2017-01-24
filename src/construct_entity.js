import App from './app';
import { PARENT_SERVICE, SERVICE, COMPONENT, CONSTRUCT, INJECT, PROVIDER, AFTER_INITIALIZED } from './constants';
import hasExclamationMark from './has_exclamation_mark';

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

export default function constructEntity (provider, extraProviders) {

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
