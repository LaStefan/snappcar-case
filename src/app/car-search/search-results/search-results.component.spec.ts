import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import {
  CarSearchResult,
  CarSearchViewState,
} from '../car-search.models';
import { CarCardComponent } from '../car-card/car-card.component';
import { SearchResultsComponent } from './search-results.component';

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;

  const result: CarSearchResult = {
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchResultsComponent, CarCardComponent],
      imports: [CommonModule, InfiniteScrollModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with the idle message', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      'Find a car in your neighbourhood',
    );
  });

  it('should render the loading state as busy', () => {
    setState(createState('loading'));

    const section = fixture.nativeElement.querySelector(
      '.search-results',
    ) as HTMLElement;

    expect(section.getAttribute('aria-busy')).toBe('true');
    expect(section.textContent).toContain('Finding your next ride');
  });

  it('should render successful search results', () => {
    setState({
      status: 'success',
      cars: [result],
      totalResults: 1,
    });

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('.search-results__grid > li').length).toBe(
      1,
    );
    expect(element.textContent).toContain('1 car found');
    expect(element.textContent).toContain('Toyota AYGO');
    expect(element.textContent).toContain('0.3');
  });

  it('should render the unsupported-city message', () => {
    setState(createState('unsupported-city'));

    expect(fixture.nativeElement.textContent).toContain(
      'We haven’t parked there yet',
    );
  });

  it('should render the empty state', () => {
    setState(createState('empty'));

    expect(fixture.nativeElement.textContent).toContain(
      'No cars in this radius',
    );
  });

  it('should render the error state', () => {
    setState(createState('error'));

    expect(fixture.nativeElement.textContent).toContain(
      'We hit a speed bump',
    );
  });

  it('should keep results visible while the next page is loading', () => {
    setState({
      status: 'loading',
      cars: [result],
      totalResults: 2,
    });

    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('.search-results__grid > li').length).toBe(
      1,
    );
    expect(element.textContent).toContain('Loading more cars');
    expect(element.querySelector('button')).toBeNull();
  });

  it('should preserve results and offer retry after a pagination error', () => {
    setState({
      status: 'error',
      cars: [result],
      totalResults: 2,
    });

    const element: HTMLElement = fixture.nativeElement;
    const button = element.querySelector('button') as HTMLButtonElement;

    expect(element.querySelectorAll('.search-results__grid > li').length).toBe(
      1,
    );
    expect(element.textContent).toContain('We could not load more cars.');
    expect(button.textContent).toContain('Try again');
  });

  it('should emit loadMore from the fallback button', () => {
    spyOn(component.loadMore, 'emit');
    setState({
      status: 'success',
      cars: [result],
      totalResults: 2,
    });

    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement;
    button.click();

    expect(component.loadMore.emit).toHaveBeenCalledTimes(1);
  });

  it('should indicate when all results are loaded', () => {
    setState({
      status: 'success',
      cars: [result],
      totalResults: 1,
    });

    const element: HTMLElement = fixture.nativeElement;

    expect(component.hasMore).toBeFalse();
    expect(element.textContent).toContain(
      'All available cars have been loaded.',
    );
    expect(element.querySelector('button')).toBeNull();
  });

  it('should track results by car id', () => {
    expect(component.trackByCarId(0, result)).toBe('car-1');
  });

  function createState(
    status: CarSearchViewState['status'],
  ): CarSearchViewState {
    return {
      status,
      cars: [],
      totalResults: 0,
    };
  }

  function setState(state: CarSearchViewState): void {
    fixture.componentRef.setInput('state', state);
    fixture.detectChanges();
  }
});
