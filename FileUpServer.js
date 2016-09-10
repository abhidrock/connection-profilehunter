/**
 * Created by Susil Panda on 7/3/2016.
 */
var express = require('express');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(bodyParser.json());
var fs = require('fs');
var busboy = require('connect-busboy');
//...
app.use(busboy());

app.post('/upload', function(req, res) {
    var picId = null;
    var fstream;
    req.pipe(req.busboy);
    //console.log(req.busboy);
    req.busboy.on('field', function(fieldname, val) {
        picId = val;
        uploadFile(picId);
    });

    var uploadFile = function (picId) {
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);
            console.log("pic id :", picId);
            fileNm = filename.split('.');
            fileName = picId.concat(".",fileNm[1]);
            console.log("fileName :" + fileName);
            fstream = fs.createWriteStream(__dirname + '/files/' + fileName);
            file.pipe(fstream);
            fstream.on('close', function () {
                res.redirect('back');
            });
        });

    };
});
app.get('/getImage/:id', function (req,res) {
    var options = {
        root: __dirname + '/files/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    var baseDir = __dirname + "/files/" ;
    //res.contentType('image/jpeg');
    var picId = req.params.id;
    imgPath = "C:/Users/suchandp/WebstormProjects/NodeDemo/files/12345.jpg";
    imgPath1 = baseDir + picId + ".jpg";
    console.log("pic id in get :", picId, imgPath1);
    data = fs.readFileSync(imgPath1);
    data.contentType = 'image/jpg';
    //console.log(data);
    res.contentType(data.contentType);
    //console.log("img sent base64 : ",data.toString('base64'));
    res.send(data.toString('base64'));
   /* res.sendfile("12345.jpg", options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent fileName');
        }
    });*/
});
app.get('/getAllImages', function (req,res) {
    var options = {
        root: __dirname + '/files/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
    var baseDir = "C:/Users/suchandp/WebstormProjects/NodeDemo" + "/files/" ;

    imgPath = "C:/Users/suchandp/WebstormProjects/NodeDemo/files/12345.jpg";
    //imgPath1 = baseDir + picId + ".jpg";
   // console.log("pic id in get :", picId, imgPath1);
   // data = fs.readFileSync(imgPath1);
   // data.contentType = 'image/jpg';
   // res.contentType(data.contentType);
   // res.send(data.toString('base64'));

        getImages(baseDir, function (err, files) {
            var imageLists = [];
            console.log(files);
            for (var i=0; i<files.length; i++) {
               // res.contentType(files[i].imageType);
                //res.end(files[i].image.buffer, "binary");
                //imageLists += files[i].toString('base64');
               // imageLists.push(fs.readFileSync(baseDir+files[0]).toString("base64"));
                console.log(files[i]);
                imageLists.push(baseDir+files[i]);
               // console.log(imageLists);
               /* fs.readFile(files[i], function(err, original_data){
                    fs.writeFile('image_orig.jpg', original_data, function(err) {});
                    var base64Image = original_data.toString('base64');
                    imageLists.push(base64Image);
                });*/
            }
            //res.writeHead(200, {'Content-type':'text/html'});
            //console.log("base64 converted imgs : ",imageLists);
            res.send(imageLists);
        });
    /*} else {
        //read the image using fs and send the image content back in the response
        fs.readFile(imageDir + pic, function (err, content) {
            if (err) {
                res.writeHead(400, {'Content-type':'text/html'})
                console.log(err);
                res.end("No such image");
            } else {
                //specify the content type in the response will be an image
                res.writeHead(200,{'Content-type':'image/jpg'});
                res.end(content);
            }
        });
    }*/
});
//get the list of jpg files in the image dir
function getImages(imageDir, callback) {
    var fileType = '.jpg',
        files = [], i;
    fs.readdir(imageDir, function (err, list) {
        list.contentType = 'image/jpg';
        for(i=0; i<list.length; i++) {
            if(path.extname(list[i]) === fileType) {
                files.push(list[i]); //store the file name into the array files
            }
        }
        callback(err, files);
    });
};
app.listen('3222');
