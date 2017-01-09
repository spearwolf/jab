import App from './app';
import { SERVICE, INJECT, PROVIDER } from './constants';
import hasExclamationMark from './has_exclamation_mark';

export default function constructEntity (provider, extraProviders) {

    const _provider = provider.provider;
    let instance;

    if (typeof _provider === 'function') {

        if (_provider[INJECT]) {

            const app = _provider[PROVIDER] || extraProviders ? new App({
                parent: provider.app,
                provider: [_provider[PROVIDER], extraProviders]
            }) : provider.app;

            const getServiceFactory = name => app.factory(name, SERVICE, extraProviders);

            const injectProviders = _provider[INJECT]();

            const waitForFactories = injectProviders.filter(hasExclamationMark).map(providerName => {
                const name = providerName.substring(0, providerName.length - 1);
                let factory = getServiceFactory(name);
                if (typeof factory === 'function') {
                    factory = factory();
                }
                return Promise.resolve(factory).then(value => {
                    return {
                        providerName,
                        value
                    };
                });
            });

            if (waitForFactories.length) {

                instance = Promise.all(waitForFactories).then(factories => {

                    const resolvedFactories = {};
                    factories.forEach(factory => {
                        resolvedFactories[factory.providerName] = factory.value;
                    });

                    const args = injectProviders.map((providerName) => resolvedFactories[providerName] || getServiceFactory(providerName));
                    return Reflect.construct(_provider, args);

                });

            } else {

                instance = Reflect.construct(_provider, injectProviders.map(getServiceFactory));

            }

        } else {
            instance = new _provider;
        }

        instance = Promise.resolve(instance);

    } else {
        instance = _provider;
    }

    return instance;

}

