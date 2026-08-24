import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  Observable,
  of,
  startWith,
  switchMap,
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
  CarSearchViewState,
  MaxDistance,
  SortOption,
  SortOrder,
  SupportedCity,
} from './car-search.models';
import { CarSearchApiService } from './services/car-search-api.service';

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

  constructor(private readonly carSearchApiService: CarSearchApiService) {
    this.searchState$ = this.createSearchState();
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

          return this.searchCity(city, maxDistance, sort, sortOrder);
        },
      ),

      startWith(INITIAL_SEARCH_STATE),
    );
  }

  private searchCity(
    city: SupportedCity,
    maxDistance: MaxDistance,
    sort: SortOption,
    sortOrder: SortOrder,
  ): Observable<CarSearchViewState> {
    const loadingState: CarSearchViewState = {
      ...INITIAL_SEARCH_STATE,
      status: 'loading',
    };

    const errorState: CarSearchViewState = {
      ...INITIAL_SEARCH_STATE,
      status: 'error',
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
        offset: 0,
      })
      .pipe(
        map(
          (response): CarSearchViewState => ({
            status: response.results.length > 0 ? 'success' : 'empty',
            results: response.results,
            totalResults: response.sums.totalResults,
          }),
        ),
        startWith(loadingState),
        catchError(() => of(errorState)),
      );
  }
}
