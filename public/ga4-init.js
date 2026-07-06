(function initArcanaGoogleTag() {
  var measurementId = "G-DT7RGRTYV4";

  if (window.__arcanaGa4Initialized) {
    return;
  }
  window.__arcanaGa4Initialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  if (!document.querySelector('script[data-arcana-ga4="true"]')) {
    var tag = document.createElement("script");
    tag.async = true;
    tag.src = "https://www.googletagmanager.com/gtag/js?id=" + measurementId;
    tag.dataset.arcanaGa4 = "true";
    document.head.appendChild(tag);
  }

  window.gtag("js", new Date());
  window.gtag("config", measurementId);
})();
