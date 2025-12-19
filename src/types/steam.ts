export interface RawSteamGames {
  appid: number;
  priority: number;
  dateAdded: number;
}

export interface SteamGamesDetail {
  title: string;
  price: number;
  is_discounted: boolean;
  discount_percent: number;
  currency: string;
  description: string;
  url: string;
  image: string;
}

export const defaultSteamGamesDetail: SteamGamesDetail = {
  title: 'unknown',
  price: 0,
  is_discounted: false,
  discount_percent: 0,
  currency: 'USD',
  description: 'unknown',
  url: '',
  image: '',
};

export interface SteamGames extends Omit<RawSteamGames, 'dateAdded'>, SteamGamesDetail {
  dateAdded: Date;
}

export type RawSteamWishlist = RawSteamGames[];

export type SteamWishlist = SteamGames[];