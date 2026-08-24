import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { INITIAL_SEARCH_STATE } from '../car-search.constants';
import { CarSearchResult, CarSearchViewState } from '../car-search.models';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchResultsComponent {
  @Input() state: CarSearchViewState = INITIAL_SEARCH_STATE;

  @Output() loadMore = new EventEmitter<void>();

  get hasMore(): boolean {
    return this.state.cars.length < this.state.totalResults;
  }

  requestMore(): void {
    this.loadMore.emit();
  }

  trackByCarId(_index: number, result: CarSearchResult): string {
    return result.ci;
  }
}
