import { modules, routes } from './routes';

export class Router {
    private routes: { [key: string]: string };

    static build(module: string, controller: string): Router {
        return new Router(module, controller);
    }

    private constructor(private module: string, private _controller: string) {
        if (!modules.hasOwnProperty(module)) {
            throw new Error(`The module '${module}' is not defined in the app`);
        }
        if (!routes[module].hasOwnProperty(_controller)) {
            throw new Error(
                `The module '${module}' does not implement '${_controller}' controller`,
            );
        }
        this.module = modules[module];
        this.routes = routes[this.module][this._controller];
    }

    controller(): string {
        return `${this.module}/${this._controller}`;
    }

    method(alias: string): string {
        if (!this.routes.hasOwnProperty(alias)) {
            throw new Error(
                `The alias '${alias}' in the module '${this.module}'` +
                    ` and controller '${this._controller}' does not exist`,
            );
        }
        return this.routes[alias];
    }

    index(): string {
        return '/';
    }

    id(): string {
        return '/:id';
    }
}
