import App from './app';
import { PARENT_SERVICE, SERVICE, COMPONENT, CONSTRUCT, INJECT, PROVIDER, AFTER_INITIALIZED } from './constants';
import hasExclamationMark from './has_exclamation_mark';

const resolve = (value) => value && typeof value.then === 'function' ? value : Promise.resolve(value);

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
            return resolve(factory).then(value => {
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

            const getServiceFactory = name => initializedServices[name] || app.factory(name, SERVICE);
            const constructProviders = _provider[CONSTRUCT]();
            const createInstance = (fn) => Reflect.construct(fn, constructProviders.map(getServiceFactory));
            const constructFactories = waitForAndCallFactories(
                constructProviders.filter(isExclamizedName),
                getServiceFactory);

            if (constructFactories.length) {
                instance = Promise.all(constructFactories).then(factories => {
                    copyFactories(factories, initializedServices);
                    return createInstance(_provider);
                });
            } else {
                instance = createInstance(_provider);
            }

        } else {
            instance = new _provider;
        }

        instance = resolve(instance);

        if (_provider[INJECT]) {

            const initializedComponents = {};
            const getComponentFactory = name => initializedComponents[name] || app.factory(name, COMPONENT);
            const injectProviders = _provider[INJECT]();

            if (injectProviders.length) {
                instance = instance.then(entity => {

                    const injectFactories = waitForAndCallFactories(
                        injectProviders.filter(name => hasExclamationMark(name) && !initializedComponents[name]),
                        getComponentFactory,
                        { [PARENT_SERVICE]: entity });

                    if (injectFactories.length) {
                        return Promise.all([entity, Promise.all(injectFactories)]).then(value => {
                            copyFactories(value[1], initializedComponents);
                            return value[0];
                        });
                    } else {
                        return entity;
                    }

                }).then(entity => {

                    injectProviders.forEach(providerName => {
                        const name = hasExclamationMark(providerName) ? plainName(providerName) : providerName;
                        Object.defineProperty(entity, name, {
                            value: getComponentFactory(providerName)
                        });
                    });

                    return entity;
                });
            }

        }

        instance = instance.then(entity => {
            const fn = entity[AFTER_INITIALIZED];
            if (typeof fn === 'function') {
                return resolve(fn.call(entity)).then(() => entity);
            } else {
                return entity;
            }
        });

    } else {
        instance = _provider;
    }

    return instance;

}

