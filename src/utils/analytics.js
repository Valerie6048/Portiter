const MEASUREMENT_ID = 'G-G1R86XF4HS';
const CONSENT_KEY = 'portiter-analytics-consent';
const PRODUCTION_HOSTS = new Set(['akhmdnzr.fun', 'www.akhmdnzr.fun']);

let started = false;
let sessionChoice = null;

export function getAnalyticsConsent() {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : sessionChoice;
  } catch {
    return sessionChoice;
  }
}

function onTrackedClick(event) {
  const link = event.target.closest('[data-analytics-event]');
  if (!link || !window.gtag) return;

  const name = link.dataset.analyticsEvent;
  const location = link.dataset.analyticsLocation;
  if (!['contact_click', 'cv_download', 'profile_click'].includes(name)) return;

  const parameters = { cta_location: location };
  if (name === 'contact_click') parameters.contact_method = 'email';
  if (name === 'profile_click') parameters.profile_platform = link.dataset.analyticsPlatform;
  window.gtag('event', name, parameters);
}

export function startAnalytics() {
  if (started || getAnalyticsConsent() !== 'granted' || !PRODUCTION_HOSTS.has(window.location.hostname)) return;
  started = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
  document.addEventListener('click', onTrackedClick);
}

function clearAnalyticsCookies() {
  const hostname = window.location.hostname;
  const domains = ['', hostname, `.${hostname}`, '.akhmdnzr.fun'];
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.trim().split('=')[0];
    if (!/^_ga(?:_|$)/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`;
    }
  }
}

export function setAnalyticsConsent(choice) {
  sessionChoice = choice;
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    // Consent still applies for this page when storage is unavailable.
  }

  if (choice === 'granted') {
    startAnalytics();
  } else if (started) {
    document.removeEventListener('click', onTrackedClick);
    clearAnalyticsCookies();
    window.location.reload(); // Unload the tag entirely after withdrawal.
  }
}
