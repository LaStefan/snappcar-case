import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  Observable,
  of,
  scan,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import {
  DEFAULT_MAX_DISTANCE,
  DEFAULT_SORT,
  DEFAULT_SORT_ORDER,
  INITIAL_SEARCH_STATE,
  PAGE_SIZE,
  SUPPORTED_CITIES,
} from './car-search.constants';
import {
  CarSearchResponse,
  CarSearchViewState,
  MaxDistance,
  SortOption,
  SortOrder,
  SupportedCity,
} from './car-search.models';
import { CarSearchApiService } from './services/car-search-api.service';

type SearchPageEvent =
  | {
      readonly type: 'loading';
      readonly offset: number;
    }
  | {
      readonly type: 'success';
      readonly offset: number;
      readonly response: CarSearchResponse;
    }
  | {
      readonly type: 'error';
      readonly offset: number;
    };

@Component({
  selector: 'app-car-search',
  templateUrl: './car-search.component.html',
  styleUrls: ['./car-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarSearchComponent {
  readonly supportedCities = SUPPORTED_CITIES;

  readonly cityControl = new FormControl('', {
    nonNullable: true,
  });

  readonly maxDistanceControl = new FormControl<MaxDistance>(
    DEFAULT_MAX_DISTANCE,
    {
      nonNullable: true,
    },
  );

  readonly sortControl = new FormControl<SortOption>(DEFAULT_SORT, {
    nonNullable: true,
  });

  readonly sortOrderControl = new FormControl<SortOrder>(DEFAULT_SORT_ORDER, {
    nonNullable: true,
  });

  readonly searchState$: Observable<CarSearchViewState>;
  private readonly loadMoreSubject = new Subject<void>();

  constructor(private readonly carSearchApiService: CarSearchApiService) {
    this.searchState$ = this.createSearchState();
  }

  loadMore(): void {
    this.loadMoreSubject.next();
  }

  private createSearchState(): Observable<CarSearchViewState> {
    const cityName$ = this.cityControl.valueChanges.pipe(
      map((cityName) => cityName.trim().toLowerCase()),
      debounceTime(500),
      distinctUntilChanged(),
    );

    const maxDistance$ = this.maxDistanceControl.valueChanges.pipe(
      startWith(this.maxDistanceControl.value),
      distinctUntilChanged(),
    );

    const sort$ = this.sortControl.valueChanges.pipe(
      startWith(this.sortControl.value),
      distinctUntilChanged(),
    );

    const sortOrder$ = this.sortOrderControl.valueChanges.pipe(
      startWith(this.sortOrderControl.value),
      distinctUntilChanged(),
    );

    return combineLatest([cityName$, maxDistance$, sort$, sortOrder$]).pipe(
      switchMap(
        ([
          normalizedName,
          maxDistance,
          sort,
          sortOrder,
        ]): Observable<CarSearchViewState> => {
          if (!normalizedName) {
            return of(INITIAL_SEARCH_STATE);
          }

          const city = this.supportedCities.find(
            (supportedCity) =>
              supportedCity.name.toLowerCase() === normalizedName,
          );

          if (!city) {
            return of({
              status: 'unsupported-city',
              results: [],
              totalResults: 0,
            });
          }

          return this.searchPages(city, maxDistance, sort, sortOrder);
        },
      ),

      startWith(INITIAL_SEARCH_STATE),
    );
  }

  private searchPages(
    city: SupportedCity,
    maxDistance: MaxDistance,
    sort: SortOption,
    sortOrder: SortOrder,
  ): Observable<CarSearchViewState> {
    let nextOffset = 0;
    let hasMore = true;

    return this.loadMoreSubject.pipe(
      // Load the first page automatically.
      startWith(undefined),
      // Stop requesting once every result is loaded.
      filter(() => hasMore),
      // Ignore additional scroll events while a request is already running.
      exhaustMap(() => {
        const offset = nextOffset;

        const loadingEvent: SearchPageEvent = {
          type: 'loading',
          offset,
        };

        return this.carSearchApiService
          .search({
            country: city.country,
            latitude: city.latitude,
            longitude: city.longitude,
            maxDistance,
            sort,
            order: sortOrder,
            limit: PAGE_SIZE,
            offset,
          })
          .pipe(
            tap((response) => {
              nextOffset += PAGE_SIZE;

              hasMore = nextOffset < response.sums.totalResults;
            }),

            map(
              (response): SearchPageEvent => ({
                type: 'success',
                offset,
                response,
              }),
            ),

            startWith(loadingEvent),

            catchError(() =>
              of<SearchPageEvent>({
                type: 'error',
                offset,
              }),
            ),
          );
      }),
      scan<SearchPageEvent, CarSearchViewState>(
        (state, event) => this.reducePageEvent(state, event),
        INITIAL_SEARCH_STATE,
      ),
    );
  }

  private reducePageEvent(
    state: CarSearchViewState,
    event: SearchPageEvent,
  ): CarSearchViewState {
    if (event.type === 'loading') {
      return {
        ...(event.offset === 0 ? INITIAL_SEARCH_STATE : state),
        status: 'loading',
      };
    }

    if (event.type === 'error') {
      return {
        ...(event.offset === 0 ? INITIAL_SEARCH_STATE : state),
        status: 'error',
      };
    }

    const results =
      event.offset === 0
        ? event.response.results
        : [...state.results, ...event.response.results];

    return {
      status: results.length > 0 ? 'success' : 'empty',
      results,
      totalResults: event.response.sums.totalResults,
    };
  }
}
