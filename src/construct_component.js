import { SERVICE } from './constants';

export default function constructComponent (app, provider) {
    let instance;
    let args;

    if (provider.inject) {
        args = provider.inject().map((name) => app.factory(name, SERVICE));
        instance = Reflect.construct(provider, args);
    } else {
        instance = new provider;
    }

    return Promise.resolve(instance);
}

