import { COMPONENT, SERVICE, APP_SERVICE } from './constants';
import createFactory from './create_factory';
import annotateProvider from './annotate_provider';
import ProviderCollection from './provider_collection';

export default class App {

    static Component (provider, options) {
        if (typeof provider === 'function') {
            return annotateProvider(provider, COMPONENT, options);
        } else {
            throw new Error('Component(..) needs a constructor/function as first parameter!');
        }
    }

    static Service (provider, options) {
        if (typeof provider === 'function') {
            return annotateProvider(provider, SERVICE, options);
        } else {
            throw new Error('Service(..) needs a constructor/function as first parameter!');
        }
    }

    constructor (options) {
        this.services = new Map;
        this.factories = {
            [COMPONENT]: new Map,
            [SERVICE]: new Map
        };
        const hasOptions = options != null;
        this.parent = hasOptions && options.parent ? options.parent : null;
        this.providers = new ProviderCollection(this, this.parent && this.parent.providers);
        if (hasOptions) {
            this.providers.addProviders(options.provider);
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

    createEntity (name, options) {

        return Promise.resolve(this.factory(name, COMPONENT)(options));

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

