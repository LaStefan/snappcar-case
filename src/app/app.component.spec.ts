import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';

@Component({
  selector: 'app-car-search',
  template: '',
})
class CarSearchStubComponent {}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, CarSearchStubComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
