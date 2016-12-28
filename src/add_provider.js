import { SERVICE } from './constants';

export default function addProvider (app, name, provider) {

    let providers = app.providers;
    if (providers === undefined) {
        app.providers = providers = new Map;
    }

    let provDef = providers.get(name);
    if (provDef === undefined) {
        provDef = {};
        providers.set(name, provDef);
    }

    provDef[provider.componentType || SERVICE] = provider;

}

