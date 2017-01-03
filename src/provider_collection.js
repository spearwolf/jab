import { SERVICE } from './constants';

export default class ProviderCollection {

    constructor (parent) {
        this.parent = parent || null;
        this.providers = new Map;
    }

    add (name, provider) {
        let provDef = this.providers.get(name);
        if (provDef === undefined) {
            provDef = {};
            this.providers.set(name, provDef);
        }

        provDef[provider.componentType || SERVICE] = provider;
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

        return provider;

    }

}

