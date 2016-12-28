import { App } from '../src';

class ServiceData {

    constructor (app, http) {
        return init(this, app, http);
    }

}

async function init (service, app, http) {

    service.app = await app;
    service.http = await http;

    return service;
}

export default App.Service(
    ServiceData, {
        inject: ['app', 'http']
    });

