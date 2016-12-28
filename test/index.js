import assert from 'assert';
import { App, SERVICE, COMPONENT } from '../src';
import ServiceData from './service_data';
import ServiceHttp from './service_http';
import Foo from './foo';

let testValues = [];

class ServiceA {
    constructor (b) {
        this.b = b;
        testValues.push('a');
    }
    foo () {
        return this.b().then((b) => {
            testValues.push('d');
            return b;
        });
    }
}

App.Service(ServiceA, { inject: ['b'] });

class ServiceB {
    constructor () {
        testValues.push('b');
        return new Promise((resolve) => {
            setTimeout(() => {
                testValues.push('c');
                resolve(this);
            }, 16);
        });
    }
}

describe('App', () => {

    let app = new App({
        'data': ServiceData,
        'http': ServiceHttp,
        'foo': Foo,
        'a': ServiceA,
        'b': ServiceB
    });

    it('should have some service providers', () => {

        assert.equal(ServiceData, app.providers.get('data')[SERVICE]);

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

    it('data-service instance should have an app getter as property', () => {

        return app.service('data').then((data) => {

            assert.equal(data.app, app);

        });

    });

    it('data-service instance should have a http getter as property', () => {

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

    it('service initialization order', () => {

        return app.service('a').then(a => {

            assert.equal(testValues.length, 1);
            assert.equal(testValues[0], 'a');

            return a.foo().then(() => {
                assert.equal(testValues.length, 4);
                assert.equal(testValues[1], 'b');
                assert.equal(testValues[2], 'c');
                assert.equal(testValues[3], 'd');
            });

        });

    });

});

