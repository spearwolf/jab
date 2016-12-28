import { COMPONENT, SERVICE } from './constants';
import constructComponent from './construct_component';

export default function createFactory (app, name, type) {

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

