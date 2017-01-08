import { SERVICE, COMPONENT_TYPE } from './constants';

export default class ProviderCollection {

    constructor (app, parent) {
        this.app = app;
        this.parent = parent || null;
        this.providers = new Map;
    }

    add (name, provider) {
        let provDef = this.providers.get(name);
        if (provDef === undefined) {
            provDef = {};
            this.providers.set(name, provDef);
        }

        provDef[provider[COMPONENT_TYPE] || SERVICE] = provider;
    }

    addProviders (providers) {
        if (!providers) return;
        if (Array.isArray(providers)) {
            providers.forEach(this.addProviders.bind(this));
        } else if (typeof providers === 'object') {
            Object.keys(providers).forEach((name) => this.add(name, providers[name]));
        }
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

        return {
            app: this.app,
            provider
        };

    }

}

