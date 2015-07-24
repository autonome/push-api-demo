var fs = require('fs'),
    sys = require('sys'),
    http = require('http');

http.createServer(function (request, response) {
  
    fs.readFile("endpoint.txt", function (err, buffer) {

      var string = buffer.toString();
      var array = string.split(',\n');
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
          fs.appendFile('endpoint.txt', array[i] + ',\n', function (err) {
            if (err) throw err;
          });
        }
      };

      response.writeHead(200, {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"});

      response.end('Hello from server');
    });
}).listen(7000);
console.log("Server Running on 7000.");   
