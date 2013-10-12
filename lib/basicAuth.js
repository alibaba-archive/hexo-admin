var fs=require('fs');
var express=require('express');
module.exports=exports=function(app){
  var exists=fs.existsSync('./admin-auth.json');
  if(exists){
    var auth=fs.readFileSync('./admin-auth.json').toString();
    auth=JSON.parse(auth);
    app.use(express.basicAuth(auth.user,auth.pass));
  }
}
