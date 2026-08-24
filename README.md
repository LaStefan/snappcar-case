# SnappCar Case

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.13.

## Angular 14 HTTP compatibility

This challenge intentionally targets Angular 14. The application therefore imports `HttpClientModule` in `AppModule`, which is the supported way to configure `HttpClient` in this Angular version.

Current Angular documentation marks `HttpClientModule` as deprecated and recommends `provideHttpClient(withInterceptorsFromDi())`. That provider API is not available in the Angular 14 packages used by this project, so applying the newer recommendation here would be incompatible with the challenge's required framework version.

If the application is upgraded to a modern Angular version, the HTTP configuration should be revisited and migrated to `provideHttpClient` as part of that framework upgrade.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
