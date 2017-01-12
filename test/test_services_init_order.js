import assert from 'assert';
import { App } from '../src';

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

App.Service(ServiceA, { construct: ['b'] });

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

class ServiceC {
    constructor (d) {
        this.d = d;
        testValues.push('g');
    }
}

App.Service(ServiceC, { construct: ['d!'] });

class ServiceD {
    constructor () {
        testValues.push('e');
        return new Promise((resolve) => {
            setTimeout(() => {
                testValues.push('f');
                resolve(this);
            }, 16);
        });
    }
}

describe('Initialization order', () => {

    let app = new App({
        provider: {
            'a': ServiceA,
            'b': ServiceB,
            'c': ServiceC,
            'd': ServiceD
        }
    });

    it('service getters should be lazy evaluated', () => {

        return app.service('a').then(a => {

            assert.equal(testValues.length, 1);
            assert.equal(testValues[0], 'a');

            return a.foo().then(() => {
                assert.equal(testValues.length, 4);
                assert.equal(testValues[1], 'b');
                assert.equal(testValues[2], 'c');
                assert.equal(testValues[3], 'd');

            });

        }).then(() => app.service('c').then(() => {

            assert.equal(testValues.length, 7);
            assert.equal(testValues[4], 'e');
            assert.equal(testValues[5], 'f');
            assert.equal(testValues[6], 'g');

        }));

    });

});

