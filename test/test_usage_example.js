import assert from 'assert';
import { App } from '../src';

const fetch = (url) => Promise.resolve({ url });

describe('Usage Example', () => {

    class Foo {

        constructor (plah, data) {
            this.plah = plah;
            this.data = data;
        }

    }

    App.Component(Foo, {  // a Component is like an ordinary class, you can create multiple entities from it
                          // (an entity is a instance of a Component)

        construct: ['plah', 'data!'],  // specify the arguments for the Foo constructor
                                       // data has an exclamation mark, so the construction of Foo will be delayed
                                       // until 'data' is resolved

        inject: ['bar', 'fooBar!'],  // after object creation, add more properties to our new object

        provider: {  // our component has some extra providers which are not defined in the App
                     // providers are hierachical so they can override providers with same name from the App

            data: fetch('https://example.com/123.json')   // every Promise can be used as provider!

        }

    });


    class Plah { }
    // no annotations here!
    // without any annotations a class will be act as Service (which is a Component singelton)

    class Bar {
        constructor () {
            return new Promise(resolve => setTimeout(resolve(this), 4));
        }
        // ooops, our constructor returns a Promise!
        // this will tell our App to wait for the Service initialization until the Promise
        // is resolved (with an instance of Bar as value)
    }

    App.Component(Bar);


    class FooBar {
        constructor (parent) {
            this.foo = parent;
        }
    }

    App.Component(FooBar, { construct: ['parent'] });   // Foo asks for 'fooBar' after object creation,
                                                        // so *parent* will be an instance of Foo in this case.

    const app = new App({
        provider: {
            foo: Foo,
            plah: Plah,
            bar: Bar,
            fooBar: FooBar,
        }
    });


    const check = cb => {
        return value => {
            let res = cb(value);
            if (res && res.then) {
                return res.then(() => value);
            } else {
                return value;
            }
        };
    };

    it('create entity foo', () => app.createEntity('foo')
        .then(check(foo => {

            assert(foo instanceof Foo);

        }))
        .then(check(foo => {

            assert.equal(typeof foo.plah, 'function');

            return foo.plah().then(plah => {

                assert(plah instanceof Plah);

            });
        }))
        .then(check(foo => {

            assert.equal(foo.data && foo.data.url, 'https://example.com/123.json');

        }))
        .then(check(foo => {

            assert.equal(typeof foo.bar, 'function');

            return foo.bar().then(bar => {

                assert(bar instanceof Bar);

            });
        }))
        .then(check(foo => {

            assert(foo.fooBar instanceof FooBar);
            assert.equal(foo.fooBar.foo, foo);

        }))
    );

    it('create entity fooBar', () => app.createEntity('fooBar')
        .then(fooBar => {
            assert.equal(fooBar.foo, null);
        })
    );

});
