import { COMPONENT_TYPE, INJECT, PROVIDER } from './constants';

export default function annotateProvider (provider, componentType, options) {
    provider[COMPONENT_TYPE] = componentType;
    if (options) {
        if (Array.isArray(options.inject)) {
            provider[INJECT] = () => options.inject;
        }
        if (typeof options.provider === 'object') {
            provider[PROVIDER] = options.provider;
        }
    }
    return provider;
}

