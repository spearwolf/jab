import App from './app';
import { SERVICE, INJECT, PROVIDER } from './constants';

export default function constructComponent (provider) {

    const _provider = provider.provider;

    const app = _provider[PROVIDER] ? new App({
        parent: provider.app,
        provider: _provider[PROVIDER]
    }) : provider.app;

    let instance;

    if (_provider[INJECT]) {
        const args = _provider[INJECT]().map((name) => app.factory(name, SERVICE));
        instance = Reflect.construct(_provider, args);
    } else {
        instance = new _provider;
    }

    return Promise.resolve(instance);

}

