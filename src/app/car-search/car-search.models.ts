export type CountryCode = 'NL' | 'DE';

export type MaxDistance = 3000 | 5000 | 7000;

export type SortOption = 'price' | 'recommended' | 'distance';

export interface SupportedCity {
  readonly name: string;
  readonly country: CountryCode;
  readonly latitude: number;
  readonly longitude: number;
}

export interface CarSearchQuery {
  readonly country: CountryCode;
  readonly latitude: number;
  readonly longitude: number;
  readonly maxDistance: MaxDistance;
  readonly sort: SortOption;
  readonly limit: number;
  readonly offset: number;
}

export interface CarSearchResponse {
  readonly results: readonly CarSearchResult[];
  readonly sums: {
    readonly totalResults: number;
  };
  readonly searchId: string;
}

export interface CarSearchResult {
  readonly ci: string;
  readonly distance: number;
  readonly priceInformation: PriceInformation;
  readonly car: Car;
}

export interface PriceInformation {
  readonly price: number;
  readonly pricePerKilometer: number;
  readonly freeKilometersPerDay: number;
  readonly rentalDays: number;
  readonly isoCurrencyCode: string;
}

export interface Car {
  readonly year: number;
  readonly make: string;
  readonly model: string;
  readonly fuelType: string;
  readonly gear: string;
  readonly seats: number;
  readonly reviewCount: number;
  readonly reviewAvg?: number;
  readonly images: readonly string[];
  readonly address: {
    readonly city: string;
    readonly countryCode: string;
  };
}
