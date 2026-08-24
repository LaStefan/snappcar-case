import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CarSearchQuery, CarSearchResponse } from '../car-search.models';

@Injectable({
  providedIn: 'root',
})
export class CarSearchApiService {
  private readonly searchEndpoint = '/v2/search/query';

  constructor(private readonly http: HttpClient) {}

  search(query: CarSearchQuery): Observable<CarSearchResponse> {
    const params = new HttpParams()
      .set('country', query.country)
      .set('lat', query.latitude)
      .set('lng', query.longitude)
      .set('max-distance', query.maxDistance)
      .set('sort', query.sort)
      .set('order', query.order)
      .set('limit', query.limit)
      .set('offset', query.offset);

    return this.http.get<CarSearchResponse>(this.searchEndpoint, { params });
  }
}
