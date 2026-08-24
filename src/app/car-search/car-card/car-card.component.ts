import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { CarSearchResult } from '../car-search.models';

@Component({
  selector: 'app-car-card',
  templateUrl: './car-card.component.html',
  styleUrls: ['./car-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarCardComponent {
  @Input() car!: CarSearchResult;

  imageFailed = false;

  get imageUrl(): string | null {
    if (this.imageFailed) {
      return null;
    }

    return this.car.car.images[0] ?? null;
  }

  handleImageError(): void {
    this.imageFailed = true;
  }
}
