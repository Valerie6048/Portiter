# Portiter analytics

## Setup

- Provider: Google Analytics 4, web measurement ID `G-G1R86XF4HS`.
- Owner: portfolio owner; account/property/stream IDs and reporting settings remain in the owner's GA4 account.
- Installation: `src/utils/analytics.js`, loaded once after visitor consent. No GTM container or additional Google tag should be installed for this stream.
- Traffic: only `akhmdnzr.fun` and `www.akhmdnzr.fun` can load the tag. Local and preview traffic do not reach the production property.
- Consent: visitor accepts or rejects analytics in the site banner. Choice is stored in localStorage; the footer (or the floating control on project pages) opens settings again. Ads consent remains denied. Withdrawing after acceptance clears GA cookies and reloads to unload the tag.

## Measurement plan

| Action | Trigger | GA4 event | Parameters | Meaning |
| --- | --- | --- | --- | --- |
| Page visit | Initial load or browser history change via GA4 enhanced measurement | `page_view` | GA4 automatic page fields | Which portfolio pages are viewed and where visitors come from |
| Email contact | Click email link in Contact | `contact_click` | `contact_method=email`, `cta_location=contact` | Contact intent, not a received inquiry |
| CV download | Click either CV download link | `cv_download` | `cta_location=hero` or `project_filter` | Interest in the CV; browser download may still fail |
| Profile visit | Click GitHub or LinkedIn link in Contact, or GitHub in project filter | `profile_click` | `profile_platform=github` or `linkedin`; `cta_location=contact` or `project_filter` | Interest in external profile |

Traffic source, country, and device reports use GA4's built-in reporting; they do not need custom events. No event sends email addresses or full outbound URLs. `contact_click` can be marked as a key event if contact intent is the main goal. There is no confirmed lead event because this site has no inquiry form.

## GA4 stream settings to confirm

In **Admin → Data streams → Web → Enhanced measurement**, keep **Page views** enabled, including **Page changes based on browser history events**. The site relies on that setting for React route changes and does not send manual page views. Turn off **Outbound clicks** and **File downloads** in enhanced measurement because the site sends selected profile/CV events itself and a generic link event may include destination details. Review other automatic events for personal data before enabling them.

To break the custom events down by button location or profile, create event-scoped custom dimensions in **Admin → Data display → Custom definitions** for `cta_location`, `profile_platform`, and `contact_method`. These are optional for the basic event counts but required for those parameter breakdowns in standard reports and Explorations.

## Verification and maintenance

- Code is prepared locally. Browser transmission and GA4 receipt are pending deployment and a consented production check.
- On production: fresh visitor loads no `gtag.js` or GA4 collection request; Reject keeps it off across reload; Accept loads one tag and sends a page view; navigate into and out of a project to check one page view per route; click one email/profile/CV link to check the matching event; withdraw in footer and check requests stop after reload.
- Confirm events in GA4 Realtime or DebugView. A browser request alone does not confirm dashboard receipt. Browser extensions can block GA4.
- Recheck measurement after route, CTA, domain, or consent UI changes. To disable collection, remove `AnalyticsConsent` from `src/App.jsx` and remove the event attributes / analytics module when no longer needed.
