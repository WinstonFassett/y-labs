console.log("service worker!");
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/y-labs/service-worker.js")
    .then((registration) => {
      console.log("Service worker successfully registered", registration.scope);
    })
    .catch((error) => {
      console.error("Service worker registration failed:", error);
    });
}
