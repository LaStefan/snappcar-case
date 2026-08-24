import {
  CarSearchViewState,
  MaxDistance,
  SortOption,
  SortOrder,
  SupportedCity,
} from './car-search.models';

export const SUPPORTED_CITIES: readonly SupportedCity[] = [
  {
    name: 'Utrecht',
    country: 'NL',
    latitude: 52.0907374,
    longitude: 5.1214201,
  },
  {
    name: 'Amsterdam',
    country: 'NL',
    latitude: 52.3676,
    longitude: 4.9041,
  },
  {
    name: 'Eindhoven',
    country: 'NL',
    latitude: 51.4416,
    longitude: 5.4697,
  },
  {
    name: 'Rotterdam',
    country: 'NL',
    latitude: 51.9244,
    longitude: 4.4777,
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

export const DEFAULT_MAX_DISTANCE: MaxDistance = 3000;
export const DEFAULT_SORT: SortOption = 'recommended';

export const INITIAL_SEARCH_STATE: CarSearchViewState = {
  status: 'idle',
  cars: [],
  totalResults: 0,
};

export const SORT_ORDER_OPTIONS: ReadonlyArray<{
  value: SortOrder;
  label: string;
}> = [
  {
    value: 'asc',
    label: 'Ascending (low to high)',
  },
  {
    value: 'desc',
    label: 'Descending (high to low)',
  },
];

export const DEFAULT_SORT_ORDER: SortOrder = 'asc';
