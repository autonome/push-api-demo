self.addEventListener('push', function(event) {  

  var title = 'Yay a message.';  
  var body = event.data;  
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