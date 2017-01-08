import { COMPONENT, SERVICE } from './constants';
import constructEntity from './construct_entity';

export default function createFactory (app, name, type) {

    const provider = app.providers.get(name, type);

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
            instance = constructEntity(provider);
            services.set(name, instance);
        }

        return instance;
    }
}

function createComponentFactory (provider) {
    return constructEntity.bind(null, provider);
}

