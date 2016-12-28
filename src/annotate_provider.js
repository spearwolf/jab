
export default function annotateProvider (provider, componentType, options) {
    provider.componentType = componentType;
    if (options) {
        if (Array.isArray(options.inject)) {
            provider.inject = () => options.inject;
        }
    }
    return provider;
}

