// Extracted from index.html to keep executable JavaScript out of HTML.
// Firebase Authentication is the single authority for signed-in state.
(function configureFirebaseCompatBootstrap() {
  let bootstrapStarted = false;

  window._initFbCompat = function () {
    if (bootstrapStarted) return;
    try {
      if (typeof firebase === 'undefined') {
        setTimeout(window._initFbCompat, 200);
        return;
      }
      bootstrapStarted = true;

      const fbCompatConfig = {
        apiKey: "AIzaSyDfeeNZ30jiL1h66zlbBwhS6uIo8pJaZAU",
        authDomain: "battery-bank-empire.firebaseapp.com",
        databaseURL: "https://battery-bank-empire-default-rtdb.firebaseio.com",
        projectId: "battery-bank-empire",
        storageBucket: "battery-bank-empire.firebasestorage.app",
        messagingSenderId: "16226129753",
        appId: "1:16226129753:web:ac52a2600dd3e8bef9de48"
      };

      let loyaltyApp = firebase.apps.find(function (app) { return app.name === 'loyalty'; });
      if (!loyaltyApp) loyaltyApp = firebase.initializeApp(fbCompatConfig, 'loyalty');

      window.fbDb = loyaltyApp.database();
      window.fbAuth = loyaltyApp.auth();
      window.firebaseAuthStateReady = false;
      window.firebaseCurrentUser = null;
      window.firebaseAuthPersistenceMode = 'local';
      window.firebaseAuthObserverRegistrations = Number(window.firebaseAuthObserverRegistrations || 0);

      const persistence = firebase.auth && firebase.auth.Auth && firebase.auth.Auth.Persistence
        ? firebase.auth.Auth.Persistence.LOCAL
        : null;

      window.firebaseAuthPersistenceReady = persistence && typeof window.fbAuth.setPersistence === 'function'
        ? window.fbAuth.setPersistence(persistence).catch(function (error) {
            console.warn('[Firebase Auth] Local persistence setup failed:', error && error.message ? error.message : error);
            return null;
          })
        : Promise.resolve(null);

      window.firebaseAuthReady = window.firebaseAuthPersistenceReady.then(function () {
        return new Promise(function (resolve) {
          let initialStateResolved = false;
          window.firebaseAuthObserverRegistrations += 1;
          window.fbAuth.onAuthStateChanged(function (user) {
            window.firebaseCurrentUser = user || null;
            window.firebaseAuthStateReady = true;
            try {
              window.dispatchEvent(new CustomEvent('bb-firebase-auth-state', {
                detail: { user: user || null, initial: !initialStateResolved }
              }));
            } catch (eventError) { /* Older browser fallback: shared globals remain available. */ }

            if (!initialStateResolved) {
              initialStateResolved = true;
              resolve(user || null);
            }
          }, function (error) {
            console.warn('[Firebase Auth] Initial state observer failed:', error && error.message ? error.message : error);
            window.firebaseCurrentUser = null;
            window.firebaseAuthStateReady = true;
            try {
              window.dispatchEvent(new CustomEvent('bb-firebase-auth-state', {
                detail: { user: null, initial: !initialStateResolved, error: error || null }
              }));
            } catch (eventError) { }
            if (!initialStateResolved) {
              initialStateResolved = true;
              resolve(null);
            }
          });
        });
      });

      console.log('✅ Firebase Realtime Database and Auth ready with local persistence.');
    } catch (error) {
      bootstrapStarted = false;
      console.warn('Firebase compat init error:', error && error.message ? error.message : error);
    }
  };

  document.addEventListener('DOMContentLoaded', window._initFbCompat, { once: true });
})();
