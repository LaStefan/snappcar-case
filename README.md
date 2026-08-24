<p align="center">
  <img src="src/assets/snappcar-logo.svg" alt="SnappCar" width="220" />
</p>

# SnappCar - Car Search

![Angular 14](https://img.shields.io/badge/Angular-14-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.7-3178C6?logo=typescript&logoColor=white)
![RxJS](https://img.shields.io/badge/RxJS-7.5-B7178C?logo=reactivex&logoColor=white)
![Jasmine](https://img.shields.io/badge/Tests-Jasmine%20%2B%20Karma-8A4182)

An Angular 14 implementation of the SnappCar frontend challenge. The application searches the SnappCar API for cars near a supported city and automatically refreshes the results when the search criteria change.

The solution implements the requested behavior with a small feature-focused component structure, typed API models, and RxJS.

## Features

- Search from a predefined set of cities in the Netherlands and Germany.
- Wait 500 ms after typing before searching.
- Cancel an obsolete search when the city changes.
- Filter by a maximum distance of 3 km, 5 km, or 7 km.
- Sort by recommended, price, or distance in ascending or descending order.
- Refresh results automatically whenever a search parameter changes.
- Load additional results in batches of 10 with infinite scrolling.
- Preserve existing cars if loading a later page fails and allow retrying it.
- Present dedicated idle, loading, empty, unsupported-city, and error states.
- Display responsive car cards with image fallbacks and useful vehicle details.
- Respect reduced-motion preferences for loading animations.

Supported cities are currently Utrecht, Amsterdam, Eindhoven, Rotterdam, and Berlin. Their coordinates are deliberately hardcoded, as permitted by the challenge.

## Technology

- Angular 14 and Angular CLI 14
- TypeScript 4.7
- RxJS 7.5
- Angular Reactive Forms and `HttpClient`
- `ngx-infinite-scroll` 14
- Jasmine and Karma
- Plain HTML and CSS—no UI component framework

## Getting started

### Prerequisites

- [nvm](https://github.com/nvm-sh/nvm)
- Google Chrome or Chromium for the headless test suite

The project pins Node.js `16.20.2` in `.nvmrc`, keeping its tooling isolated from other local projects.

### Install and run

```bash
nvm install
nvm use
npm ci
npm start
```

Open [http://localhost:4200](http://localhost:4200).

Use `npm start` rather than opening the compiled files directly. Angular's development server uses [`proxy.conf.json`](proxy.conf.json) to forward `/v2` requests to `https://api.snappcar.nl`, avoiding browser CORS errors during local development.

## Available commands

```bash
# Start the development server with the API proxy
npm start

# Create an optimized production build in dist/snappcar-case
npm run build

# Run tests in interactive watch mode
npm test

# Run the test suite once in headless Chrome
npm test -- --watch=false --browsers=ChromeHeadless
```

The local proxy is a development convenience. A deployed build would require the hosting environment to provide an equivalent reverse proxy or API gateway.

## Architecture

```text
src/app/
├── app.component.*                         Application shell and header
└── car-search/
    ├── car-search.component.*              Search orchestration and view state
    ├── car-search.constants.ts             Cities, filters, and defaults
    ├── car-search.models.ts                API and UI types
    ├── services/
    │   └── car-search-api.service.ts        HTTP boundary
    ├── search-controls/                     Search form controls
    ├── search-results/                      Result states and infinite scrolling
    └── car-card/                            Individual car presentation
```

`CarSearchComponent` is the feature's smart/container component. It owns the reactive controls, combines their changes, requests pages, and exposes one observable view state. The remaining components are focused on presentation and communicate through inputs and outputs.

The API service is kept inside the feature because it serves only car search. It uses `providedIn: 'root'`, allowing Angular to create a single tree-shakable service instance without manual provider registration.

All feature components use `ChangeDetectionStrategy.OnPush`. Their data flows through observables and immutable state objects, so Angular can avoid unnecessary checks while keeping change detection predictable.

## Reactive search flow

The main RxJS choices are intentional:

- `debounceTime(500)` implements the typing delay.
- `distinctUntilChanged()` prevents duplicate searches.
- `combineLatest()` refreshes results when any filter changes.
- Outer `switchMap()` cancels an obsolete city/filter search.
- Inner `exhaustMap()` ignores repeated scroll events while a page is loading.
- `scan()` accumulates paginated responses into one view state.
- Inner `catchError()` converts request failures into UI state without terminating the search stream.

This keeps cancellation, pagination, and error recovery in one declarative pipeline without requiring NgRx or a custom state-management service.

## Error handling

- Unsupported cities are rejected before an API request is made.
- Initial request failures display a dedicated error state.
- Pagination failures preserve previously loaded results.
- A failed page keeps its offset, so retrying cannot skip cars.
- Empty API responses are distinct from request errors.
- Broken or missing car images display a fallback instead of a broken image.
- Extra scroll events are ignored while a request is active.

Automatic retries were intentionally not added. Retrying indefinitely could create unnecessary traffic and hide persistent API failures; for this challenge, an explicit retry for pagination and a new request after changing a parameter are simpler and more predictable.

## Testing

The unit tests cover:

- API URL and query-parameter construction.
- Search debounce and input normalization.
- Cancellation of obsolete requests.
- Automatic refresh after filter changes.
- Unsupported, empty, loading, success, and error states.
- Pagination offsets, result accumulation, concurrency protection, and retry behavior.
- Presentation behavior for controls, results, cards, and image fallback.

## Dependency choice

`ngx-infinite-scroll@14.0.1` is the only additional runtime dependency. It is pinned to an Angular 14-compatible release and handles scroll observation, throttling, and cleanup. The application still owns the actual pagination state, offset calculation, concurrency behavior, and API requests.

Using this small dependency avoids maintaining custom window listeners for behavior that is not specific to the business domain.
