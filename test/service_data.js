import { App } from '../src';

class ServiceData {

    constructor (app, http) {

        this.app = app;

        return init(this, http());

    }

}

async function init (service, http) {

    service.http = await http;

    return service;

}

export default App.Service(
    ServiceData, {
        inject: ['app', 'http']
    });

