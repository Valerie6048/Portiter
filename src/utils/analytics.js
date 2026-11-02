const MEASUREMENT_ID = 'G-G1R86XF4HS';
const OPT_OUT_KEY = 'portiter-analytics-disabled';
const PRODUCTION_HOSTS = new Set(['akhmdnzr.fun', 'www.akhmdnzr.fun']);

let started = false;
let disabledInSession = false;

export function isAnalyticsDisabled() {
  try {
    const value = window.localStorage.getItem(OPT_OUT_KEY);
    return value === 'true' || (value === null && disabledInSession);
  } catch {
    return disabledInSession;
  }
}

function onTrackedClick(event) {
  const link = event.target instanceof Element && event.target.closest('[data-analytics-event]');
  if (!link || !window.gtag || isAnalyticsDisabled()) return;

  const name = link.dataset.analyticsEvent;
  if (!['contact_click', 'cv_download', 'profile_click'].includes(name)) return;

  const parameters = { cta_location: link.dataset.analyticsLocation };
  if (name === 'contact_click') parameters.contact_method = 'email';
  if (name === 'profile_click') parameters.profile_platform = link.dataset.analyticsPlatform;
  window.gtag('event', name, parameters);
}

export function startAnalytics() {
  if (started || !PRODUCTION_HOSTS.has(window.location.hostname)) return;

  try { window.localStorage.removeItem('portiter-analytics-consent'); } catch { /* ignored */ }

  if (isAnalyticsDisabled()) {
    window[`ga-disable-${MEASUREMENT_ID}`] = true;
    return;
  }

  started = true;
  window[`ga-disable-${MEASUREMENT_ID}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
  document.addEventListener('click', onTrackedClick);
}

export function setAnalyticsDisabled(disabled) {
  disabledInSession = disabled;
  try { window.localStorage.setItem(OPT_OUT_KEY, String(disabled)); } catch { /* session-only choice */ }
  window[`ga-disable-${MEASUREMENT_ID}`] = disabled;

  if (disabled) {
    document.removeEventListener('click', onTrackedClick);
  } else if (started) {
    document.addEventListener('click', onTrackedClick);
    window.gtag('config', MEASUREMENT_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
  } else {
    startAnalytics();
  }
}
