
Usage Example (*work in progress*):

```javascript

    class Foo {

        constructor (plah, data) {
            this.plah = plah;
            this.data = data;
        }

    }

    App.Component(Foo, {  // A Component is like an ordinary class, you can create multiple entities from it
                          // (an Entity is an instance of a Component)

        construct: ['plah', 'data!'], // Define the services which shall be used as arguments for Foo constructor
                                      // data has an exclamation mark, so the construction of Foo will be delayed
                                      // until 'data' is resolved

        inject: ['bar', 'fooBar!'],  // After object creation, add (create) these Components
                                     // as properties to our object

        // Remember: construct services & inject components

        provider: {  // our Component has some extra providers which are not defined in the App
                     // providers are hierachical so they can override providers with same name from the App

            data: fetch('https://example.com/123.json')   // Every Promise can be used as provider!

        }

    });


    class Plah { }
    // no annotations here!
    // without any annotations a class will be act as Service (which is a Compoment singelton)

    class Bar {
        constructor () {
            return new Promise(resolve => setTimeout(resolve(this), 4));
        }
        // ooops, our constructor returns a Promise!
        // this will tell our App to wait for the Service initialization until
        // the Promise is resolved (with an instance of Bar as value)

        afterInitialized () {               // [optional] will be called after object construction
            console.log('4ms later..');
            
            return new Promise(resolve => setTimeout(resolve(this), 4));
                                            // returning a Promise is optional but very helpful
                                            // when you want to do some async stuff here
        }
    }

    App.Component(Bar);


    class FooBar {
        constructor (parent) {
            this.foo = parent;
        }
    }

    App.Service(FooBar, { construct: ['parent'] })  // Foo asks for 'fooBar' after object creation,
                                                    // so *parent* will be an instance of Foo in this case,
                                                    // otherwise *parent* will be null


    const app = new App({
        provider: {
            foo    : Foo,
            plah   : Plah,
            bar    : Bar,
            fooBar : FooBar
        }
    });

    app.createEntity('foo').then(foo => {

        foo.plah().then(plah => {
            // do something with service plah
        });

        console.log(foo.data);  // log json data

        foo.bar().then(bar => {  // create a new Bar entity
            // [8ms later] do something fantastic with bar
        });

        console.log(foo.fooBar);  // fooBar is an initialized FooBar entity

    });

```

