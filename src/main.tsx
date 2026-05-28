import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n"; // Initialize i18n 
import { getLogger } from "./lib/logger";
import { initWebVitals } from "./lib/web-vitals";

const log = getLogger('App');
if (window.performance && window.performance.mark) {
  performance.mark('main-init');
}
log.info('Initialized at', new Date().toISOString());

// Global unhandled error handlers for resilience
window.addEventListener('unhandledrejection', (event) => {
  log.error('Unhandled promise rejection:', event.reason);
});

window.addEventListener('error', (event) => {
  log.error('Unhandled error:', event.error || event.message);
});

// Initialize Web Vitals monitoring
initWebVitals();

// Accessibility auditing in development mode
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000, undefined, undefined, (results) => {
      const violations = results?.violations;
      if (violations?.length) {
        log.warn(`[A11Y] ${violations.length} accessibility violation(s) detected`);
        violations.forEach((v) => {
          log.warn(`[A11Y] ${String(v.impact || 'UNKNOWN').toUpperCase()}: ${v.id} — ${v.description} (${v.nodes.length} element(s))`);
        });
      }
    });
    log.info('[A11Y] axe-core accessibility auditing enabled');
  });
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element not found');
}

window.__ZAPP_MARK_APP_MOUNTED__?.();
ReactDOM.createRoot(rootElement).render(<App />);
