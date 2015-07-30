self.addEventListener('push', function(event) {  
  var messageData = event.data;

  var title = 'Yay a message.';  
  var body = messageData;  
  var icon = 'push-icon.png';  
  var tag = 'push';

  event.waitUntil(  
    self.registration.showNotification(title, {  
      body: body,  
      icon: icon,  
      tag: tag  
    })  
  );  
});