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

describe('Initialization order', () => {

    let app = new App({
        'a': ServiceA,
        'b': ServiceB
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

        });

    });

});

