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

## Note

The background music file `assets/media/CantHelpFallingInLove.mp3` is
referenced by the app but is **not included** in this repository. Add the
file at that path to enable background music.
