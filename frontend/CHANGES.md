# Frontend changes

## Installation

- Installed `react-router-dom` in `frontend` with:

```bash
npm install react-router-dom
```

## `src/App.jsx`

1. Imported React Router and all requested pages.
2. Added a shared layout containing `Navbar`, the routed page area, and `Footer`.
3. Added routes for Home, About, Contact, Login, Signup, Predict, Upload, Dashboard, Insights, History, Recommendations, and Profile.

## `src/api/index.js`

1. Added the shared `request(path, options)` helper.
2. It joins the configured `VITE_API_URL` with the request path.
3. It sends a bearer token from `localStorage` when one exists.
4. It throws a readable error for non-success responses.

## `src/components/Navbar.jsx`

1. Added links for the main application pages.
2. Added a mobile menu button that shows or hides the links.
3. Added Login/Signup links for signed-out users and Logout for signed-in users.

## `src/components/Footer.jsx`

1. Added the shared footer text.
2. Styled the footer with responsive Tailwind utility classes.

## `src/pages`

1. Added simple heading pages for Home, About, Contact, Login, Signup, Upload, Dashboard, Insights, History, Recommendations, and Profile.
2. Added `Predict.jsx` with the five planned prediction inputs.
3. The prediction form calls `/predict` through the shared API helper.
4. The prediction page displays loading, error, and result states.

## Prediction improvements

1. Added `RiskBadge.jsx` to display Low, Medium, and High risk as coloured pills.
2. Added `ProbabilityBar.jsx` to display the churn probability as a horizontal bar.
3. Added `recommendations.js` with three short retention actions for each risk level.
4. Updated `Predict.jsx` to show the matching actions below each prediction result.
5. Added example hints and a `Fill example` button for easier testing.
6. Added validation requiring at least one order, at least one item, and spend greater than zero.

## Upload page

1. Added `predictBatch(file)` to send CSV files to `/predict/batch` with `FormData`.
2. Built the upload page with required-column guidance, a sample CSV template download, and CSV-only file validation.
3. Added a 10 MB file-size limit and header validation before upload.
4. Added loading and error states for batch uploads.
5. Added `SummaryCards.jsx` for total, high, medium, and low counts.
6. Added `ResultsTable.jsx` with probability sorting, risk filtering, 20-row pagination, risk badges, and CSV download.

## Dashboard and insights

1. Added `getStats()` and `getInsights()` API helpers.
2. Built the dashboard with summary cards, risk PieChart, risk BarChart, and an upload empty state.
3. Built the insights page with metric meanings, a positive/negative feature-importance BarChart, and a limitations box.
4. Added loading and error states to both data-driven pages.

## Authentication

1. Added `AuthContext.jsx` with user, token, login, signup, logout, localStorage persistence, and startup user restoration.
2. Added `ProtectedRoute.jsx` to redirect signed-out users to Login and preserve their requested page.
3. Built controlled Login and Signup forms with email, password, and confirmation validation.
4. Added API error messages, loading states, and disabled Google buttons marked TODO.
5. Updated the Navbar to show the logged-in user name and Logout action.
6. Protected Predict, Upload, Dashboard, History, and Profile while keeping the requested public pages available.

## History, recommendations, and profile

1. Added `getHistory`, `getMe`, `updateProfile`, and `changePassword` API helpers.
2. Built History with date, source, probability, risk badge, empty state, and 20-row pagination.
3. Built Recommendations with High, Medium, and Low cards from `recommendations.js`.
4. Added a short guide explaining how a small seller can use the retention actions.
5. Built Profile with account details, name editing, password changing, API errors, loading states, and logout.

## Public pages and polish

1. Built Home with a hero section, three feature cards, a three-step guide, and Predict/Upload buttons.
2. Built About with the project purpose, plain-language feature explanations, technology stack, limitations, and team placeholder.
3. Built Contact with a controlled form using `sendContact`, success/error messages, and a loading state.
4. Added reusable `Spinner` and `ErrorMessage` components.
5. Added responsive spacing and visible focus styles to the new public-page controls.

## Design system and application shell

1. Read and followed `design/DESIGN (1).md` without copying invented reference data.
2. Added Inter and JetBrains Mono font tokens in `src/index.css` and loaded both fonts in `index.html`.
3. Added shared `Card`, `MetricCard`, `PageHeader`, `Button`, `RiskBadge`, and `DataTable` components.
4. Added `AppShell` with a 240px desktop sidebar, mobile drawer, and slim top bar.
5. Added `PublicNavbar` for Home, About, Contact, Login, and Signup.
6. Updated routing so protected application pages use `AppShell`, while public pages use the top navbar.
7. Updated Dashboard, History, Predict, Upload, Insights, Recommendations, and Profile to use consistent page headers and design tokens.
