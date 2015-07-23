var isPushEnabled = false;
var useNotifications = false;

var btn = document.querySelector('button'); 

Notification.requestPermission();

window.addEventListener('load', function() {   
  btn.addEventListener('click', function() {  
    if (isPushEnabled) {  
      unsubscribe();  
    } else {  
      subscribe();  
    }  
  });

  // Check that service workers are supported, if so, progressively  
  // enhance and add push messaging support, otherwise continue without it.  
  if ('serviceWorker' in navigator) {  
    navigator.serviceWorker.register('sw.js').then(function(reg) {
      if(reg.installing) {
        console.log('Service worker installing');
      } else if(reg.waiting) {
        console.log('Service worker installed');
      } else if(reg.active) {
        console.log('Service worker active');
      }

      initialiseState(reg);
    });  
  } else {  
    console.log('Service workers aren\'t supported in this browser.');  
  }  
});


// Once the service worker is registered set the initial state  
function initialiseState(reg) {  
  // Are Notifications supported in the service worker?  
  if (!(reg.showNotification)) {  
    console.log('Notifications aren\'t supported on service workers.');  
    useNotifications = false;  
  } else {
    useNotifications = true; 
  }

  // Check the current Notification permission.  
  // If its denied, it's a permanent block until the  
  // user changes the permission  
  if (Notification.permission === 'denied') {  
    console.log('The user has blocked notifications.');  
    return;  
  }

  // Check if push messaging is supported  
  if (!('PushManager' in window)) {  
    console.log('Push messaging isn\'t supported.');  
    return;  
  }

  // We need the service worker registration to check for a subscription  
  navigator.serviceWorker.ready.then(function(reg) {  
    // Do we already have a push message subscription?  
    reg.pushManager.getSubscription()  
      .then(function(subscription) {  
        // Enable any UI which subscribes / unsubscribes from  
        // push messages.  
 
        btn.disabled = false;

        if (!subscription) {  
          console.log('Not yet subscribed to Push')
          // We aren't subscribed to push, so set UI  
          // to allow the user to enable push  
          return;  
        }
        
        // Keep your server in sync with the latest subscriptionId
        //sendSubscriptionToServer(subscription);

        // Set your UI to show they have subscribed for  
        // push messages  
        btn.textContent = 'Disable Push Messages';  
        isPushEnabled = true;  
      })  
      .catch(function(err) {  
        console.log('Error during getSubscription()', err);  
      });  
  });  
}



function subscribe() {
  // Disable the button so it can't be changed while
  // we process the permission request

  btn.disabled = true;

  navigator.serviceWorker.ready.then(function(reg) {
    reg.pushManager.subscribe({userVisibleOnly: true})
      .then(function(subscription) {
        // The subscription was successful
        isPushEnabled = true;
        btn.textContent = 'Disable Push Messages';
        btn.disabled = false;

        console.log(subscription.endpoint);

        // TODO: Send the subscription subscription.endpoint
        // to your server and save it to send a push message
        // at a later date
        //return sendSubscriptionToServer(subscription);
      })
      .catch(function(e) {
        if (Notification.permission === 'denied') {
          // The user denied the notification permission which
          // means we failed to subscribe and the user will need
          // to manually change the notification permission to
          // subscribe to push messages
          console.log('Permission for Notifications was denied');
          
        } else {
          // A problem occurred with the subscription, this can
          // often be down to an issue or lack of the gcm_sender_id
          // and / or gcm_user_visible_only
          console.log('Unable to subscribe to push.', e);
          btn.disabled = false;
          btn.textContent = 'Enable Push Messages';
        }
      });
  });
}

function unsubscribe() {
  btn.disabled = true;

  navigator.serviceWorker.ready.then(function(reg) {
    // To unsubscribe from push messaging, you need get the
    // subcription object, which you can call unsubscribe() on.
    reg.pushManager.getSubscription().then(
      function(subscription) {
        // Check we have a subscription to unsubscribe
        if (!subscription) {
          // No subscription object, so set the state
          // to allow the user to subscribe to push
          isPushEnabled = false;
          btn.disabled = false;
          btn.textContent = 'Enable Push Messages';
          return;
        }


        // We have a subcription, so call unsubscribe on it
        subscription.unsubscribe().then(function(successful) {
          btn.disabled = false;
          btn.textContent = 'Enable Push Messages';
          isPushEnabled = false;
        }).catch(function(e) {
          // We failed to unsubscribe, this can lead to
          // an unusual state, so may be best to remove
          // the subscription id from your data store and
          // inform the user that you disabled push

          window.Demo.debug.log('Unsubscription error: ', e);
          btn.disabled = false;
        });
      }).catch(function(e) {
        console.log('Error thrown while unsubscribing from ' +
          'push messaging.', e);
      });
  });
}