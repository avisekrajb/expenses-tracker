# Kharcha – Kathmandu Expense Tracker

Mobile-first expense tracker (React + Vite) with a Node/Express + MongoDB Atlas API,
Cloudinary image storage, budgets, friend loans (give & take), receipt photos, insights,
search/filters, CSV export and bar / line / pie charts (daily to 10-year reports, month
navigation, dark mode, profile photo).

## Features

### Core
- Email/password accounts (JWT), profile photo, light/dark mode.
- 10 categories: Travel, Eating, Hostel Rent, Water, Clothes, Medicine, Hair Cut, Recharge, Home, Others.
- Add / edit / delete expenses (delete requires the account password).
- Reports from daily up to 10 years, month navigation, bar / line / pie charts.
- Mobile app layout with bottom navigation.

### Added in v1.1
1. **Monthly budgets** – overall + per-category limits, progress bars and over-budget alerts.
2. **Receipt photos** – attach a receipt to any expense, stored on Cloudinary and viewable full-screen.
3. **Search & filters** – search descriptions/categories, filter by category, date range and amount.
4. **CSV export** – download the currently filtered expenses as a spreadsheet-ready CSV.
5. **Insights** – month-over-month change, daily average, projected month spend, biggest expense, active days, add streak.

### Added in v1.2
6. **Give & Take** – track money you lend to or borrow from friends: friend name, amount, date, optional return-by date and note, with settle / undo, edit, delete, search, filters and a "to receive / to pay / net" summary on Home and the new tab.

### Added in v1.3
7. **Detailed profile** – account info, member-since date, spending stats, monthly budget and friend balance, opened from the avatar dropdown.
8. **Five bottom-nav buttons** – Profile moved into the avatar menu (with theme toggle and logout).
9. **Hash routing** – the selected section is in the URL (`#/home`, `#/expenses`, `#/budget`, `#/loans`, `#/total`, `#/profile`), so refreshing or sharing a link keeps the same page.

## Run locally

```bash
# 1) API
cd server
cp .env.example .env        # fill in MongoDB Atlas + Cloudinary values
npm install
npm run dev                 # http://localhost:5000

# 2) Client (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Docker alternative: `docker compose up`.

## Environment (`server/.env`)

| Name | Meaning |
|---|---|
| `MONGO_URI` | MongoDB connection string (`mongodb+srv://...`) |
| `MONGODB_DB` | Database name (e.g. `expensetracker`) |
| `JWT_SECRET` | Long random string used to sign login tokens |
| `PORT` | API port (default 5000) |
| `CLIENT_URL` | Allowed browser origin(s), comma-separated |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

`client/.env`:

| Name | Meaning |
|---|---|
| `VITE_API_URL` | API base URL, e.g. `https://kharcha-api.vercel.app/api` |

## API

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Log in, returns JWT |
| GET | `/api/auth/me` | Current user |
| GET | `/api/expenses` | List expenses |
| POST | `/api/expenses` | Create expense (`receipt`, `receiptPublicId` optional) |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete (body `{ password }`) |
| GET | `/api/expenses/summary?from=&to=` | Aggregated totals |
| GET / PUT / DELETE | `/api/budgets/:month` | Monthly budget (`YYYY-MM`) |
| GET / POST | `/api/loans` | List friend loans (`?type=given\|taken&settled=true\|false&q=name`) / create |
| GET | `/api/loans/summary` | Money to receive, to pay, net and record counts |
| PUT | `/api/loans/:id` | Edit a friend loan (`settled` accepted) |
| PUT | `/api/loans/:id/settle` | Settle a loan or reopen it with `{ "settled": false }` |
| DELETE | `/api/loans/:id` | Delete a friend loan |
| POST | `/api/uploads/receipt` | Upload receipt image (multipart `receipt`) |
| PUT | `/api/users/me` | Update name / profile photo |
| DELETE | `/api/users/me/photo` | Remove profile photo |
| GET | `/api/health` | Health + Cloudinary status |

## Deploy on Vercel (two projects, one repo)

**Backend – project root `server`**
- Framework preset: Other
- Environment variables: `NODE_ENV=production`, `MONGO_URI`, `MONGODB_DB`,
  `JWT_SECRET`, `CLIENT_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET`
- `server/vercel.json` routes every request to `api/index.js` (Express).

**Frontend – project root `client`**
- Framework preset: Vite, build `npm run build`, output `dist`
- Environment variable: `VITE_API_URL=https://<backend-project>.vercel.app/api`

In MongoDB Atlas → Network Access allow `0.0.0.0/0` so Vercel can connect.

## Tests

```bash
cd server
MONGO_URI="mongodb+srv://..." MONGODB_DB=expensetracker_test JWT_SECRET=test \
  node test/e2e.mjs
```

The suite covers auth, validation, CRUD, summaries, budgets, friend loans (give/take,
settle, filters and summary), Cloudinary uploads, receipts, profile photos, CORS and
password-protected deletes (52 assertions).

## Notes
- Never commit `.env` files (they are in `.gitignore`).
- Receipts and avatars are stored on Cloudinary; when Cloudinary is not configured the API
  falls back to inline data URLs for local development.
- Deleting an expense or replacing a receipt removes the old Cloudinary asset.
