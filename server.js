#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
//var app = express();
var fs      = require('fs');

var bodyParser = require('body-parser');

var nodemailer = require('nodemailer');

var mongojs = require('mongojs');
var dbName = "/connection";
var connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" + process.env.OPENSHIFT_MONGODB_DB_HOST + dbName;
var db = mongojs(connection_string, ['expertprofilespost']);


/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = {

         };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express.createServer();
        //self.app = app;
        self.app.use(express.static(__dirname));

        self.app.use(function(req, res, next) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });
        self.app.use(express.static(_dirname = '/public'));
        self.app.use(bodyParser.json());

        self.app.get('/profiles', function(req, res){
            console.log("I got Get All Request");
            db.expertprofiles.find(function(err,docs){
                console.log(docs);
                res.json(docs);
            });
        });
        self.app.post('/create', function(req, res){
            console.log("I got a create Request");
            console.log(req.body);
            db.expertprofiles.insert(req.body, function(err, doc){
                res.json(doc);
                console.log(err);
            });
        });

        self.app.get('/getProfile/:id', function(req, res){
            console.log("got a get Request");
            var id = req.params.id;
            db.expertprofiles.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
                res.json(doc);
                console.log(err);
            });
        });

        self.app.put('/update/:id', function (req, res) {
            console.log("update request received");
            var id = req.params.id;
            console.log(id);
            db.expertprofiles.findAndModify({
                query:{_id: mongojs.ObjectId(id)},
                update:{$set:{name:req.body.name , experience:req.body.experience, currentproject:req.body.currentproject, emailid:req.body.emailid, mobilenumber:req.body.mobilenumber,
                profile:req.body.profile, role:req.body.role, awards:req.body.awards, certification:req.body.certification, testframework:req.body.testframework }},new : true },function(response){
                console.log("updated successfully");
                console.log(response);
                res.json(response);
            });
        });

        self.app.put('/updateSkill/:id', function (req, res) {
            console.log("update skill request received");
            var id = req.params.id;
            console.log(req.body);
            db.expertprofiles.findAndModify({
                query:{_id: mongojs.ObjectId(id)},
                update:{$set:{skills :{java:req.body.java, cpp:req.body.cpp, linux:req.body.linux, python:req.body.python, angularjs:req.body.angularjs,
                    nodejs:req.body.nodejs, eclipse:req.body.eclipse } }},new : true },function(response){
                console.log("updated successfully");
                console.log(response);
                res.json(response);
            });
        });
        self.app.put('/updateCertification/:id', function (req, res) {
            console.log("update certification request received");
            var id = req.params.id;
            console.log(req.body);
            db.expertprofiles.findAndModify({
                query:{_id: mongojs.ObjectId(id)},
                update:{$set:{certification :{name:req.body.name } }},new : true },function(response){
                console.log("updated certification successfully");
                console.log(response);
                res.json(response);
            });
        });

        self.app.get('/search/:id', function(req, res){
            console.log("got a get Request");
            var id = req.params.id;
            console.log(id);
            console.log(req.body);
           // var query = {};
            //query[experience] = "4.4";
            db.expertprofiles.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
                res.json(doc);
                console.log(doc);
                console.log(err);
            });
        });

        self.app.post('/sendEmail/:id', handleEmailSend); // handle the route at yourdomain.com/sayHello

        function handleEmailSend(req, res) {
            console.log("Email recieved to send : " + req.params.id);
            console.log(req.body.message);
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'expertprofile123@gmail.com', // admin email id
                    pass: 'Unity@123' // admin password
                }
            });
            var mailOptions = {
                from: 'expertprofile123@gmail.com', // sender address
                to: req.params.id, // list of receivers
                subject: 'Requirement..', // Subject line
                text: req.body.message//, // plaintext body
            };
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    console.log(error);
                    res.json({status: 'error'});
                }else{
                    console.log('Message sent: ' + info.response);
                    res.json({status: info.response});
                };
            });
        }

        self.app.get('/getAll', function(req, res){
            console.log("I got Get All Request to fetch all requirement post");
            db.expertprofilespost.find(function(err,docs){
                console.log(docs);
                res.json(docs);
            });
        });

        self.app.post('/createPost', function(req, res){
            var currentdate = new Date();
            var dateTime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
            console.log("I got a create Request to post requirement");
            console.log(req.body);
            var collection = { requirement:  req.body.requirement,
                datetime: dateTime};
            console.log(collection);

            db.expertprofilespost.insert(collection, function(err, doc){
                if(err){
                    console.log(err);
                }
                res.json(doc);
            });
        });

          //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();
