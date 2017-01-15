import assert from 'assert';
import { App } from '../src';

const wait = (ms, value) => new Promise(resolve => setTimeout(() => resolve(value), 16));

describe('Component lifecycle events', () => {

    class Foo {

        constructor () {
            this.afterInitializedCallCount = 0;
            return wait(16, this);
        }

        afterInitialized () {
            this.afterInitializedCallCount += 1;
            return wait(16);
        }

    }

    class Bar {

        constructor () {
            this.afterInitializedCallCount = 0;
            return wait(16, this);
        }

        afterInitialized () {
            this.afterInitializedCallCount += 1;
        }

    }

    class Plah {

        constructor () {
            this.afterInitializedCallCount = 0;
        }

        afterInitialized () {
            this.afterInitializedCallCount += 1;
        }

    }

    class Zack {

        constructor () {
            this.afterInitializedCallCount = 0;
        }

    }

    const app = new App({
        provider: {
            foo  : App.Component(Foo),
            bar  : App.Component(Bar),
            plah : App.Component(Plah),
            zack : App.Component(Zack),
        }
    });


    it('afterInitialized; with constructor:promise and afterInitialized:promise', () => app.createEntity('foo').then(foo => {
        assert.equal(foo.afterInitializedCallCount, 1);
        assert(foo instanceof Foo);
    }));

    it('afterInitialized; with constructor:promise and afterInitialized:return', () => app.createEntity('bar').then(bar => {
        assert.equal(bar.afterInitializedCallCount, 1);
        assert(bar instanceof Bar);
    }));

    it('afterInitialized; with constructor:return and afterInitialized:return', () => app.createEntity('plah').then(plah => {
        assert.equal(plah.afterInitializedCallCount, 1);
        assert(plah instanceof Plah);
    }));

    it('afterInitialized; with constructor:return and afterInitialized:none', () => app.createEntity('zack').then(zack => {
        assert.equal(zack.afterInitializedCallCount, 0);
        assert(zack instanceof Zack);
    }));

});
