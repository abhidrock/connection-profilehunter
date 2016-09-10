/**
 * Created by susil panda on 8/27/2016.
 */
var express = require('express');

var app = express();
var mongojs = require('mongojs');
var db = mongojs('expertprofilespost', [ 'expertprofilespost']);
var bodyParser = require('body-parser');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.json());

app.get('/getAll', function(req, res){
    console.log("I got Get All Request to fetch all requirement post");
    db.expertprofilespost.find(function(err,docs){
        console.log(docs);
        res.json(docs);
    });
});
app.post('/createPost', function(req, res){
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

app.listen(3044);