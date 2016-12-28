import { App } from '../src';

class ServiceHttp {

    constructor () {
        // delay initialization
        return new Promise((resolve) => setTimeout(() => {
            resolve(this);
        }, 4));
    }

    ajax () {
        return 23;
    }

}

export default App.Service(ServiceHttp);
