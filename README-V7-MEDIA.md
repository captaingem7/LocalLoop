# LocalLoop v7 — India Places + Real Motion Media

This upgrade turns the India Atlas into destination detail pages with:

- place-specific Wikimedia Commons image discovery at runtime
- 6-image destination galleries
- real-motion video previews for selected destinations (Kochi region/Athirappilly, Goa, Varanasi, Hampi, Rishikesh)
- muted looping video cards labelled as "LIVE MOMENT" (these are real clips, not live webcams)
- source links on every gallery/media area
- destination cards now open a dedicated place page before the booking flow
- existing guide/package/payment logic retained

The Wikimedia Commons API is used for image discovery and thumbnail URLs. Check each source page's license/credit before commercial use.

## Run

```powershell
npm install
npm run build
```

Then push to GitHub and let Netlify deploy.
