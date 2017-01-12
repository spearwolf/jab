import { COMPONENT_TYPE, CONSTRUCT, INJECT, PROVIDER } from './constants';

export default function annotateProvider (provider, componentType, options) {
    provider[COMPONENT_TYPE] = componentType;
    if (options) {
        if (Array.isArray(options.construct)) {
            provider[CONSTRUCT] = () => options.construct;
        }
        if (Array.isArray(options.inject)) {
            provider[INJECT] = () => options.inject;
        }
        if (typeof options.provider === 'object') {
            provider[PROVIDER] = options.provider;
        }
    }
    return provider;
}

