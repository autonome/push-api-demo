var fs = require('fs'),
    sys = require('sys'),
    https = require('https'),
    url = require('url');

var options = {
  pfx: fs.readFileSync('aa34f6b8-f1c5-4e32-afd7-7a5f9f0b659c.pfx'),
  passphrase: 'password'
};

https.createServer(options, function (request, response) {
    var body = "";

    request.on('data', function(chunk) {
      body += chunk;
    })

    request.on('end', function() {
      var bodyArray = body.split(',');
      console.log('POSTed: ' + bodyArray[0]);

      if(bodyArray[0] === 'subscribe') {
        fs.appendFile('endpoint.txt', bodyArray + '\n', function (err) {
          if (err) throw err;
          fs.readFile("endpoint.txt", function (err, buffer) {
            var string = buffer.toString();
            var array = string.split('\n');
            for(i = 0; i < (array.length-1); i++) {
              var subscriber = array[i].split(',');
              console.log(subscriber[2]);
              URLParts = url.parse(subscriber[2])

              // send request to each push endpoint telling them the new subscriber
              // has subscribed, along with subscribe token so SW knows how to deal with it.
              var options = {
                host: URLParts.hostname,
                port: 443,
                path: URLParts.pathname,
                method: 'POST'
              };

              var pushRequest = https.request(options, function(pushResponse) {
                console.log("statusCode: ", pushResponse.statusCode);
                console.log("headers: ", pushResponse.headers);

                pushResponse.on('data', function(d) {
                  pushRequest.write(subscriber[1] + ' has subscribed.');
                  pushRequest.end();
                });
              });
              
              pushRequest.on('error', function(e) {
                console.error(e);
              });
            };
          });

        });
      }
    });

response.writeHead(200, {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, Access-Control-Allow-Headers"});

response.end('hello');

}).listen(7000);
console.log("Server Running on 7000.");   
