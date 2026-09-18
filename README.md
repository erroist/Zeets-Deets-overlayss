# ZEETS DEETS OVERLAYS

A full gamer-style web dashboard for controlling a transparent TikTok LIVE overlay.

## Important: how the URL works

The dashboard gives you an overlay URL in this form:

`https://YOUR-DOMAIN/overlay`

That `/overlay` URL is the one you paste into TikTok LIVE Studio as a Browser Source / Web source.

A public URL cannot be created by a ZIP file alone. You need to host this Node.js project on a service that gives you an HTTPS URL.

## Deploy

Recommended simple flow:

1. Create a Node.js web service on a host such as Render, Railway, or another Node-compatible host.
2. Upload this project or connect its Git repository.
3. Build/install command: `npm install`
4. Start command: `npm start`
5. Add environment variable:
   `TIKTOK_USERNAME=your_tiktok_username`
6. Open the HTTPS URL from the host.
7. Your overlay URL is:
   `https://YOUR-DOMAIN/overlay`
8. Paste that URL into TikTok LIVE Studio's Browser Source/Web source.

## Dashboard

Open:
`https://YOUR-DOMAIN/`

From there you can:
- Toggle Guess the Number ON/OFF
- Set minimum and maximum
- Choose the secret number
- Start a new round
- Copy the overlay URL
- Watch live guesses appear

## TikTok chat

The server uses `tiktok-live-connector` to receive LIVE chat events. When a viewer sends a message containing a number inside your configured range, it is treated as a guess.

Example:
`47`
or
`I think 47`

When the guess equals the secret number, the overlay announces the viewer.

The connector is an unofficial community library, so TikTok can change its LIVE endpoints and behavior. The overlay/dashboard itself does not depend on TikTok until the chat connection is enabled.

## Security

This starter dashboard is intentionally simple. Before exposing the dashboard publicly, add authentication or keep the dashboard private. Do not share admin controls publicly.

## Customization

The main visual files are:
- `public/style.css` — dashboard
- `public/overlay.css` — transparent stream overlay
- `public/dashboard.js` — dashboard controls
- `public/overlay.js` — overlay behavior
- `server.js` — TikTok chat + game logic
