import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { SUPPORTED_CITIES } from '../car-search.constants';
import { SearchControlsComponent } from './search-controls.component';

describe('SearchControlsComponent', () => {
  let component: SearchControlsComponent;
  let fixture: ComponentFixture<SearchControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchControlsComponent],
      imports: [ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchControlsComponent);
    component = fixture.componentInstance;

    component.cityControl = new FormControl('', {
      nonNullable: true,
    });
    component.cities = SUPPORTED_CITIES;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the supported cities', () => {
    const options = fixture.nativeElement.querySelectorAll('datalist option');

    expect(options.length).toBe(SUPPORTED_CITIES.length);
  });

  it('should display the city control value', () => {
    component.cityControl.setValue('Utrecht');
    fixture.detectChanges();

    const input: HTMLInputElement =
      fixture.nativeElement.querySelector('#city');

    expect(input.value).toBe('Utrecht');
  });
});
