
export const COMPONENT = 'component';
export const SERVICE = 'service';

export const APP_SERVICE = 'app';


export class App {

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
            return this;
        }

        return this.factory(name, SERVICE)();

    }

    factory (name, type = COMPONENT) {

        if (name === APP_SERVICE) {
            return this;
        }

        const factories = this.factories[type];
        let factory = factories.get(name);

        if (factory === undefined) {
            factory = createFactory(this, name, type);
            factories.set(name, factory);
        }

        return factory;

    }

}


function addProvider (app, name, provider) {

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

function createFactory (app, name, type) {

    if (name === APP_SERVICE) {
        return app;
    }

    let provider = app.providers.get(name);

    if (!provider) {
        throw new Error(`unknown provider: ${name}`);
    }

    provider = provider[type];

    if (!provider) {
        throw new Error(`unknown ${type} provider: ${name}`);
    }

    switch (type) {
        case SERVICE:
            return createServiceFactory(app, name, provider);
        case COMPONENT:
            return createComponentFactory(app, provider);
        default:
            throw new Error(`invalid provider type: ${type}`);
    }

}

function createServiceFactory (app, name, provider) {
    return function () {

        let instance = app.services.get(name);

        if (instance === undefined) {
            instance = constructComponent(app, provider);
            app.services.set(name, instance);
        }

        return instance;
    }
}

function createComponentFactory (app, provider) {
    return () => constructComponent(app, provider);
}

function constructComponent (app, provider) {
    let instance;
    let args;

    if (provider.inject) {
        args = provider.inject().map((name) => app.factory(name, SERVICE));
        instance = Reflect.construct(provider, args);
    } else {
        instance = new provider;
    }

    return instance;
}

function annotateProvider (provider, componentType, options) {
    provider.componentType = componentType;
    if (options) {
        if (Array.isArray(options.inject)) {
            provider.inject = () => options.inject;
        }
    }
    return provider;
}

