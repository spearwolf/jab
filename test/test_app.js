import assert from 'assert';
import { App, SERVICE, COMPONENT } from '../src';
import ServiceData from './service_data';
import ServiceHttp from './service_http';
import Foo from './foo';

describe('Test App', () => {

    let app = new App({
        provider: {
            'data': ServiceData,
            'http': ServiceHttp,
            'foo': Foo,
        }
    });

    it('should have some service provider', () => {

        assert.equal(ServiceData, app.provider.get('data', SERVICE).provider);

    });

    it('should return a service instance', () => {

        return app.service('data').then((data) => {

            assert(data instanceof ServiceData);

        });

    });

    it('default provider type is service', () => {

        return app.service('foo').then((foo) => {

            assert(foo instanceof Foo);
            assert.throws(() => app.factory('foo', COMPONENT));

        });

    });

    it('service instances are singletons', () => {

        let _a = app.service('data');
        let _b = app.service('data');
        let _c = app.service('data');

        return Promise.all([_a, _b, _c]).then((services) => {

            let [a, b, c] = services;

            assert(a instanceof ServiceData, 'a instanceof ServiceData');
            assert(b instanceof ServiceData, 'b instanceof ServiceData');
            assert(c instanceof ServiceData, 'c instanceof ServiceData');
            assert(a === b, 'a === b');
            assert(a === c, 'a === c');

        });

    });

    it('data-service instance should have the app reference as property', () => {

        return app.service('data').then((data) => {

            assert.equal(data.app, app);

        });

    });

    it('data-service instance should have the http-service as property', () => {

        return app.service('data').then((data) => {

            assert(data.http instanceof ServiceHttp, 'data.http instanceof ServiceHttp');
            assert.equal(data.http.ajax(), 23);

        });

    });

    it('service() throws an error when provider is unknown', () => {

        assert.throws(() => app.service('xyz122'));

    });

    it('factory() throws an error when provider is unknown', () => {

        assert.throws(() => app.factory('xyz126', SERVICE));
        assert.throws(() => app.factory('xyz127', COMPONENT));

    });

});

