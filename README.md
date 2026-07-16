# iTrans Logistics — Deployment Ready

A fully rebuilt, static-site-ready logistics tracking and payment platform deployable to **GitHub Pages** and **Cloudflare Pages**.

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <your-repo-url>
cd itrans-logistics
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your actual API keys

# 3. Run locally
npm run dev

# 4. Build for production
npm run build
```

## 📁 Project Structure

```
itrans-logistics/
├── .github/workflows/deploy.yml   # GitHub Pages auto-deploy
├── public/
│   ├── pay.html                   # Standalone payment page
│   ├── _redirects                 # Netlify/Cloudflare SPA routing
│   └── _routes.json               # Cloudflare Pages routing
├── src/
│   ├── main.tsx                   # Entry point (HashRouter)
│   ├── App.tsx                    # Main landing page
│   ├── index.css                  # Global styles + Tailwind
│   ├── vite-env.d.ts              # TypeScript env types
│   ├── lib/
│   │   └── utils.ts               # Utility functions (cn)
│   ├── components/
│   │   └── ui/                    # Reusable UI components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       └── dialog.tsx
│   └── pages/
│       ├── PaymentPage.tsx        # Paystack payment page
│       └── AdminPaymentDashboard.tsx # Admin dashboard
├── index.html                     # Root HTML
├── vite.config.ts                 # Vite config (auto-detects host)
├── tailwind.config.js             # Tailwind theme
├── postcss.config.js              # PostCSS config
├── tsconfig.json                  # TypeScript config
├── wrangler.toml                  # Cloudflare deployment config
└── package.json                   # Dependencies
```

## 🌐 Deployment Options

### Option 1: GitHub Pages (Free)

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Select **GitHub Actions** as source
4. The workflow in `.github/workflows/deploy.yml` will auto-deploy on every push to `main`

**URL format:** `https://<username>.github.io/itrans-logistics/`

> ⚠️ Because GitHub Pages uses subpaths, `vite.config.ts` auto-detects `GITHUB_PAGES` and sets the base path to `/itrans-logistics/`.

### Option 2: Cloudflare Pages (Free — Recommended)

1. Push repo to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
3. Click **Create application → Pages → Connect to Git**
4. Select your repo, branch `main`
5. Build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
6. Add environment variables in dashboard:
   - `VITE_PAYSTACK_PUBLIC_KEY`
   - `VITE_EMAILJS_SERVICE_ID`
   - `VITE_EMAILJS_TEMPLATE_ID`
   - `VITE_EMAILJS_PUBLIC_KEY`
7. Click **Save and Deploy**

**URL format:** `https://itrans-logistics.pages.dev`

### Option 3: Cloudflare Workers (Advanced)

For full-stack with backend API:

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy dist
```

## 🔧 Key Changes from Original

| Issue | Fix |
|-------|-----|
| `BrowserRouter` breaks on static hosts | Replaced with `HashRouter` |
| Missing build config | Added full Vite + Tailwind + TS setup |
| Hardcoded API keys | Moved to environment variables |
| Local image paths fail on deploy | Replaced with Unsplash CDN images |
| No SPA routing config | Added `_redirects` + `_routes.json` |
| No CI/CD | Added GitHub Actions workflow |
| Missing UI dependencies | Created lightweight UI components |
| Backend server required | Made frontend fully static (mock data) |

## 🔑 Environment Variables

Create a `.env` file:

```env
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

> In production (Cloudflare Dashboard), add these as **Environment Variables** under your Pages project settings.

## 💳 Payment Flow

1. User enters tracking number on homepage
2. If shipment is in customs, orange banner appears with "Pay Now" button
3. Clicking opens Paystack inline popup
4. On success, green confirmation banner shows
5. Payment data is logged (in production, connect to backend API)

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/#/` | Homepage (tracking + services + quote) |
| `/#/pay?tracking=ITR78738957` | Payment page |
| `/#/admin` | Admin payment dashboard |
| `/pay.html?tracking=ITR78738957` | Standalone HTML payment page |

## 🛠️ Backend Integration (Optional)

The original backend files (`server.js`, `payments_updated.js`, `emailService.js`, `smsService.js`) are **not included** in this static build. To add them back:

1. Deploy backend separately (Railway, Render, Fly.io, or Cloudflare Workers)
2. Set `VITE_API_BASE_URL` to your API domain
3. Replace mock data fetches with real API calls

## 📄 License

MIT — iTrans Logistics Ltd.
