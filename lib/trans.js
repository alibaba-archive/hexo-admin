var fs=require('fs');
var image=require('./image');
fs.readdirSync('./source/header').forEach(function(name){
  if(name.indexOf('small-')==0)return;
  image('./source/header/'+name);
  console.log(name);
});
