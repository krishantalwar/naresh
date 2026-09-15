# Rajat & Kamlesh — Wedding Invitation

A single-page wedding invitation website (built React app), served as static files.

## Folder structure

```
.
├── index.html            # App entry point (the invitation)
├── contact.html          # "Want a site like this?" enquiry page (plain static)
├── vercel.json           # Routing (/contact → contact.html, rest → index.html)
├── README.md
└── assets/
    ├── js/               # JavaScript bundles (index-*.js) + contact.js
    ├── css/              # Stylesheet (styles-*.css) + contact.css
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

## Enquiry page

`contact.html` is the **Want a Site Like This?** page. It is primarily a lead
page: someone sees this invitation, likes it, and wants one built for their own
wedding. It also handles guests of Rajat & Kamlesh who have a question, via the
topic dropdown — so one page serves both audiences.

It is a plain static page — no React, no bundle — with its own
`assets/css/contact.css` and `assets/js/contact.js`. It deliberately does not
load `styles-*.css`, because that file is a purged Tailwind build containing only
the utilities the app itself uses.

Visitors reach it from the **WANT A SITE LIKE THIS?** button at the bottom of the
RSVP section, next to *Get Directions*. It is served at both `/contact` and
`/contact.html`.

The details shown on the page live in `contact.html`:

| What | Value | Appears as |
| --- | --- | --- |
| Email | `nsmmitawa@gmail.com` | `mailto:` link |
| Phone | `8685014330` | `tel:+918685014330` |
| WhatsApp | same number | `https://wa.me/918685014330` |

### How the form routes

The topic dropdown decides everything downstream, so the two kinds of sender
never get confused in the inbox:

| Topic chosen | Subject line | Wedding-date field |
| --- | --- | --- |
| Anything about building a site | `New Website Enquiry — <topic>` | shown, sent |
| *A guest question about Rajat & Kamlesh's wedding* | `Wedding Question — Rajat & Kamlesh` | hidden, not sent |

`Reply-To` is always set to the sender's own address, so replying in Gmail goes
straight back to them.

To change what the page offers, edit the six `.feature` blocks in
`contact.html`. To change the topics, edit the `<option>`s — and if you rename
the guest option, update `GUEST_TOPIC` in `assets/js/contact.js` to match it
**exactly**, or every enquiry will be treated as a website enquiry.

> **The Web3Forms key now lives in two files.** If you change it, change it in
> **both** `assets/js/index-BaQzgteU2.js` (RSVP) and `assets/js/contact.js`
> (enquiry form), or one of the two forms will stop delivering.

## Editing the invitation itself

`index.html` is a **prerendered copy** of what the React bundle renders. Any change
to the invitation's markup must be made twice — once in
`assets/js/index-BaQzgteU2.js` and identically in `index.html` — or React will
report a hydration mismatch and may discard the server markup. After editing the
bundle, check it still parses before serving:

```bash
cp assets/js/index-BaQzgteU2.js /tmp/check.mjs && node --check /tmp/check.mjs
```

This does not apply to `contact.html`, which is a normal standalone page.
