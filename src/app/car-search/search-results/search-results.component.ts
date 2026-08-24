import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

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

  trackByCarId(_index: number, result: CarSearchResult): string {
    return result.ci;
  }
}
