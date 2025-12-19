import { serve } from '@hono/node-server'
import { Hono } from 'hono'

import { getSteamWishlist } from '#utils/steam/wishlist'
import { getGameDetails } from '#utils/steam/wishlist';

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/wishlist', async (c) => {
  try {
    const steamId = c.req.query('id');
    
    if (!steamId) {
      return c.json({ error: 'Steam ID is required as a query parameter.' }, 400);
    }

    const wishlist = await getSteamWishlist(steamId);
    return c.json(wishlist);

  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: 'An unexpected error occurred.' }, 500);
  }
})

app.get('/game-details', async (c) => {
  try {
    const appId = c.req.query('id');

    if (!appId) {
      return c.json({ error: 'App ID is required as a query parameter.' }, 400);
    }

    const gameDetails = await getGameDetails(Number(appId));

    if (!gameDetails) {
      return c.json({ error: 'Failed to fetch game details.' }, 404);
    }

    return c.json(gameDetails);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: 'An unexpected error occurred.' }, 500);
  }
});


serve({
  fetch: app.fetch,
  port: 3030
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
