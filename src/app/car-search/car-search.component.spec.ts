import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Observable, of, Subject, Subscription, throwError } from 'rxjs';

import {
  CarSearchResult,
  CarSearchResponse,
  CarSearchViewState,
} from './car-search.models';
import { CarSearchComponent } from './car-search.component';
import { CarSearchApiService } from './services/car-search-api.service';

describe('CarSearchComponent', () => {
  let component: CarSearchComponent;
  let carSearchApiService: jasmine.SpyObj<CarSearchApiService>;

  const response = createResponse(1, 1, 1);

  beforeEach(async () => {
    carSearchApiService = jasmine.createSpyObj<CarSearchApiService>(
      'CarSearchApiService',
      ['search'],
    );
    carSearchApiService.search.and.returnValue(of(response));

    await TestBed.configureTestingModule({
      declarations: [CarSearchComponent],
      providers: [
        {
          provide: CarSearchApiService,
          useValue: carSearchApiService,
        },
      ],
    })
      .overrideComponent(CarSearchComponent, {
        set: {
          template: '',
        },
      })
      .compileComponents();

    component = TestBed.createComponent(CarSearchComponent).componentInstance;
  });

  function collectStates(): {
    states: CarSearchViewState[];
    subscription: Subscription;
  } {
    const states: CarSearchViewState[] = [];
    const subscription = component.searchState$.subscribe((state) => {
      states.push(state);
    });

    return { states, subscription };
  }

  it('should create with an idle state', () => {
    const { states, subscription } = collectStates();

    expect(component).toBeTruthy();
    expect(states).toEqual([
      {
        status: 'idle',
        cars: [],
        totalResults: 0,
      },
    ]);
    expect(carSearchApiService.search).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should debounce and normalize the city before searching', fakeAsync(() => {
    const { states, subscription } = collectStates();

    component.cityControl.setValue('  UTRECHT  ');

    tick(499);
    expect(carSearchApiService.search).not.toHaveBeenCalled();

    tick(1);
    expect(carSearchApiService.search).toHaveBeenCalledTimes(1);
    expect(carSearchApiService.search).toHaveBeenCalledWith({
      country: 'NL',
      latitude: 52.0907374,
      longitude: 5.1214201,
      maxDistance: 3000,
      sort: 'recommended',
      order: 'asc',
      limit: 10,
      offset: 0,
    });
    expect(states.map((state) => state.status)).toEqual([
      'idle',
      'loading',
      'success',
    ]);

    subscription.unsubscribe();
  }));

  it('should refresh immediately when a filter changes', fakeAsync(() => {
    const { subscription } = collectStates();

    component.cityControl.setValue('Utrecht');
    tick(500);
    carSearchApiService.search.calls.reset();

    component.maxDistanceControl.setValue(7000);
    component.sortControl.setValue('price');
    component.sortOrderControl.setValue('desc');

    expect(carSearchApiService.search).toHaveBeenCalledTimes(3);
    expect(carSearchApiService.search.calls.mostRecent().args[0]).toEqual({
      country: 'NL',
      latitude: 52.0907374,
      longitude: 5.1214201,
      maxDistance: 7000,
      sort: 'price',
      order: 'desc',
      limit: 10,
      offset: 0,
    });

    subscription.unsubscribe();
  }));

  it('should not call the API for an unsupported city', fakeAsync(() => {
    const { states, subscription } = collectStates();

    component.cityControl.setValue('Paris');
    tick(500);

    expect(carSearchApiService.search).not.toHaveBeenCalled();
    expect(states[states.length - 1].status).toBe('unsupported-city');

    subscription.unsubscribe();
  }));

  it('should return to idle when the city is cleared', fakeAsync(() => {
    const { states, subscription } = collectStates();

    component.cityControl.setValue('Utrecht');
    tick(500);
    component.cityControl.setValue('');
    tick(500);

    expect(states[states.length - 1].status).toBe('idle');
    expect(states[states.length - 1].cars).toEqual([]);

    subscription.unsubscribe();
  }));

  it('should expose an error state when the API fails', fakeAsync(() => {
    carSearchApiService.search.and.returnValue(
      throwError(() => new Error('Request failed')),
    );
    const { states, subscription } = collectStates();

    component.cityControl.setValue('Utrecht');
    tick(500);

    expect(states.map((state) => state.status)).toEqual([
      'idle',
      'loading',
      'error',
    ]);

    subscription.unsubscribe();
  }));

  it('should request and append the next page', fakeAsync(() => {
    const firstPage = createResponse(1, 10, 20);
    const secondPage = createResponse(11, 10, 20);
    carSearchApiService.search.and.returnValues(of(firstPage), of(secondPage));
    const { states, subscription } = collectStates();

    component.cityControl.setValue('Utrecht');
    tick(500);
    component.loadMore();

    expect(
      carSearchApiService.search.calls.allArgs().map(([query]) => query.offset),
    ).toEqual([0, 10]);
    expect(states[states.length - 1].cars.length).toBe(20);
    expect(states[states.length - 1].cars[0].ci).toBe('car-1');
    expect(states[states.length - 1].cars[19].ci).toBe('car-20');

    subscription.unsubscribe();
  }));

  it('should ignore repeated load-more events while a request is active', fakeAsync(() => {
    const pendingFirstPage = new Subject<CarSearchResponse>();
    const firstPage = createResponse(1, 10, 20);
    const secondPage = createResponse(11, 10, 20);
    carSearchApiService.search.and.returnValues(
      pendingFirstPage.asObservable(),
      of(secondPage),
    );
    const { subscription } = collectStates();

    component.cityControl.setValue('Utrecht');
    tick(500);
    component.loadMore();
    component.loadMore();

    expect(carSearchApiService.search).toHaveBeenCalledTimes(1);

    pendingFirstPage.next(firstPage);
    pendingFirstPage.complete();
    component.loadMore();

    expect(carSearchApiService.search).toHaveBeenCalledTimes(2);
    expect(carSearchApiService.search.calls.mostRecent().args[0].offset).toBe(
      10,
    );

    subscription.unsubscribe();
  }));

  it('should stop requesting when all results are loaded', fakeAsync(() => {
    carSearchApiService.search.and.returnValue(of(createResponse(1, 10, 10)));
    const { subscription } = collectStates();

    component.cityControl.setValue('Utrecht');
    tick(500);
    component.loadMore();

    expect(carSearchApiService.search).toHaveBeenCalledTimes(1);

    subscription.unsubscribe();
  }));

  it('should reset the offset and results when a filter changes', fakeAsync(() => {
    const firstPage = createResponse(1, 10, 20);
    const secondPage = createResponse(11, 10, 20);
    const filteredPage = createResponse(101, 10, 10);
    carSearchApiService.search.and.returnValues(
      of(firstPage),
      of(secondPage),
      of(filteredPage),
    );
    const { states, subscription } = collectStates();

    component.cityControl.setValue('Utrecht');
    tick(500);
    component.loadMore();
    component.sortControl.setValue('price');

    expect(
      carSearchApiService.search.calls.allArgs().map(([query]) => query.offset),
    ).toEqual([0, 10, 0]);
    expect(states[states.length - 1].cars.length).toBe(10);
    expect(states[states.length - 1].cars[0].ci).toBe('car-101');

    subscription.unsubscribe();
  }));

  it('should retry a failed page without skipping its offset', fakeAsync(() => {
    const firstPage = createResponse(1, 10, 20);
    const secondPage = createResponse(11, 10, 20);
    carSearchApiService.search.and.returnValues(
      of(firstPage),
      throwError(() => new Error('Request failed')),
      of(secondPage),
    );
    const { states, subscription } = collectStates();

    component.cityControl.setValue('Utrecht');
    tick(500);
    component.loadMore();

    expect(states[states.length - 1].status).toBe('error');
    expect(states[states.length - 1].cars.length).toBe(10);

    component.loadMore();

    expect(
      carSearchApiService.search.calls.allArgs().map(([query]) => query.offset),
    ).toEqual([0, 10, 10]);
    expect(states[states.length - 1].status).toBe('success');
    expect(states[states.length - 1].cars.length).toBe(20);

    subscription.unsubscribe();
  }));

  it('should cancel the previous request when a new city is searched', fakeAsync(() => {
    let previousRequestCancelled = false;
    const pendingRequest = new Observable<CarSearchResponse>(() => {
      return () => {
        previousRequestCancelled = true;
      };
    });

    carSearchApiService.search.and.returnValues(pendingRequest, of(response));
    const { subscription } = collectStates();

    component.cityControl.setValue('Utrecht');
    tick(500);
    expect(previousRequestCancelled).toBeFalse();

    component.cityControl.setValue('Amsterdam');
    tick(500);
    expect(previousRequestCancelled).toBeTrue();
    expect(carSearchApiService.search).toHaveBeenCalledTimes(2);

    subscription.unsubscribe();
  }));

  function createResponse(
    firstCarNumber: number,
    resultCount: number,
    totalResults: number,
  ): CarSearchResponse {
    return {
      results: Array.from({ length: resultCount }, (_value, index) =>
        createResult(`car-${firstCarNumber + index}`),
      ),
      sums: {
        totalResults,
      },
      searchId: 'test-search-id',
    };
  }

  function createResult(id: string): CarSearchResult {
    return {
      ci: id,
      distance: 337,
      priceInformation: {
        price: 34,
        pricePerKilometer: 0.2,
        freeKilometersPerDay: 100,
        rentalDays: 1,
        isoCurrencyCode: 'EUR',
      },
      car: {
        year: 2018,
        make: 'Toyota',
        model: 'AYGO',
        fuelType: 'Petrol',
        gear: 'Manual',
        seats: 4,
        reviewCount: 365,
        reviewAvg: 4.89,
        images: ['car.jpg'],
        address: {
          city: 'Utrecht',
          countryCode: 'NL',
        },
      },
    };
  }
});
