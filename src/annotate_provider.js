import { COMPONENT_TYPE, CONSTRUCT, INJECT, PROVIDER } from './constants';

export default function annotateProvider (provider, componentType, options) {

    provider[COMPONENT_TYPE] = componentType;

    if (options) {

        if (options.construct != null) {
            provider[CONSTRUCT] = Promise.resolve(options.construct);
        }

        if (options.inject != null) {
            provider[INJECT] = Promise.resolve(options.inject);
        }

        if (options.provider != null) {
            provider[PROVIDER] = options.provider;
        }

    }

    return provider;
}
