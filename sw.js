var port;

self.addEventListener('push', function(event) {  
  var messageData = event.data;

  var title = 'Yay a message.';  
  var body = messageData + 'subscribed to the chat.';  // should be messageData.text(), but that's not supported in Gecko yet.
  var icon = 'push-icon.png';  
  var tag = 'push';

  event.waitUntil(  
    self.registration.showNotification(title, {  
      body: body,  
      icon: icon,  
      tag: tag  
    })  
  );

  port.postMessage('hello again!');
});

self.onmessage = function(e) {
  port = e.ports[0];
  port.postMessage('hello from SW');
}