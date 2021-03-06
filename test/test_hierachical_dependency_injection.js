import assert from 'assert';
import { App } from '../src';

class ServiceA {
    constructor (app) {
        this.app = app;
    }
}
App.Service(ServiceA, { construct: ['app'] });

class ServiceB {
    constructor (app) {
        this.app = app;
    }
}
App.Service(ServiceB, { construct: ['app'] });

class ServiceC {
    constructor (app, a) {
        this.app = app;
        this.a = a();
    }
}
App.Service(ServiceC, { construct: ['app', 'a'] });

class ServiceD {
    constructor (app, a, c) {
        this.app = app;
        this.a = a();
        this.c = c();
    }
}
App.Service(ServiceD, { construct: ['app', 'a', 'c'], provider: { a: ServiceB, x: ServiceA }});


describe('Hierachical provider dependency injection example', () => {

    let app = new App({
        provider: {
            'a': ServiceA,
            'c': ServiceC,
            'd': ServiceD
        }
    });

    it('service :c should has a reference to ServiceA', () => {

        return app.service('c')
            .then(c => c.a)
            .then(a => {
                assert(a instanceof ServiceA);
            });

    });

    it('service :d should has a reference to ServiceB', () => {

        return app.service('d')
            .then(d => d.a)
            .then(a => {
                assert(a instanceof ServiceB);
            });

    });

    it('service :c is same singelton reference as from :app and :d', () => {

        return Promise.all([
            app.service('c'),
            app.service('d').then(d => d.c),
            app.service('d').then(d => d.app.service('c'))
        ]).then(s => {
            assert.equal(s[0], s[1]);
            assert.equal(s[1], s[2]);
        });

    });

    it('service :d and :d.a should have same app reference', () => {

        return Promise.all([
            app.service('d').then(d => d.app),
            app.service('d').then(d => d.a).then(b => b.app)
        ]).then(s => {
            assert.equal(s[0], s[1]);
        });

    });

    it('service :a and :c.a should have same app reference', () => {

        return Promise.all([
            app.service('a').then(a => a.app),
            app.service('c').then(c => c.a).then(a => a.app)
        ]).then(s => {
            assert.equal(s[0], s[1]);
        });

    });

    it('service :d and :a should have different app references', () => {

        return Promise.all([
            app.service('d').then(d => d.app),
            app.service('a').then(a => a.app)
        ]).then(s => {
            assert.notEqual(s[0], s[1]);
        });

    });

    it('service :a and :d.x should be different instances of ServiceA', () => {

        return Promise.all([
            app.service('a'),
            app.service('d').then(d => d.app.service('x'))
        ]).then(s => {
            assert.notEqual(s[0], s[1], 'a and d.x should NOT be the same instance');
            assert(s[0] instanceof ServiceA, 'a should be instance of ServiceA');
            assert(s[1] instanceof ServiceA, 'd.x should be instance of ServiceA');
        });

    });

});

