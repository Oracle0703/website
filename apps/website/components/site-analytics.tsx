import Script from "next/script";

// Privacy-light, env-driven analytics.
//
// Nothing renders unless an ID is set, so whether analytics runs — and which
// provider — is a deploy decision. No provider is hardcoded and no cost is
// incurred by default. Set ONE of these (build-time NEXT_PUBLIC_* vars):
//
//   NEXT_PUBLIC_PLAUSIBLE_DOMAIN   e.g. "meaningful.ink"  (Plausible, cookieless)
//   NEXT_PUBLIC_PLAUSIBLE_SRC      optional self-hosted script URL
//   NEXT_PUBLIC_GA_ID              e.g. "G-XXXXXXXXXX"    (Google Analytics 4)
//   NEXT_PUBLIC_CLARITY_ID         e.g. "abcdef1234"      (Microsoft Clarity)
//
// Note: Plausible is cookieless and needs no consent banner. GA4/Clarity set
// cookies, so enabling them should be paired with a privacy policy + cookie
// consent (tracked separately as a P2 item).
export function SiteAnalytics() {
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const plausibleSrc =
    process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js";
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <>
      {plausibleDomain ? (
        <Script
          defer
          data-domain={plausibleDomain}
          src={plausibleSrc}
          strategy="afterInteractive"
        />
      ) : null}

      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
          </Script>
        </>
      ) : null}

      {clarityId ? (
        <Script id="clarity-init" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${clarityId}");`}
        </Script>
      ) : null}
    </>
  );
}
