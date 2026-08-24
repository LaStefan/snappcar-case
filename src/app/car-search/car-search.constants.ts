import { MaxDistance, SortOption, SupportedCity } from './car-search.models';

export const SUPPORTED_CITIES: readonly SupportedCity[] = [
  {
    name: 'Utrecht',
    country: 'NL',
    latitude: 52.0907374,
    longitude: 5.1214201,
  },
  {
    name: 'Berlin',
    country: 'DE',
    latitude: 52.52,
    longitude: 13.405,
  },
];

export const MAX_DISTANCE_OPTIONS: ReadonlyArray<{
  value: MaxDistance;
  label: string;
}> = [
  { value: 3000, label: '3 km' },
  { value: 5000, label: '5 km' },
  { value: 7000, label: '7 km' },
];

export const SORT_OPTIONS: ReadonlyArray<{
  value: SortOption;
  label: string;
}> = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price', label: 'Price' },
  { value: 'distance', label: 'Distance' },
];

export const PAGE_SIZE = 10;
