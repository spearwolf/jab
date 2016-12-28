import { COMPONENT, SERVICE, APP_SERVICE } from './constants';
import addProvider from './add_provider';
import createFactory from './create_factory';
import annotateProvider from './annotate_provider';

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
        if (providers) {
            Object.keys(providers).forEach((name) => addProvider(this, name, providers[name]));
        }
    }

    service (name) {

        if (name === APP_SERVICE) {
            return Promise.resolve(this);
        }

        return this.factory(name, SERVICE).then(construct => construct());
        //return this.factory(name, SERVICE)();

    }

    factory (name, type = COMPONENT) {

        let factory;
        if (name === APP_SERVICE) {
            factory = () => this;
        } else {

            const factories = this.factories[type];
            factory = factories.get(name);

            if (factory === undefined) {
                factory = createFactory(this, name, type);
                factories.set(name, factory);
            }
        }

        return Promise.resolve(factory);
        //return factory;

    }

}

