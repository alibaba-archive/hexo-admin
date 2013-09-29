//TODO err handler and test

var fs=require('fs');
var moment=require('moment');

//use config.post_dir,config.headers and config.extension
module.exports=function(config){
  config.spliter='*spliter*';
  var post={};
  function postPath(postid){
    return config.post_dir+postid+config.extension;
  }
  post.read=function(postid){
    var content=fs.readFileSync(postPath(postid)).toString();
    var div=content.match(/([\s\S]*)\n\-\-\-\n([\s\S]*)/);
    var header;
    if(!div)return;
    var obj={content:div[2]};
    header=div[1].replace(/\n\s*/g,config.spliter);
    header.split(config.spliter).forEach(function(line){
      if(line=='')return;
      var pline=line.match(/\s*(.+)\s*: \s*(.*)\s*/);
      if(!pline)return;
      if(pline[1]=='tags'){
        obj.tags=pline[2].replace(/^\[|\]$|\s/g,'').split(',');
        if(obj.tags[0]=='')obj.tags=[];
      }
      else obj[pline[1]]=pline[2];
    });
    return obj;
  };
  post.write=function(postObj,callback){
    var key,val,content='';
    for(h in config.headers){
      key=config.headers[h];
      val=postObj[key];
      if(!val){
        if(key=='tags')val=[];
        else if(key=='headers')val='default.jpg';
        else throw new Error('post partten not ok');
      }
      if(key=='tags')content+=('tags: ['+val+']\n');
      else content+=(key+': '+val+'\n');
    }
    content+='---\n'+postObj.content;
    fs.writeFile(postPath(postObj.id),content,callback);
  };
  post.remove=function(postid,callback){
    fs.unlink(postPath(postid),callback);
  };
  post.create=function(postTitle,callback){
    var now=moment(),postObj={
      id:now.format('YYYYMMDDhhmm'),
      date:now.format('YYYY-MM-DD HH:mm:ss'),
      title:postTitle,
      content:'',
      tags:[]
    };
    fs.exists(postPath(postObj.id),function(exists){
      if(exists)postObj.id=now.format('YYYYMMDDhhmms');
      post.write(postObj,function(err){
        if(err)throw err;
        callback(postObj);
      });
    });
  };
  post.load=function(){
    var posts={};
    if(fs.existsSync(config.post_dir)){
      fs.readdirSync(config.post_dir).forEach(function(postname){
        var reg=postname.match('(.+)'+config.extension);
        if(!reg)return;
        var postObj=post.read(reg[1]);
        if(postObj)posts[reg[1]]=postObj;
      });
      return posts;
    }
    else return false;
  };
  return post;
};
