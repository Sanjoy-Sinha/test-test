var http = require('http');
var fs = require('fs');
//var request = require('request-promise');


// options for GET
var optionsget = {
    host : 'localhost', //127.0.0.1 
    port : 8080,//4444,
    path : '/files/testMarriott.pdf', // the rest of the url with parameters 
    method : 'GET',  
    headers: {
        'Content-Type': 'application/pdf',
        },
    filepath: "C:\\"    
    };
    
    console.info('Options prepared:');
    console.info(optionsget);
    console.info('GET');

    var req = http.request(optionsget, function(res){
    
    filepath = optionsget.filepath;

    console.log("PATH" + filepath);
    
  try
   {
        res.pipe(fs.createWriteStream(filepath + 'newMarriott.pdf')); 
   }
  catch(err)
   {
        console.log(err);
   }
  });
  req.end();