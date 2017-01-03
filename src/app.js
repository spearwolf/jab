import { COMPONENT, SERVICE, APP_SERVICE } from './constants';
import createFactory from './create_factory';
import annotateProvider from './annotate_provider';
import ProviderCollection from './provider_collection';

export default class App {

    static Component (provider, options) {
        return annotateProvider(provider, COMPONENT, options);
    }

    static Service (provider, options) {
        return annotateProvider(provider, SERVICE, options);
    }

    constructor (providers) {
        this.services = new Map;
        this.factories = {
            [COMPONENT]: new Map,
            [SERVICE]: new Map
        };
        this.providers = new ProviderCollection;
        if (providers) {
            Object.keys(providers).forEach((name) => this.providers.add(name, providers[name]));
        }
    }

    /**
     * @return a promise which resolves to a service instance
     */
    service (name) {

        if (name === APP_SERVICE) {
            return this;
        }

        return this.factory(name, SERVICE)();

    }

    /**
     * @return a function which returns a promise which resolves itself into a component
     */
    factory (name, type = COMPONENT) {

        let factory;
        if (name === APP_SERVICE) {
            factory = this;
        } else {

            const factories = this.factories[type];
            factory = factories.get(name);

            if (factory === undefined) {
                factory = createFactory(this, name, type);
                factories.set(name, factory);
            }
        }

        return factory;

    }

}

