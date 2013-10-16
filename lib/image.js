var fs=require('fs');
var images=require('gm');
var gm=images.subClass({imageMagick:true});

module.exports=exports=function(path){
  var apath=path.split('/');
  var name=apath.pop();
  var dir=apath.join('/');
  gm(path).resize(null,300).write(dir+'/small-'+name,function(err){
    if(err)console.log(err);
  });
}
