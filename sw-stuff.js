// SERVICE WORKERS
if ('serviceWorker' in navigator) {
  var isPushEnabled = false;

  window.addEventListener('load', function() {
    var pushButton = document.querySelector('#switch-2');
    pushButton.addEventListener('change', function() {
      if (isPushEnabled) {
        unsubscribe();
      } else {
        subscribe();
      }
    });
  });

  navigator.serviceWorker.register('service-worker.js').then(function(reg) {
    // updatefound is fired if service-worker.js changes.
    reg.onupdatefound = function() {
      var installingWorker = reg.installing;

      installingWorker.onstatechange = function() {
        switch (installingWorker.state) {
          case 'installed':
            if (navigator.serviceWorker.controller) {
              console.log('New or updated content is available.');
            } else {
              console.log('Content is now available offline!');

              var snackbarContainer = document.querySelector('#offline-ready');
              var data = {message: 'Content is now available offline!'};
              snackbarContainer.MaterialSnackbar.showSnackbar(data);
            }
            break;

          case 'redundant':
            console.error('The installing service worker became redundant.');
            break;
        }
      };
    };
  }).then(initialiseState).catch(function(e) {
    console.error('Error during service worker registration:', e);
  });



  // Once the service worker is registered set the initial state
  function initialiseState() {
    // Are Notifications supported in the service worker?
    if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
      console.warn('Notifications aren\'t supported.');
      return;
    }

    if (Notification.permission === 'denied') {
      console.warn('The user has blocked notifications.');
      return;
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
      console.warn('Push messaging isn\'t supported.');
      return;
    }

    // We need the service worker registration to check for a subscription
    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
      // Do we already have a push message subscription?
      serviceWorkerRegistration.pushManager.getSubscription()
        .then(function(subscription) {
          var pushButton = document.querySelector('#switch-2');
          pushButton.parentNode.MaterialSwitch.enable()

          if (!subscription) {
            return;
          }

          // Set your UI to show they have subscribed for
          pushButton.click();
          isPushEnabled = true;
        })
          // push messages
        .catch(function(err) {
          console.warn('Error during getSubscription()', err);
        });
    });
  }


  function subscribe() {
    // Disable the button so it can't be changed while
    // we process the permission request
    var pushButton = document.querySelector('#switch-2');
    pushButton.parentNode.MaterialSwitch.disable()

    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
      serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
        .then(function(subscription) {
          // The subscription was successful
          isPushEnabled = true;
          pushButton.parentNode.MaterialSwitch.enable()

          return sendSubscriptionToServer(subscription);
        })
        .catch(function(e) {
          if (Notification.permission === 'denied') {
            console.warn('Permission for Notifications was denied');
            pushButton.parentNode.MaterialSwitch.disable()
          } else {
            console.error('Unable to subscribe to push.', e);
            pushButton.parentNode.MaterialSwitch.enable()
          }
        });
    });
  }

  function unsubscribe() {
    var pushButton = document.querySelector('#switch-2');
    pushButton.parentNode.MaterialSwitch.disable()

    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
      serviceWorkerRegistration.pushManager.getSubscription().then(
        function(pushSubscription) {
          if (!pushSubscription) {
            isPushEnabled = false;
            pushButton.parentNode.MaterialSwitch.enable()
            return;
          }

          var subscriptionId = pushSubscription.subscriptionId;

          // We have a subscription, so call unsubscribe on it
          pushSubscription.unsubscribe().then(function(successful) {
            pushButton.parentNode.MaterialSwitch.enable()
            window.endpoint = null;
            window.greet = alertName;
            isPushEnabled = false;
          }).catch(function(e) {
            console.log('Unsubscription error: ', e);
            pushButton.parentNode.MaterialSwitch.enable()
          });
        }).catch(function(e) {
          console.error('Error thrown while unsubscribing from push messaging.', e);
        });
    });
  }

  function sendSubscriptionToServer(sub) {
    // SET AUTH KEYS FOR PAYLOAD
    var key;
    var authSecret;

    var rawKey = sub.getKey ? sub.getKey('p256dh') : '';
    key = rawKey ?
          btoa(String.fromCharCode.apply(null, new Uint8Array(rawKey))) :
          '';
    var rawAuthSecret = sub.getKey ? sub.getKey('auth') : '';
    authSecret = rawAuthSecret ?
                 btoa(String.fromCharCode.apply(null, new Uint8Array(rawAuthSecret))) :
                 '';


    fetch('https://h2.io:7777/register', {
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        key: key,
        authSecret: authSecret,
      }),
    });

    function notify(e) {
      fetch('https://h2.io:7777/sendNotification', {
        method: 'post',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          key: key,
          authSecret: authSecret,
          payload: 'Hello, ' + e.target[0].value + '!' ,
          delay: '5',
          ttl: 0,
        }),
      });
    }
    window.greet = notify;
  }
}

