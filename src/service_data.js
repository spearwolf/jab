import { App } from './app';

class ServiceData {

    constructor (app, http) {
        this.app = app;
        this.http = http;
    }

}

export default App.Service(
    ServiceData, {
        inject: ['app', 'http']
    });

