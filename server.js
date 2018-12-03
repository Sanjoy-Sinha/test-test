'use strict';
var express = require('express');
var app = express();
var http = require('http');

var fs = require("fs");

const vcapServices = require('vcap_services');

const aws = require('ibm-cos-sdk');//require('aws-sdk');
const toStream = require('buffer-to-stream');

const bodyParser = require('body-parser');


//.... for SFTP 

let Client = require('ssh2-sftp-client');
let sftp = new Client();


//....



app.use(bodyParser.urlencoded({ limit: '1gb', extended: false }));
app.use(bodyParser.raw({ limit: '1gb', type: 'application/pdf' }));



var port = 8080;//3333

//console.log("APPLICATION PORT " + process.env.PORT);

app.set('port', process.env.PORT);


//var impExp_credentials = JSON.parse(process.env.VCAP_SERVICES)["cloud-object-storage"][0].credentials;


//console.log(impExp_credentials.toString());

//var creds = vcapServices.getCredentials("cloud-object-storage");
/**
 {
   "push-reappt": [
      {
         "name": "Reappt from Push Technology",
         "label": "push_reappt",
         "plan": "reappt:pushtechnology:free",
         "credentials": {
            "principal": "service-binding-abcd1234",
            "credentials": "XYZlmnop456",
            "host": "sniffingitchyPythagoras.eu.bluemix.reappt.io",
            "port": 443
         }
      }
   ]
}

var reappt_credentials = JSON.parse(process.env.VCAP_SERVICES)["push-reappt"][0].credentials;

diffusion.connect({
    host : reappt_credentials.host,
    principal : reappt_credentials.principal,
    credentials : reappt_credentials.credentials
}).then(connected, error);
 */



var config = {
  endpoint: 's3.us-south.objectstorage.softlayer.net', //'s3-api.dal-us-geo.objectstorage.softlayer.net',
  apiKeyId: 'cN9QmGyLk25AdSLvnzeXPNAlkYvnUVB8RG0WO3vJlN9K', //'',T_6cpF346yZp5bOx4o3GI4wjN5kRRjPgUA3IHv4q-C-Z
  ibmAuthEndpoint: 'https://iam.ng.bluemix.net/oidc/token',
  serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/e40982e3efd44fbeafa8bb9ded490eed:b71959b1-d9ef-4854-8ff0-d6e9285ff027::', //'crn:v1:bluemix:public:cloud-object-storage:global:a/7a7fdd2a292b0211bed82f9e45d3e238:57fe25bf-1c91-4b9c-a3fa-0d2e2b792749::'
};

const util = require('util');

const s3 = new aws.S3(config); // Pass in opts to S3 if necessary


app.get("/files/:filename", function (request, response) {
  
  console.log('File Name: ' + request.params.filename);

  var getParams = {
    Bucket: 'importexportdashboard',//'my-bucket', // bucket name,
    Key: request.params.filename //'testMarriot.pdf' // path to the object
  };

  s3.getObject(getParams, function(err, data) {
    // Handle any error and exit  
    if (err){
      return  console.log(err);// return err;
    }
    
    // No error

    const readable = toStream(data.Body);
    response.contentType('application/pdf');  
        
    sftp.connect({
        host: 'sftp://services-useast2.skytap.com',
        port: 8219,
        username: 'administrator',
        password: '$kytap1!'
    }).then(() => {
       // return sftp.list('/pathname');
       sftp.put(data.Body, '/.', true, 'Binary');
    }).then((data) => {
        //console.log(data, 'the data info');
        console.log('the data info');
    }).catch((err) => {
        console.log(err, 'catch error');
    });

    //readable.pipe(response);
    console.log("Ended..." );

});

});

app.get("/upload/:bucketName/:filename",function(request , response){

  response.send("Inside File Uploaded ...");
  const bName = request.params.bucketName;
  const fName = request.params.filename;

  //cosUpload.uploadFileToCOS('my-bucket', 'testMarriott.pdf');
  uploadFileToCOS(bName, fName);
  console.log("Ended uploading ...");
  //response.send("File Uploaded ...");

});

function uploadFileToCOS(bucket, name) {

  console.log(`Creating new item: ${name}`); // 
  console.log("Bucket name" + bucket);

  var buffer = fs.readFileSync(name);
    
    return s3.putObject({
		Bucket: bucket, 
		Key: name, //"testMarriott.pdf"
		Body: buffer
	}).promise()
	.then(() => {
    
    console.log(`Item: ${name} created!`);        
        
        //Remove PDF file from Local which was downloaded temporarily
        //fs.unlinkSync(name); 

/*
      let path = '.\\testing.pdf';  

      fs.open(path, 'w', function(err, fd) {  
        if (err) {
            console.log(path);
            throw 'could not open file: ' + err;
        }
        // write the contents of the buffer, from position 0 to the end, to the file descriptor returned in opening our file
        fs.write(fd, Buffer.from(data.Body), 0, Buffer.from(data.Body).length, null, function(err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function() {
                console.log('wrote the file successfully');
            });
        });
    });
*/



})
	.catch((e) => {
		console.log(`ERROR: ${e.code} - ${e.message}\n`);
		var content = 'Error encountered while uploading to bucket within cloud object storage for a file: '+ name;
		content += '\r\n' + e;
		//var errFileName = 'cos_upload_fail_' + name + '_';
		//processError(errFileName, content);
	});
} 

var port = app.get('port');
app.listen(port); //  8080