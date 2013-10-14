//TODO to specify deploy


var express=require('express');
var fs=require('fs');
var postManager=require('./post.js');
var hexoCtrl=require('./hexoCtrl.js');
var data=require('./data.json');
var image=require('./image.js');
var basicAuth=require('./basicAuth.js');
var app=express();

var generating=false;
var deploying=false;
var config={
  port:3000,
  post_dir: './source/_posts/',
  image_dir: './source/image/',
  header_dir: './source/header/',
  site_dir: './',
  extension: '.md',
  headers: ['title','date','tags','header']
}
var post=postManager(config);
var hexo=hexoCtrl(config);

var posts=post.load();
if(!posts){
  console.log('no hexo blog found init a new one');
  hexo.init(function(){server();})
}
else server();

function save(file,path,callback,make){
  var name=file.name;
  fs.exists(path+name,function(exists){
    if(exists)name=(new Date()).getTime()+name;
    var is=fs.createReadStream(file.path);
    var os=fs.createWriteStream(path+name);
    is.pipe(os);
    is.on('end',function(){
      if(make)image(path+name);
      callback(name);
    });
  });
}
function writeData(obj,cb){
  fs.writeFile(__dirname+'/data.json',JSON.stringify(obj),function(err){
    if(err)return console.log(err);
    cb();
  });
}

function server(){
  function parsePost(req,res,next){
    var post=req.route.params.post;
    req.post=post;
    next();
  }

  basicAuth(app);

  app.use(express.bodyParser());
  app.use('/admin/',express.static(__dirname+'/static'));
  app.use('/header/',express.static(config.header_dir));
  app.use('/image/',express.static(config.image_dir));
  app.use(express.static(config.site_dir+'public'));

  app.post('/tag/:tag',function(req,res){
    var tag=req.route.params.tag;
    data.tags.push(tag);
    writeData(data,function(){
      res.send({ok:1});
    });
  });
  app.delete('/tag/:tag',function(req,res){
    var tag=req.route.params.tag;
    data.tags.splice(data.tags.indexOf(tag),1);
    writeData(data,function(){
      res.send({ok:1});
    });
  });
  app.post('/image',function(req,res){
    save(req.files.image,config.image_dir,function(path){
      res.send({name:path});
    });
  });
  app.post('/header',function(req,res){
    save(req.files.header,config.header_dir,function(path){
      res.send({name:path});
    },true);
  });

  app.get('/post',function(req,res){
    var ret=[];
    for(postid in posts){
      ret.push({
        id:postid,
        title:posts[postid].title,
        date:posts[postid].date
      });
    }
    res.send({posts:ret,tags:data.tags});
  });

  app.post('/post',function(req,res){
    post.create(req.body.title,function(postObj){
      posts[postObj.id]=postObj;
      res.send(postObj);
    });
  });

  app.get('/post/:post',parsePost,function(req,res){
    if(req.post in posts){
      res.send(posts[req.post]);
    }
    else{
      res.send('not exist');
    }
  });

  app.post('/post/:post',parsePost,function(req,res){
    post.write(req.body,function(msg){
      posts[req.body.id]=req.body;
      res.send(msg);
    });
  });

  app.delete('/post/:post',parsePost,function(req,res){
    post.remove(req.post,function(err){
      if(err)return res.send(err);
      delete(posts[req.post]);
      res.send('file '+req.post+'.md deleted');
    });
  });

  app.get('/deploy',function(req,res){
    if(deploying)return;
    deploying=true;
    hexo.generate(function(){
      hexo.deploy(function(){
        deploying=false;
        res.send('finish deploying our blog');
      });
    });
  });

  app.get('/generate',function(req,res){
    if(generating)return;
    generating=true;
    hexo.generate(function(){
      generating=false;
      res.send('finish generate our blog!');
    });
  });

  app.listen(config.port);
  console.log('hexo admin is running at localhost:'+config.port+'/admin');
}
