var fs=require('fs');
var images=require('gm');

module.exports=exports=function(path){
  var apath=path.split('/');
  var name=apath.pop();
  var dir=apath.join('/');
  images(path).resize(null,300).write(dir+'/small-'+name,function(err){
    if(err)console.log(err);
  });
}
