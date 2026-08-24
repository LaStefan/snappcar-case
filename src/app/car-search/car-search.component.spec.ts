import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Observable, of, Subscription, throwError } from 'rxjs';

import {
  CarSearchResponse,
  CarSearchViewState,
} from './car-search.models';
import { CarSearchComponent } from './car-search.component';
import { CarSearchApiService } from './services/car-search-api.service';

describe('CarSearchComponent', () => {
  let component: CarSearchComponent;
  let carSearchApiService: jasmine.SpyObj<CarSearchApiService>;

  const response: CarSearchResponse = {
    results: [
      {
        ci: 'car-1',
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
      },
    ],
    sums: {
      totalResults: 1,
    },
    searchId: 'test-search-id',
  };

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
        results: [],
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
    expect(states[states.length - 1].results).toEqual([]);

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
});
