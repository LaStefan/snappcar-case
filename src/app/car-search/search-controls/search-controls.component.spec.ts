import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import {
  DEFAULT_MAX_DISTANCE,
  DEFAULT_SORT,
  DEFAULT_SORT_ORDER,
  MAX_DISTANCE_OPTIONS,
  SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
  SUPPORTED_CITIES,
} from '../car-search.constants';
import {
  MaxDistance,
  SortOption,
  SortOrder,
} from '../car-search.models';
import { SearchControlsComponent } from './search-controls.component';

describe('SearchControlsComponent', () => {
  let component: SearchControlsComponent;
  let fixture: ComponentFixture<SearchControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchControlsComponent],
      imports: [CommonModule, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchControlsComponent);
    component = fixture.componentInstance;

    component.cityControl = new FormControl('', {
      nonNullable: true,
    });
    component.maxDistanceControl = new FormControl<MaxDistance>(
      DEFAULT_MAX_DISTANCE,
      { nonNullable: true },
    );
    component.sortControl = new FormControl<SortOption>(DEFAULT_SORT, {
      nonNullable: true,
    });
    component.sortOrderControl = new FormControl<SortOrder>(
      DEFAULT_SORT_ORDER,
      { nonNullable: true },
    );
    component.cities = SUPPORTED_CITIES;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render every supported city and filter option', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('datalist option').length).toBe(
      SUPPORTED_CITIES.length,
    );
    expect(element.querySelectorAll('#max-distance option').length).toBe(
      MAX_DISTANCE_OPTIONS.length,
    );
    expect(element.querySelectorAll('#sort option').length).toBe(
      SORT_OPTIONS.length,
    );
    expect(element.querySelectorAll('#sort-order option').length).toBe(
      SORT_ORDER_OPTIONS.length,
    );
  });

  it('should display the city control value', () => {
    component.cityControl.setValue('Utrecht');
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      '#city',
    ) as HTMLInputElement;

    expect(input.value).toBe('Utrecht');
  });

  it('should update the filter controls when options are selected', () => {
    const element: HTMLElement = fixture.nativeElement;
    const distanceSelect = element.querySelector(
      '#max-distance',
    ) as HTMLSelectElement;
    const sortSelect = element.querySelector('#sort') as HTMLSelectElement;
    const orderSelect = element.querySelector(
      '#sort-order',
    ) as HTMLSelectElement;

    distanceSelect.selectedIndex = 1;
    distanceSelect.dispatchEvent(new Event('change'));

    sortSelect.selectedIndex = 1;
    sortSelect.dispatchEvent(new Event('change'));

    orderSelect.selectedIndex = 1;
    orderSelect.dispatchEvent(new Event('change'));

    expect(component.maxDistanceControl.value).toBe(5000);
    expect(component.sortControl.value).toBe('price');
    expect(component.sortOrderControl.value).toBe('desc');
  });
});
