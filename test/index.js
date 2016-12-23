import assert from 'assert';
import { App, SERVICE, COMPONENT } from '../src/app';
import ServiceData from './service_data';
import ServiceHttp from './service_http';
import Foo from './foo';

describe('App', () => {

    let app = new App({
        'data': ServiceData,
        'http': ServiceHttp,
        'foo': Foo
    });

    it('should have some service providers', () => {

        assert.equal(ServiceData, app.providers.get('data')[SERVICE]);

    });

    it('should return a service instance', () => {

        let data = app.service('data');

        assert(data instanceof ServiceData);

    });

    it('default provider type is service', () => {

        let foo = app.service('foo');
        assert(foo instanceof Foo);
        assert.throws(() => app.factory('foo', COMPONENT));

    });

    it('service instances are singletons', () => {

        let a = app.service('data');
        let b = app.service('data');
        let c = app.service('data');

        assert(a instanceof ServiceData);
        assert(b instanceof ServiceData);
        assert(c instanceof ServiceData);
        assert(a === b);
        assert(a === c);

    });

    it('data-service instance should have an app property', () => {

        let data = app.service('data');

        assert.equal(data.app, app);

    });

    it('data-service instance should have a http getter as property', () => {

        let data = app.service('data');

        assert(typeof data.http === 'function');

        let http = data.http();

        assert.equal(http.ajax(), 23);

    });

    it('service() throws an error when provider is unknown', () => {

        assert.throws(() => app.service('xyz122'));

    });

    it('factory() throws an error when provider is unknown', () => {

        assert.throws(() => app.factory('xyz126', SERVICE));
        assert.throws(() => app.factory('xyz127', COMPONENT));

    });

});

