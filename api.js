var express = require('express'),
    Bourne = require('bourne'),
    bodyParser = require('body-parser'),
    busboy = require('connect-busboy'),
    fs = require('fs-extra');

    db = new Bourne('data.json'),
    router = express.Router();

router
    .use(bodyParser.json())
    .route('/document')
        .get(function (req, res) {
            db.find({ userId: parseInt(req.user.id, 10) }, function (err, data) {
                res.json(data);
            });
        })
        .post(function (req, res) {
            var document = req.body;
            document.userId = req.user.id;

            db.insert(document, function (err, data) {
                res.json(data);
            });
        });

router
    .param('id', function (req, res, next) {
        req.dbQuery = { id: parseInt(req.params.id, 10 ) };
        next();
    })
    .route('/document/:id')
        .get(function (req, res) {
            db.findOne(req.dbQuery, function (err, data) {
                res.json(data);
            });
        })
        .put(function (req, res) {
            var document = req.body;
            delete document.$promise;
            delete document.$resolved;
            db.update(req.dbQuery, document, function(err, data) {
                res.json(data[0]);
            });
        })
        .delete(function (req, res) {
            db.delete(req.dbQuery, function() {
                res.json(null);
            });
        });

router
    .route('/upload')
    .post(function (req, res, next) {

        var arr;
        var fstream;
        var filesize = 0;
        req.pipe(req.busboy);

        //--------------------------------------------------------------------------
        req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
         
            //uploaded file name, encoding, MIME type
            console.log('File [' + fieldname +']: filename:' + filename + ', encoding:' + encoding + ', MIME type:'+ mimetype);

            //uploaded file size
            file.on('data', function(data) {
                console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
                fileSize = data.length;
                console.log("fileSize= " + fileSize);
            });

            file.on('end', function() {
                console.log('File [' + fieldname + '] ENDed');
                console.log("-------------------------");
            });

            //populate array
            //I am collecting file info in data read about the file. It may be more correct to read 
            //file data after the file has been saved to img folder i.e. after file.pipe(stream) completes
            //the file size can be got using stats.size as shown below
            arr= [{fieldname: fieldname, filename: filename, encoding: encoding, MIMEtype: mimetype}];
            
            //Path where image will be uploaded
            fstream = fs.createWriteStream(__dirname + '/public/uploads/' + filename); //create a writable stream

            file.pipe(fstream);     //pipe the post data to the file


            //stream Ended - (data written) send the post response
            req.on('end', function () {
                res.writeHead(200, {"content-type":"text/html"});       //http response header

                    //res.end(JSON.stringify(arr));                         //http response body - send json data
            });

            //Finished writing to stream
            fstream.on('finish', function () { 
                console.log('Finished writing!'); 

                    //Get file stats (including size) for file saved to server
                    fs.stat(__dirname + '/public/uploads/' + filename, function(err, stats) {
                        if(err) 
                            throw err;      
                        //if a file
                        if (stats.isFile()) {
                            //console.log("It\'s a file & stats.size= " + JSON.stringify(stats));   
                            console.log("File size saved to server: " + stats.size);    
                            console.log("-----------------------");
                        };
                    });
            });


            // error
            fstream.on('error', function (err) {
                console.log(err);
            });

        
        });  // @END/ .req.busboy
    })  //  @END/ POST
    //PUT
    .put(function (req, res, next) {

        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            fstream = fs.createWriteStream(__dirname + '/public/uploads/' + filename);
            file.pipe(fstream);

            fstream.on('close', function () {
                console.log("Upload Finished of " + filename);
                res.redirect('back');               //where to go next
            });
        });
    })
module.exports = router;
