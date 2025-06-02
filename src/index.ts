import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import * as dotenv from 'dotenv';
import protobuf from 'protobufjs';
import axios from 'axios';

dotenv.config()

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const BASE_URL = 'https://api.steampowered.com/';
const SERVICE_WISHLIST_PROTO = protobuf.loadSync('./protos/service_wishlist.proto');

const CWishlist_GetWishlist_Request = SERVICE_WISHLIST_PROTO.lookupType('CWishlist_GetWishlist_Request');
const CWishlist_GetWishlist_Response = SERVICE_WISHLIST_PROTO.lookupType('CWishlist_GetWishlist_Response');

app.get('/wishlist', async (c) => {
  try {
    const steamId = c.req.query('id');
    
    if (!steamId) {
      return c.json({ error: 'Steam ID is required as a query parameter.' }, 400);
    }

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
    const wishlist = CWishlist_GetWishlist_Response.toObject(getWishlistResponse, { longs: Number });

    return c.json({ wishlist });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: 'An unexpected error occurred.' }, 500);
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
