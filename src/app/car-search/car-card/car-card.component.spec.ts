import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarSearchResult } from '../car-search.models';
import { CarCardComponent } from './car-card.component';

describe('CarCardComponent', () => {
  let component: CarCardComponent;
  let fixture: ComponentFixture<CarCardComponent>;

  const car: CarSearchResult = {
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
      declarations: [CarCardComponent],
      imports: [CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CarCardComponent);
    component = fixture.componentInstance;
    component.car = car;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the car details', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Toyota AYGO');
    expect(element.textContent).toContain('Utrecht');
    expect(element.textContent).toContain('4.9');
    expect(element.textContent).toContain('Manual');
  });

  it('should display the fallback when the image cannot be loaded', () => {
    const image = fixture.nativeElement.querySelector(
      'img',
    ) as HTMLImageElement;

    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Photo unavailable');
  });
});
