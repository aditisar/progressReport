var express = require('express'),
    http = require('http'),
    morgan  = require('morgan'),
    path = require('path'),
    sio =require('socket.io');
    routes = require('./routes/routes.js');

// Create a class that will be our main application
var SimpleStaticServer = function() {

  // set self to the scope of the class
  var self = this;  
  
  /*  ================================================================  */
  /*  App server functions (main app logic here).                       */
  /*  ================================================================  */

  self.app = express();
  //	self.app.use(connect(connect.basicAuth('j', 'jmjm')))
  self.app.use(morgan('[:date] :method :url :status'));	// Log requests
  self.app.use(express.static(path.join(__dirname, 'public')));	// Process static files
  self.app.set('views', __dirname + '/views');
  self.app.set('view engine', 'ejs');

  self.app.get('/', routes.index);
  self.app.get('/setGoal', routes.setGoal);
  self.app.get('/confirm', routes.confirm);
  self.app.get('/go', routes.go);



  // Start the server (starts up the sample application).
  self.start = function() {
    /*
     * OpenShift will provide environment variables indicating the IP 
     * address and PORT to use.  If those variables are not available
     * (e.g. when you are testing the application on your laptop) then
     * use default values of localhost (127.0.0.1) and 33333 (arbitrary).
     */
    self.ipaddress = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1";
    self.port      = process.env.OPENSHIFT_NODEJS_PORT || 33333;
    var httpServer = http.Server(self.app);
    var io = sio(httpServer);
    //  Start listening on the specific IP and PORT
    httpServer.listen(self.port, self.ipaddress, function() {
      console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
    });
  };
}; 


/**
 *  main():  Main code.
 */
var sss = new SimpleStaticServer();
sss.start();

