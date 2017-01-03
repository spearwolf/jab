import { SERVICE, COMPONENT_TYPE } from './constants';

export default class ProviderCollection {

    constructor (app, parent) {
        this.app = app;
        this.parent = parent || null;
        this.provider = new Map;
    }

    add (name, provider) {
        let provDef = this.provider.get(name);
        if (provDef === undefined) {
            provDef = {};
            this.provider.set(name, provDef);
        }

        provDef[provider[COMPONENT_TYPE] || SERVICE] = provider;
    }

    addProviders (provider) {
        if (typeof provider === 'object') {
            Object.keys(provider).forEach((name) => this.add(name, provider[name]));
        }
    }

    get (name, type) {

        const isRoot = this.parent === null;
        let provider = this.provider.get(name);

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

