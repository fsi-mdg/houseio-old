var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
var Zone1 = new Gpio(4, 'out'); //use GPIO pin 4 as output
var Zone2 = new Gpio(17, 'out'); //use GPIO pin 17 as output
var Zone3 = new Gpio(27, 'out'); //use GPIO pin 27 as output
var Zone4 = new Gpio(22, 'out'); //use GPIO pin 22 as output
var pushButton = new Gpio(21, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

var initval = 0;
Zone1.writeSync(initval);
initval=Zone1.readSync();
console.log("Zone1 Init: "+initval);
Zone2.writeSync(initval);
initval=Zone2.readSync();
console.log("Zone2 Init: "+initval);
Zone3.writeSync(initval);
initval=Zone3.readSync();
console.log("Zone3 Init: "+initval);
Zone4.writeSync(initval);
initval=Zone4.readSync();
console.log("Zone4 Init: "+initval);
console.log("---------------------");


http.listen(8080); //listen to port 8080

function handler (req, res) { //create server
  fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  });
}

io.sockets.on('connection', function (socket) { // WebSocket Connection

  var lightvalue = 0; //static variable for current status

  console.log(new Date()+": Initialized " ); //Send Out message when io.sockets.on starts
   
  pushButton.watch(function (err, value) { //Watch for hardware interrupts on pushButton
    if (err) { //if an error
      console.error('There was an error', err); //output error message to console
      return;
    }
    lightvalue = value;
  });

  socket.on('Zone1', function(data) { //get light switch status from client
    lightvalue = data;
    console.log(new Date()+": " + lightvalue + "-Zone1");
    if (lightvalue != Zone1.readSync()) { //only change LED if status has changed
      Zone1.writeSync(lightvalue); //turn LED on or off
    }
  });
  socket.on('Zone2', function(data) { //get light switch status from client
    lightvalue = data;
    console.log(new Date()+": " + lightvalue + "-Zone2");
    if (lightvalue != Zone2.readSync()) { //only change LED if status has changed
      Zone2.writeSync(lightvalue); //turn LED on or off
    }
  });
  socket.on('Zone3', function(data) { //get light switch status from client
    lightvalue = data;
    console.log(new Date()+": " + lightvalue + "-Zone3");
    if (lightvalue != Zone3.readSync()) { //only change LED if status has changed
      Zone3.writeSync(lightvalue); //turn LED on or off
    }
  });
  socket.on('Zone4', function(data) { //get light switch status from client
    lightvalue = data;
    console.log(new Date()+": " + lightvalue + "-Zone4");
    if (lightvalue != Zone4.readSync()) { //only change LED if status has changed
      Zone4.writeSync(lightvalue); //turn LED on or off
    }
  });




});

process.on('SIGINT', function () { //on ctrl+c

  Zone1.writeSync(0); // Turn LED off
  Zone1.unexport(); // Unexport LED GPIO to free resources
  Zone2.writeSync(0); // Turn LED off
  Zone2.unexport(); // Unexport LED GPIO to free resources
  Zone3.writeSync(0); // Turn LED off
  Zone3.unexport(); // Unexport LED GPIO to free resources
  Zone4.writeSync(0); // Turn LED off
  Zone4.unexport(); // Unexport LED GPIO to free resources

  pushButton.unexport(); // Unexport Button GPIO to free resources

  process.exit(); //exit completely
});
