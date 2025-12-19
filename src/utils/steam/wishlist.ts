import protobuf from 'protobufjs';
import axios from 'axios';

import { type RawSteamGames, type RawSteamWishlist, type SteamGamesDetail, type SteamGames, type SteamWishlist, defaultSteamGamesDetail } from '#types';

const BASE_URL = 'https://api.steampowered.com/';
const SERVICE_WISHLIST_PROTO = protobuf.loadSync('./protos/service_wishlist.proto');

const CWishlist_GetWishlist_Request = SERVICE_WISHLIST_PROTO.lookupType('CWishlist_GetWishlist_Request');
const CWishlist_GetWishlist_Response = SERVICE_WISHLIST_PROTO.lookupType('CWishlist_GetWishlist_Response');

export async function getWishlist(steamId: string): Promise<RawSteamWishlist> {
    const getWishlistRequest = CWishlist_GetWishlist_Request.create({
      steamid: steamId,
    });

    const getWishlistRequestBuffer = CWishlist_GetWishlist_Request.encode(getWishlistRequest).finish();

    const response = await axios({
      method: 'get',
      baseURL: BASE_URL,
      url: 'IWishlistService/GetWishlist/v1',
      params: {
        input_protobuf_encoded: Buffer.from(getWishlistRequestBuffer).toString('base64'),
      },
      responseType: 'arraybuffer',
    });

    const getWishlistResponse = CWishlist_GetWishlist_Response.decode(response.data);
    const wishlistObj = CWishlist_GetWishlist_Response.toObject(getWishlistResponse, { longs: Number });

    const wishlist: RawSteamWishlist = Array.isArray(wishlistObj.items) ? wishlistObj.items : [];

    return wishlist;
};


export async function getGameDetails(appId: number): Promise<SteamGamesDetail> {
  const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}`);

  const data = response.data[appId];
  const gameData = data.data;

  if (!gameData) {
    console.log(appId)
    return defaultSteamGamesDetail;
  }

  return {
    title: gameData.name,
    price: gameData.price_overview?.final / 100 || defaultSteamGamesDetail.price,
    is_discounted: gameData.price_overview?.discount_percent > 0 ||defaultSteamGamesDetail.is_discounted,
    discount_percent: gameData.price_overview?.discount_percent || defaultSteamGamesDetail.discount_percent,
    currency: gameData.price_overview?.currency || defaultSteamGamesDetail.currency,
    description: gameData.short_description || defaultSteamGamesDetail.description,
    url: `https://store.steampowered.com/app/${appId}`,
    image: gameData.header_image || defaultSteamGamesDetail.image
    };
};

export function transformRawToSteamGames(rawGame: RawSteamGames, gameDetails: SteamGamesDetail): SteamGames {
  return {
    ...rawGame,
    ...gameDetails,
    dateAdded: new Date(rawGame.dateAdded * 1000),
  };
}

export async function getSteamWishlist(steamID: string): Promise<SteamWishlist> {
  const wishlist = await getWishlist(steamID);
  return Promise.all(
    wishlist.map(async item => transformRawToSteamGames(item, await getGameDetails(item.appid)))
  );
}

export async function intersecSteamWishlists(wishlist1 : SteamWishlist, wishlist2 : SteamWishlist): Promise<SteamWishlist>{
  return Promise.all(
    wishlist1.
  )
}