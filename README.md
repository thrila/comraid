# Shop

A Next.js storefront backed by an [Elysia](https://elysiajs.com) API that handles accounts, the catalogue and live personalised recommendations.

```
shop/
├── src/        Next.js app (shop, product pages, checkout, admin)
└── backend/    Elysia API: accounts, catalogue, recommendations (see backend/README.md)
```

## Getting started

1. Start the API:

   ```bash
   cd backend
   cp .env.example .env      # set ADMIN_TOKEN; DATABASE_URL for Postgres (optional in dev)
   npm install
   bun run dev               # or: npm run dev:node
   ```

2. In another terminal, start the shop:

   ```bash
   cp .env.example .env.local   # NEXT_PUBLIC_API_URL points the shop at http://localhost:4000
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

## What's wired up

- **For You** (home page): a personalised feed. New visitors see what's popular in their region. As they browse, add to cart and buy, the feed adapts within the session.
- **Product pages** (`/product/[id]`): similar items and a "Picked For You" rail. Views are tracked.
- **Shop** (`/shop`, `/shop/[category]`): search, category, price, size and colour filters, plus sorting.
- **Cart and checkout**: a persistent cart, "You May Also Like" basket recommendations, and purchases fed back to the recommender.
- **Accounts**: sign up with an emailed 6-digit code, log in with a username or email, log out, and save delivery addresses used at checkout. In development the code is printed in the API's console.
- **Admin** (`/admin` → Products): add, edit and delete products with image upload, and see recommender insights (activity by region, most engaged products).

## To do

What still needs to be built or decided before launch. Pages that depend on missing backend features show an empty state or sample data until then.

### Accounts and security
- [ ] **Email delivery**: connect a real provider (Resend, SES, Postmark) through the `Mailer` interface in `backend/src/accounts/mailer.ts`. Until then, sign-up codes are only printed in the API console.
- [ ] **Password reset**: `/forgot-password` is UI only. Add reset-code endpoints to the API and wire up the form.
- [ ] **Profile editing**: the account page is read-only. Add endpoints to change name, email, password and avatar.
- [ ] **Account deactivation**: the "Deactivate Account" button on the log-out page does nothing yet.
- [ ] **Social login**: the X and Facebook buttons on the login and sign-up pages are not wired up.
- [ ] **Admin access**: replace the shared `ADMIN_TOKEN` with an admin role on user accounts.

### Shopping
- [ ] **Orders**: "Confirm Order" records the purchase for recommendations and clears the cart, but no order is stored. Add an orders API, then show orders in the profile, the seller dashboard and admin order tracking.
- [ ] **Payments**: there is no payment step at checkout.
- [ ] **Delivery fee and currency**: the fee is a hardcoded $30 and all prices are in dollars.
- [ ] **Sizes in the cart**: the size picked on a product page isn't saved with the cart item.
- [ ] **Saved items (wishlist)**: the heart button on product cards does nothing, and the profile page shows an empty state.
- [ ] **Vouchers and coupons**: profile page only.
- [ ] **Live chat and help**: these profile pages are static.
- [ ] **Recommendations across devices**: personalisation uses an anonymous per-browser id. Link it to the account on login so history follows the user.

### Sellers and admin
- [ ] **Seller dashboard** (`/dashboard`): the stats, charts, tables and product form use sample data and aren't connected to the API. Sellers can't list products yet; only admins can.
- [ ] **Admin Buyers, Vendors and Order tracking tabs**: these show sample data. Only the Products tab is live.
- [ ] **Mobile layouts**: the dashboard and admin screens are desktop-only.

### Content and branding
- [ ] **Brand**: "Shop", the text wordmark (`src/components/logo.tsx`) and `@shop` are placeholders.
- [ ] **Footer**: the social links point to `#`, and the newsletter form shows "coming soon".
- [ ] **Instagram section**: uses placeholder images.
- [ ] **Product photos**: the demo catalogue uses generated illustrations. Run `npm run seed:photos` in `backend/` with an `UNSPLASH_ACCESS_KEY` for real photos, or upload your own from the admin page.

### Infrastructure
- [ ] **Postgres**: set `DATABASE_URL` on the API. Migrations run automatically on startup. Set up backups with your host.
- [ ] **Multiple API instances**: login rate limits and the recommender model live in memory per instance. Move rate limits to Redis or Postgres before scaling out.
- [ ] **Image storage**: admin uploads are stored in Postgres (`uploads` table). Move them to object storage (S3, R2) once uploads get heavy.
- [ ] **Deployment**: serve the API over https on the same site as the shop. Set `DATABASE_URL`, `CORS_ORIGIN`, `PUBLIC_URL`, `ADMIN_TOKEN` and `SEED_DEMO_DATA=false` on the API, and `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` on the shop.
- [ ] **Tests**: the API has unit and HTTP tests (`cd backend && npm test`). The shop has none yet. Add component tests and an end-to-end checkout test.

## Thrila's Guide 
   
 ##### node version: 21.2.0

 All logos and Images are of SVG format

Notable Dependencies used include 
- Redux toolkit
- Tailwind css
