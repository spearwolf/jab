import App from './app';
import { SERVICE, INJECT, PROVIDER } from './constants';

export default function constructEntity (provider, extraProviders) {

    const _provider = provider.provider;
    let instance;

    if (typeof _provider === 'function') {

        if (_provider[INJECT]) {

            const app = _provider[PROVIDER] || extraProviders ? new App({
                parent: provider.app,
                provider: [_provider[PROVIDER], extraProviders]
            }) : provider.app;

            const args = _provider[INJECT]().map((name) => app.factory(name, SERVICE));
            instance = Reflect.construct(_provider, args);

        } else {
            instance = new _provider;
        }

        instance = Promise.resolve(instance);

    } else {
        instance = _provider;
    }

    return instance;

}

