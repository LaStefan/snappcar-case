import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-car-search',
  templateUrl: './car-search.component.html',
  styleUrls: ['./car-search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarSearchComponent {}
