---
title: Customers Domain
status: verified
owner: unassigned
last_verified: 2026-09-12
source_of_truth:
  - apps/storefront/src/lib/data/customer.ts
  - apps/storefront/src/modules/account
related:
  - ../architecture/storefront.md
  - orders.md
---

# Customers Domain

## Operations

All customer operations are implemented in `apps/storefront/src/lib/data/customer.ts` (all server actions, `"use server"`), calling the Medusa store customer API through the SDK:

| Function | Purpose |
|---|---|
| `retrieveCustomer` | Fetch the logged-in customer (session-based, via auth cookie). |
| `updateCustomer` | Update profile fields. |
| `signup(...)` | Register a new customer account. |
| `login(...)` | Authenticate and set the auth cookie/session. |
| `confirmEmailVerification(...)` | Complete an email-verification flow. |
| `signout(countryCode)` | Clear the session and redirect. |
| `transferCart()` | Attach the current guest cart to the now-authenticated customer. |
| `addCustomerAddress`, `updateCustomerAddress`, `deleteCustomerAddress` | Manage the customer's saved addresses. |

UI: `apps/storefront/src/modules/account/**` (login/register forms, address book, profile, order history entry points).

## Business rules

- `transferCart()` exists specifically to move a cart created while browsing as a guest onto the account once the customer logs in or signs up — confirm the exact trigger points by reading the login/signup call sites in the account UI rather than assuming.
- Session/auth handling (JWT storage, refresh) is delegated to `@medusajs/js-sdk` and Medusa core; no custom auth logic exists in this repository. See [../architecture/system-overview.md](../architecture/system-overview.md#authentication-and-authorization).

## Known gaps

- No automated tests cover signup, login, or address management.

## Open questions

- Email verification flow (`confirmEmailVerification`) — whether it is fully wired into the signup UI end-to-end was not traced in this pass; verify before relying on it.
