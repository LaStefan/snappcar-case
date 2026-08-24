import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CarSearchQuery, CarSearchResponse } from '../car-search.models';
import { CarSearchApiService } from './car-search-api.service';

describe('CarSearchApiService', () => {
  let service: CarSearchApiService;
  let httpController: HttpTestingController;

  const query: CarSearchQuery = {
    country: 'NL',
    latitude: 52.0907374,
    longitude: 5.1214201,
    maxDistance: 3000,
    sort: 'price',
    limit: 10,
    offset: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(CarSearchApiService);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send the expected search request', () => {
    const response: CarSearchResponse = {
      results: [],
      sums: {
        totalResults: 0,
      },
      searchId: 'test-search-id',
    };

    service.search(query).subscribe((actualResponse) => {
      expect(actualResponse).toEqual(response);
    });

    const request = httpController.expectOne(
      (candidate) => candidate.url === '/v2/search/query',
    );

    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('country')).toBe('NL');
    expect(request.request.params.get('lat')).toBe('52.0907374');
    expect(request.request.params.get('lng')).toBe('5.1214201');
    expect(request.request.params.get('max-distance')).toBe('3000');
    expect(request.request.params.get('sort')).toBe('price');
    expect(request.request.params.get('limit')).toBe('10');
    expect(request.request.params.get('offset')).toBe('0');
    expect(request.request.params.has('order')).toBeFalse();

    request.flush(response);
  });

  it('should propagate API errors', (done) => {
    service.search(query).subscribe({
      next: () => fail('Expected the request to fail'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        done();
      },
    });

    const request = httpController.expectOne(
      (candidate) => candidate.url === '/v2/search/query',
    );

    request.flush(
      { message: 'Server error' },
      {
        status: 500,
        statusText: 'Server Error',
      },
    );
  });
});
