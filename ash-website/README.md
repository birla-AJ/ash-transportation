# Ash Transportation Management System — Admin Website

React + Material UI + AG Grid Enterprise admin dashboard.

## Setup

```bash
cd ash-website
npm install
cp .env.example .env
# set REACT_APP_API_BASE_URL to your backend URL
# optional: set REACT_APP_AG_GRID_LICENSE_KEY if you have an AG Grid Enterprise license
npm start
```

Runs at `http://localhost:3001` (or whatever port CRA picks). Make sure the
backend's `CORS_ORIGIN` in `.env` includes this URL.

## Pages

- **Login** — email/password, remember me, same flow as mobile
- **Dashboard** — today's/monthly/yearly trip counts, recent challans, latest activity
- **Add Challan** — Truck Number + Place Of Delivery only; Save / Save & Print / Reset
- **Reports** — AG Grid with a search box in every column header (floating filters),
  top filters (truck number, duration presets + custom range), Edit/Delete/Reprint
  actions, Export with preview before download (CSV/Excel/PDF)
- **Audit Logs** — full history of create/update/delete/print/login actions
- **Settings** — company info + printer configuration

## Receipt printing

`src/components/Receipt/Receipt.jsx` and `receipt.css` reproduce the physical
NTPC Khargone consignment challan pixel-for-pixel: same header, border,
spacing, labels — only Challan Number, Truck Number, Place Of Delivery, Date
and Time are dynamic. `ReceiptPrintView.jsx` renders 4 identical A5 pages in
one print job (reliable across all printer drivers) and calls
`POST /challans/:id/print` to log the print event before opening the browser
print dialog.

## Build for production

```bash
npm run build
```

Outputs static files to `build/` — served by Nginx in production (see the
deployment guide).
