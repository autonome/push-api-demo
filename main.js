var isPushEnabled = false;
var useNotifications = false;

var subBtn = document.querySelector('.subscribe');
var sendBtn;

var nameForm = document.querySelector('#form');
var nameInput = document.querySelector('#name-input');
nameForm.onsubmit = function(e) {
  e.preventDefault()
};
nameInput.value = 'Bob';

Notification.requestPermission();

window.addEventListener('load', function() {   
  subBtn.addEventListener('click', function() {  
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
 
        subBtn.disabled = false;

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
        subBtn.textContent = 'Unsubscribe from Push Messaging';  
        isPushEnabled = true;  
        
        var endpoint = subscription.endpoint;
        updateStatus(endpoint,'init');
      })  
      .catch(function(err) {  
        console.log('Error during getSubscription()', err);  
      }); 

      // set up a message channel to communicate with the SW
      var channel = new MessageChannel();
      channel.port1.onmessage = function(e) {
        alert('Message received from SW: ' + e.data);
      }

      mySW = reg.active;
      console.log(mySW); // check it exists.
      mySW.postMessage('hello', [channel.port2]);
  });  
}



function subscribe() {
  // Disable the button so it can't be changed while
  // we process the permission request

  subBtn.disabled = true;

  navigator.serviceWorker.ready.then(function(reg) {
    reg.pushManager.subscribe({userVisibleOnly: true})
      .then(function(subscription) {
        // The subscription was successful
        isPushEnabled = true;
        subBtn.textContent = 'Unsubscribe from Push Messaging';
        subBtn.disabled = false;
        
        var endpoint = subscription.endpoint;
        updateStatus(endpoint,'subscribe');
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
          subBtn.disabled = false;
          subBtn.textContent = 'Subscribe to Push Messaging';
        }
      });
  });
}

function unsubscribe() {
  subBtn.disabled = true;

  navigator.serviceWorker.ready.then(function(reg) {
    // To unsubscribe from push messaging, you need get the
    // subcription object, which you can call unsubscribe() on.
    reg.pushManager.getSubscription().then(
      function(subscription) {
        var endpoint = subscription.endpoint;
        updateStatus(endpoint,'unsubscribe');

        // Check we have a subscription to unsubscribe
        if (!subscription) {
          // No subscription object, so set the state
          // to allow the user to subscribe to push
          isPushEnabled = false;
          subBtn.disabled = false;
          subBtn.textContent = 'Subscribe to Push Messaging';
          return;
        }
        
        isPushEnabled = false;

        // We have a subcription, so call unsubscribe on it
        subscription.unsubscribe().then(function(successful) {
          subBtn.disabled = false;
          subBtn.textContent = 'Subscribe to Push Messaging';
          isPushEnabled = false;
        }).catch(function(e) {
          // We failed to unsubscribe, this can lead to
          // an unusual state, so may be best to remove
          // the subscription id from your data store and
          // inform the user that you disabled push

          console.log('Unsubscription error: ', e);
          subBtn.disabled = false;
        });
      }).catch(function(e) {
        console.log('Error thrown while unsubscribing from ' +
          'push messaging.', e);
      });
  });
}

function updateStatus(endpoint,statusType) {
  if(statusType === 'subscribe') {
    console.log(endpoint);
  
    sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send Push Message';
    document.body.appendChild(sendBtn);

    var request = new XMLHttpRequest();

    request.open('POST', 'https://127.0.0.1:7000', true);
    request.setRequestHeader('Content-Type', 'application/json');
    
    var subscribeObj = [
                         statusType,
                         nameInput.value,
                         endpoint
                       ]
    console.log(subscribeObj);
    request.send(subscribeObj);

    // sendBtn.addEventListener('click',function() {

    // });
  } else if(statusType === 'unsubscribe') {
    document.body.removeChild(sendBtn);

    var request = new XMLHttpRequest();

    request.open('POST', 'https://127.0.0.1:7000', true);
    request.setRequestHeader('Content-Type', 'application/json');
    
    var subscribeObj = [
                         statusType,
                         nameInput.value,
                         endpoint
                       ]
    console.log(subscribeObj);
    request.send(subscribeObj);

  } else if(statusType === 'init') {
    sendBtn = document.createElement('button');
    sendBtn.textContent = 'Send Push Message';
    document.body.appendChild(sendBtn);

    // sendBtn.addEventListener('click',function() {

    // });
  }
}