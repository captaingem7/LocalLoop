# LocalLoop — Netlify deployment

## Payment model
- Local guide: 10% online advance; remaining balance is paid directly to the guide on tour.
- Guidance package: 100% of the package total is paid online.

## Razorpay setup
In Netlify → Project configuration → Environment variables, add:
- `RAZORPAY_KEY_ID` — Razorpay Key ID
- `RAZORPAY_KEY_SECRET` — Razorpay Key Secret

Do not put the secret in React or commit it to GitHub.

The frontend uses Razorpay Checkout. The Netlify Function creates an order and verifies the payment signature server-side before marking a booking confirmed.

If the Razorpay variables are missing, the API falls back to a demo-paid flow so the UI can still be tested. For a real deployment, configure Razorpay keys and test with Razorpay's test mode first.

## Netlify settings
- Branch: `main`
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
