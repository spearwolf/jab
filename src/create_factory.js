import { COMPONENT, SERVICE } from './constants';
import constructComponent from './construct_component';

export default function createFactory (app, name, type) {

    let provider = app.provider.get(name, type);

    switch (type) {
        case SERVICE:
            return createServiceFactory(name, provider);
        case COMPONENT:
            return createComponentFactory(provider);
        default:
            throw new Error(`invalid provider type: ${type}`);
    }

}

function createServiceFactory (name, provider) {
    return () => {

        const services = provider.app.services;
        let instance = services.get(name);

        if (instance === undefined) {
            instance = constructComponent(provider);
            services.set(name, instance);
        }

        return instance;
    }
}

function createComponentFactory (provider) {
    return () => constructComponent(provider);
}

