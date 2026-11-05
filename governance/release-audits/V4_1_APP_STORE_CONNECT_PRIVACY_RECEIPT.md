# Soul Codex 4.1 — App Store Connect Privacy Reconciliation Receipt

Status: **INCOMPLETE UNTIL OWNER EVIDENCE IS ENTERED**

This receipt is the release authority for App Store Connect privacy answers for the exact iOS binary being submitted. It must be completed from the live App Store Connect UI after the final candidate archive is identified.

## Exact candidate

- Source Git SHA: `<required>`
- iOS bundle ID: `app.soulcodex.ios`
- App Store numeric ID: `6764221944`
- Marketing version: `4.1.0`
- Build number shown in App Store Connect: `<required>`
- Archive / artifact SHA-256: `<required>`
- Receipt captured by: `<required>`
- Receipt capture date/time (America/New_York): `<required>`

## Required live App Privacy answers

For the submitted 4.1 binary, App Store Connect must not remain at **Data Not Collected** when the shipped behavior transmits or stores the categories below.

| App Store category | Collected | Linked to user | Tracking | Purpose |
|---|---:|---:|---:|---|
| Contact Info → Name | Yes | Yes | No | App Functionality |
| Contact Info → Email Address | Yes | Yes | No | App Functionality |
| Identifiers → User ID | Yes | Yes | No | App Functionality |
| Location → Coarse Location | Yes | Yes | No | App Functionality |
| Sensitive Info | Yes | Yes | No | App Functionality |
| Purchases → Purchase History | Yes | Yes | No | App Functionality |
| User Content → Other User Content | Yes | Yes | No | App Functionality |

Tracking: **No**

Tracking domains: **None**

Raw payment-card or bank information collected by Soul Codex: **No**

## Owner-entered App Store Connect evidence

Complete every line before marking this receipt PASS.

- [ ] Live App Privacy page no longer says **Data Not Collected**
- [ ] Name answer matches the table above
- [ ] Email Address answer matches the table above
- [ ] User ID answer matches the table above
- [ ] Coarse Location answer matches the table above
- [ ] Sensitive Info answer matches the table above
- [ ] Purchase History answer matches the table above
- [ ] Other User Content answer matches the table above
- [ ] Tracking remains No
- [ ] Privacy Policy URL is the verified production/store-review URL
- [ ] Screenshots or exported App Store Connect evidence saved with the release ledger
- [ ] Evidence references the exact submitted build number and candidate SHA

## Evidence references

- App Store Connect privacy screenshot/export: `<required>`
- Release candidate receipt/artifact: `<required>`
- Public privacy-policy verification receipt: `<required>`

## Final disposition

- [ ] **PASS — live App Store Connect privacy answers reconciled to this exact candidate**
- [ ] **BLOCKED — do not submit / resubmit this candidate**

No source-code test, privacy manifest, public storefront page, or prior App Store version may be used as a substitute for this owner-entered live App Store Connect receipt.
