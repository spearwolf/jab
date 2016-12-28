//import { SERVICE } from './constants';

export default function constructComponent (app, provider) {
    let instance;
    let args;

    if (provider.inject) {
        //args = provider.inject().map((name) => app.factory(name, SERVICE));
        args = provider.inject().map((name) => app.service(name));
        instance = Reflect.construct(provider, args);
    } else {
        instance = new provider;
    }

    return instance;
}

