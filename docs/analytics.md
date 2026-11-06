# Portiter analytics

## Setup

- Provider: Google Analytics 4, web measurement ID `G-G1R86XF4HS`.
- Owner: portfolio owner; account/property/stream IDs and reporting settings remain in the owner's GA4 account.
- Installation: `src/utils/analytics.js`, loaded automatically on production page load. No GTM container or additional Google tag should be installed for this stream.
- Traffic: only `akhmdnzr.fun` and `www.akhmdnzr.fun` can load the tag. Local and preview traffic do not reach the production property.
- Privacy mode: the tag starts without a consent banner, with `analytics_storage`, ad storage, ad user data, and ad personalization denied. Google can still receive cookieless measurement pings. Google signals and ad personalization signals are disabled. The footer explains the analytics use, links to Google's privacy policy, and offers an opt-out. The opt-out is stored in localStorage and the tag's `ga-disable-G-G1R86XF4HS` flag stops further collection. Cookies previously set by the old implementation are not used while analytics storage is denied.

## Measurement plan

| Action | Trigger | GA4 event | Parameters | Meaning |
| --- | --- | --- | --- | --- |
| Page visit | Initial load or browser history change via GA4 enhanced measurement | `page_view` | GA4 automatic page fields | Which portfolio and blog pages are viewed and where visitors come from |
| Email contact | Click email link in Contact | `contact_click` | `contact_method=email`, `cta_location=contact` | Contact intent, not a received inquiry |
| CV download | Click either CV download link | `cv_download` | `cta_location=hero` or `project_filter` | Interest in the CV; browser download may still fail |
| Profile visit | Click GitHub or LinkedIn link in Contact, or GitHub in project filter | `profile_click` | `profile_platform=github` or `linkedin`; `cta_location=contact` or `project_filter` | Interest in external profile |

Traffic source, country, and device reports use GA4's built-in reporting; they do not need custom events. Cookieless mode can reduce or model some report values, especially on a low-traffic site. No custom event sends email addresses, full outbound URLs, article body content, or raw search terms. Blog route pageviews follow the existing browser-history behavior; the blog does not send custom content/search events. `contact_click` can be marked as a key event if contact intent is the main goal. There is no confirmed lead event because this site has no inquiry form.

## GA4 stream settings to confirm

In **Admin → Data streams → Web → Enhanced measurement**, keep **Page views** enabled, including **Page changes based on browser history events**. The site relies on that setting for React route changes and does not send manual page views. Turn off **Outbound clicks** and **File downloads** in enhanced measurement because the site sends selected profile/CV events itself and a generic link event may include destination details. Review other automatic events for personal data before enabling them.

To break the custom events down by button location or profile, create event-scoped custom dimensions in **Admin → Data display → Custom definitions** for `cta_location`, `profile_platform`, and `contact_method`. These are optional for the basic event counts but required for those parameter breakdowns in standard reports and Explorations.

## Verification and maintenance

- Code is prepared locally. Browser transmission and GA4 receipt are pending deployment and a production check.
- On production: a fresh visitor loads one `gtag.js` and sends cookieless measurement; navigate into and out of a project to check one page view per route; click one email/profile/CV link to check the matching event; disable analytics in the footer and confirm requests stop, including after reload; re-enable and confirm collection resumes.
- Confirm events in GA4 Realtime or DebugView. A browser request alone does not confirm dashboard receipt. Browser extensions can block GA4.
- Recheck measurement after route, CTA, domain, or privacy-control changes. To disable collection for everyone, remove `startAnalytics()` from `src/main.jsx` and remove the event attributes / analytics module when no longer needed.
