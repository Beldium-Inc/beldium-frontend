# Backend work needed: Wallet & Settings pages

Frontend for both pages is built and live (`/dashboard/wallet`, `/dashboard/settings`). Everything below is currently either computed client-side as a workaround, or shown disabled in the UI with a "not connected" note, pending these endpoints.

## 1. Wallet: nice-to-have (not blocking)

`GET /transactions/` and `GET /transactions/{id}/` already exist and are wired up. Stats (Total Earnings, Pending Payments, Transaction count, Last Payment) are currently **computed client-side** by fetching up to 200 transactions and summing in the browser. This works but doesn't scale and can't do server-side date-range filtering.

Requested: `GET /transactions/summary/` (or similar) returning:
```json
{
  "total_earnings": "12450000.00",
  "pending_payments": "3200000.00",
  "transaction_count": 24,
  "last_payment": { "amount": "850000.00", "paid_at": "2025-10-24T00:00:00Z" }
}
```
Also useful: a `created_at__gte`/`created_at__lte` (or `date_from`/`date_to`) filter on `GET /transactions/` so the "Last 7 days / Last 30 days" filter can be server-side instead of client-side.

## 2. Wallet transaction detail: cosmetic gaps

The transaction detail modal currently shows a static/illustrative "Transaction Timeline" (Payment initiated, then Processing, then Completed) and a placeholder masked "Bank Destination" value. **Neither is backed by real data**, per explicit product decision to ship the UI now and fix later. If you want these real:
- A per-transaction event log (status changes with timestamps). No such model exists today (`OrderTransaction` only has `payment_status` + `paid_at`, no history).
- A bank destination field on `OrderTransaction` or the related payout record. Doesn't exist today.

## 3. Settings: Organizational Profile works today

Wired to real endpoints already:
- `GET /user/get_user`
- `PATCH /user/{id}` (no trailing slash): company_name, phone_number
- `PATCH /miner-profiles/{profile.id}/`: business_role, state_of_operation, local_government_area
- `POST /user/change_password`: old_password, new_password

## 4. Settings: needs new backend work (currently shown disabled in UI)

- **Two-Factor Authentication for miners**: `require_two_factor_authentication` + a `set_2fa` endpoint already exist for compliance accounts (`compliance/views.py`) but not for miners. Requested: same pattern on `MinerProfile`/`User`, a boolean field + `POST /user/set_2fa` (or equivalent).
- **Bank & Payment Details (persisted)**: No `BankDetail`/`BankAccount` model exists. Only a one-shot verification utility exists (`utils/gateways/payments/paystack.py::bank_account_verify`). Requested: a model to store `bank_name`, `account_number` (masked on read), `account_name`, `verification_status` per miner, plus `GET/PATCH /bank-details/` (or nested under `/miner-profiles/{id}/bank-details/`).
- **Compliance Preferences**: No model exists at all. Requested fields: `preferred_contact_method` (enum: email/phone), `assigned_compliance_partner` (likely a FK to a compliance user, read-only from the miner's side), `reminder_frequency` (enum: weekly/monthly/quarterly). Suggest a `MinerCompliancePreference` model + `GET/PATCH /miner-profiles/{id}/compliance-preferences/`.
- **Login Activity**: Nothing tracks login events (device, IP/location, timestamp) anywhere in the codebase currently. Requested: a lightweight `LoginActivity` model logged on successful auth, plus `GET /user/login-activity/` returning the last N entries.
- **Notifications**: No notification-preference model exists. Requested: per-user boolean flags (or a JSON blob) for at least "New order requests", "Payment updates", "Compliance reminders", plus `GET/PATCH /user/notification-preferences/`.

## 5. Compliance Documents page (`/dashboard/compliance`): new page, mostly read-only today

Real models already exist: `MinerLicense` and `MinerDocument` (`compliance/models.py`), surfaced read-only via `GET /compliance/miners/{miner_id}/detail/` (returns `licenses[]` + `documents[]`). The page is wired to this and renders real rows where they exist.

Missing:
- **No create/upload endpoint for miners at all.** The only write access to `MinerLicense`/`MinerDocument` is two admin-side actions: `PATCH /compliance/licenses/{id}/verify/` and `PATCH /compliance/documents/{id}/verify/`. There's nothing a miner can call to submit a new license or document. The "Upload Documents" modal is fully built (document type, file, issue date, expiry toggle) but its submit button currently just shows a toast saying it's not connected, it can't call anything real yet. Requested: `POST /compliance/miners/{miner_id}/licenses/` and `POST /compliance/miners/{miner_id}/documents/` (multipart, with `document`/`file` upload).
- **No "requirements" endpoint.** The "View Requirements" button opens a drawer listing a hardcoded set of 5 document types (Mining License, Environmental Permit, Government-issued ID, Environmental & Compliance Documents, Tax Clearance) matched against the design. If the actual required-documents list differs per miner (e.g. by mineral type or state), a real endpoint would be needed.
- **`MinerDocument` has no `expiry_date` field** (only `MinerLicense` does), and its status enum (`PENDING`/`VERIFIED`/`ISSUES_FOUND`/`REJECTED`) doesn't include "Expired". The page infers "Expired" purely from `MinerLicense.expiry_date` being in the past, documents (not licenses) can never show as expired under the current schema, even though the design implies they should be able to.
