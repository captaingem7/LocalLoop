# LocalLoop India Atlas upgrade

This version adds an India-wide destination discovery layer with 25 destinations, region filters, destination photography, image-backed journey cards, and 18 self-guided packages across India.

## Important
- Destination photos are referenced from Wikimedia Commons `Special:FilePath` URLs so the web app can load them without bundling large image binaries.
- Each destination card links to its Wikimedia Commons source page in the data. Check the individual source page for the photographer credit and license before using the images commercially.
- The Netlify function now migrates an existing LocalLoop Blobs state by adding the new India packages without deleting existing bookings or guides.
- `node_modules`, `dist`, and `.netlify` are intentionally excluded from Git.
