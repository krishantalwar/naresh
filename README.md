# Rajat & Kamlesh — Wedding Invitation

A single-page wedding invitation website (built React app), served as static files.

## Folder structure

```
.
├── index.html            # App entry point
├── vercel.json           # SPA routing (all routes → index.html)
├── README.md
└── assets/
    ├── js/               # JavaScript bundles (index-*.js)
    ├── css/              # Stylesheet (styles-*.css)
    ├── images/           # Images (*.webp)
    └── media/            # Video / audio (envelope-intro.mp4, …)
```

## Run locally

It must be served over HTTP (opening `index.html` as a file will not work).
Use any static file server from the project root, e.g.:

```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```

Then open http://localhost:8000

## Deploy to Vercel

This is a static site with no build step.

1. Import the repo in Vercel and select this branch.
2. Framework Preset: **Other** · Build Command: *(empty)* · Output Directory: `.`
3. Deploy. `vercel.json` rewrites all routes to `index.html` for SPA navigation.

Or from the CLI: `npx vercel --prod`

## Background music

`assets/media/jashn-e-bahaaraa.mp3` — *Jashn-E-Bahaaraa (Instrumental, Flute)*
by A.R. Rahman, from the *Jodhaa Akbar* soundtrack. 5:15, re-encoded to 96 kbps
(3.6 MB) with cover art stripped to keep the page light.

It starts when the envelope is opened, loops, and plays at 50% volume. A
mute/play toggle sits in the bottom-right corner. To start the track partway in
instead of at the beginning, change `ya=0` in `assets/js/index-BaQzgteU2.js`
to the desired offset in seconds.

## RSVP form

The RSVP form posts to [Web3Forms](https://web3forms.com). It is **configured and
live** — submissions are emailed to `nsmmitawa@gmail.com`.

Each submission emails: name, Accept/Decline, number of guests, and which events
they're joining. Subject line: *New Wedding RSVP — Rajat & Kamlesh*.

To change the destination address, get a new access key from web3forms.com (free,
no account) and replace this line in `assets/js/index-BaQzgteU2.js`:

```js
const RSVP_ACCESS_KEY="43c67142-1bac-4ae1-a980-8c847790bbd3"
```

The key is a public, client-side key by design — it only permits sending to the
address it was registered with, so it is safe to ship in the bundle.

If the key is ever cleared or reverted to a placeholder, the form refuses to send
and shows guests a "not connected yet" notice rather than failing silently.
