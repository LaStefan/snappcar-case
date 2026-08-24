import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { SupportedCity } from '../car-search.models';

@Component({
  selector: 'app-search-controls',
  templateUrl: './search-controls.component.html',
  styleUrls: ['./search-controls.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchControlsComponent {
  @Input() cityControl!: FormControl<string>;
  @Input() cities: readonly SupportedCity[] = [];
}
