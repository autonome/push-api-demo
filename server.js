var fs = require('fs'),
    sys = require('sys'),
    https = require('https');

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
      console.log('POSTed: ' + body);
    });
  
    fs.readFile("endpoint.txt", function (err, buffer) {

      var string = buffer.toString();
      var array = string.split('\n');
      array.push('hello');
      console.log(array);

      fs.writeFile('endpoint.txt', '', function (err) {
          if (err) throw err;
        });
      
      for(i = 0; i < array.length; i++) {
        if(i === (array.length - 1)) {
          fs.appendFile('endpoint.txt', array[i], function (err) {
            if (err) throw err;
          });
        } else {
          fs.appendFile('endpoint.txt', array[i] + '\n', function (err) {
            if (err) throw err;
          });
        }
      };

      response.writeHead(200, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Origin, Access-Control-Allow-Headers"});

      response.end(body);
    });
}).listen(7000);
console.log("Server Running on 7000.");   
