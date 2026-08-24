import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  MAX_DISTANCE_OPTIONS,
  SORT_OPTIONS,
  SORT_ORDER_OPTIONS,
} from '../car-search.constants';

import {
  MaxDistance,
  SortOption,
  SortOrder,
  SupportedCity,
} from '../car-search.models';

@Component({
  selector: 'app-search-controls',
  templateUrl: './search-controls.component.html',
  styleUrls: ['./search-controls.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchControlsComponent {
  @Input() cityControl!: FormControl<string>;
  @Input() maxDistanceControl!: FormControl<MaxDistance>;
  @Input() sortControl!: FormControl<SortOption>;
  @Input() sortOrderControl!: FormControl<SortOrder>;

  @Input() cities: readonly SupportedCity[] = [];

  readonly maxDistanceOptions = MAX_DISTANCE_OPTIONS;
  readonly sortOptions = SORT_OPTIONS;
  readonly sortOrderOptions = SORT_ORDER_OPTIONS;
}
