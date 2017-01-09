
Usage Example (*work in progress*):

```javascript

    class Foo {

        constructor (plah, data) {
            this.plah = plah;
            this.data = data;
        }

    }

    App.Component(Foo, {

        construct: ['plah', 'data!'],

        inject: ['bar'],

        provider: {

            data: () => fetch('https://example.com/123.json')

        }

    });


    class Plah { }


    class Bar {
        constructor (foo) {
            this.foo = foo;
        }
    }

    App.Service(Bar, { construct: ['parent'] });


    const app = new App({
        provider: {
            foo: Foo,
            plah: Plah,
            bar: Bar,
        }
    });

    app.createEntity('foo').then(foo => {

        foo.plah().then(plah => {
            // do someethig with service plah
        });

        console.log(foo.data);  // log json data

        console.log(foo.bar);

    });

```

