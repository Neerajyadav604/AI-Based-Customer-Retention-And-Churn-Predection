Project: AI-based customer churn prediction web app for small online sellers, local vendors and kirana stores. Final-year B.Tech project: the student must be able to explain every line to a teacher.

Stack: React (Vite, JavaScript, NO TypeScript), Tailwind CSS v4 utility classes only (src/index.css contains @import "tailwindcss" plus a small @theme block for fonts), react-router-dom for pages, recharts for charts. No Redux, no other state or UI libraries.

Code rules: simple function components with useState/useEffect, one job per file, each file under ~150 lines, a short comment above each section, plain variable names, no clever tricks. Every page handles loading, error and empty states. Layouts must work on mobile.

Folders: src/api/index.js (ALL fetch calls live here), src/components/, src/pages/, src/context/, src/data/. API base URL comes from import.meta.env.VITE_API_URL (fallback http://localhost:8000).

Backend contract (planned; if an endpoint is not built yet, return sample data from the same function in src/api/index.js and mark it // TODO: replace with real API):
- POST /predict  body {recency_days, frequency, monetary, tenure_days, total_items} -> {churn_probability (0-1), risk_level "Low"|"Medium"|"High", likely_to_churn}  (exists)
- POST /predict/batch  multipart field "file", CSV columns customer_id, order_id, order_date, quantity, unit_price -> {summary:{total,high,medium,low}, customers:[{customer_id, recency_days, frequency, monetary, churn_probability, risk_level}]}
- GET /stats -> top_customers: [{customer_id, recency_days, frequency, monetary, churn_probability, risk_level}].  (the user's latest upload)
- GET /model/insights -> {metrics:{accuracy,precision,recall,f1,roc_auc,threshold}, feature_importance:[{feature, value}]}
- POST /auth/signup {name,email,password}; POST /auth/login {email,password} -> {access_token, user:{name,email}}; GET /auth/me; PUT /auth/profile {name}; PUT /auth/password {current_password,new_password}. Protected calls send header Authorization: Bearer <token>.
- GET /history -> [{id, created_at, source: "single"|"upload", summary}]
- POST /contact {name,email,message}

DESIGN: Follow frontend/DESIGN.md. The images in frontend/design/ are layout references only. They contain invented sample data (Telco, XGBoost, SHAP, names, emails, contracts, MRR, AUC 0.884). NEVER copy their text, numbers, model names or features. Show only data from our API, or clearly labelled sample data during development. Our customers have only: customer_id, recency_days, frequency, monetary, tenure_days, total_items, avg_order_value, churn_probability, risk_level. There are no names, emails, contracts or monthly charges. Our model is Logistic Regression: no SHAP, no model selection, no retrain or deploy buttons. Use Tailwind default palette classes that match DESIGN.md (indigo-600, slate-50, slate-200, slate-900, slate-500, red/amber/green for risk).

Do not change files I don't mention. After generating, explain each file in 3 plain-English lines.