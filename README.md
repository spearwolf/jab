
Usage Example (*work in progress*):

```javascript

    class Foo {

        constructor (plah, data) {
            this.plah = plah;
            this.data = data;
        }

    }

    App.Component(Foo, {  // a Component is like an ordinary class, you can create multiple entities from it
                          // (an entity is a instance of a Component)

        construct: ['plah', 'data!'],  // define the services which shall be used as arguments for Foo constructor
                                       // data has an exclamation mark, so the construction of Foo will be delayed
                                       // until 'data' is resolved

        inject: ['bar'],  // after object creation, add (create) these Components as properties to our object

        provider: {  // our Component has some extra providers which are not defined in the App
                     // providers are hierachical so they can override providers with same name from the App

            data: fetch('https://example.com/123.json')   // every Promise can be used as provider!

        }

    });


    class Plah { }
    // no annotations here!
    // without any annotations a class will be act as Service (which is a Compoment singelton)

    class Bar {
        constructor (parent) {
            this.foo = parent;

            return new Promise(resolve => setTimeout(resolve(this), 4));
        }
        // ooops, our constructor returns a Promise!
        // this will tell our App to wait for the Service initialization until the Promise
        // is resolved (with an instance of Bar as value)
    }

    App.Service(Bar, { construct: ['parent'] });  // Foo asks for 'bar' after object creation,
                                                  // so *parent* will be an instance of Foo in this case.


    const app = new App({
        provider: {
            foo: Foo,
            plah: Plah,
            bar: Bar,
        }
    });

    app.createEntity('foo').then(foo => {

        foo.plah().then(plah => {
            // do something with service plah
        });

        console.log(foo.data);  // log json data

        foo.bar().then(bar => {  // initialize Service Bar
            // do something fantastic with bar
        });

    });

```

