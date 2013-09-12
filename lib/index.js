//TODO to specify deploy


var express=require('express');
var postManager=require('./post.js');
var hexoCtrl=require('./hexoCtrl.js');

var app=express();

var deploying=false;
var config={
  port:3000,
  post_dir: './source/_posts/',
  site_dir: './',
  extension: '.md',
  headers: ['title','date']
}
var post=postManager(config);
var hexo=hexoCtrl(config);

var posts=post.load();
if(!posts){
  console.log('no hexo blog found init a new one');
  hexo.init(function(){server();})
}
else server();



function server(){
  function parsePost(req,res,next){
    var post=req.route.params.post;
    req.post=post;
    next();
  }

  app.use(express.bodyParser());
  app.use('/admin/',express.static(__dirname+'/static'));
  app.use(express.static(config.site_dir+'public'));

  app.get('/post',function(req,res){
    var ret=[];
    for(postid in posts){
      ret.push({
        id:postid,
        title:posts[postid].title,
        date:posts[postid].date
      });
    }
    res.send(ret);
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
      deploying=false;
      res.send('finish generate our blog!');
    })
  });

  app.listen(config.port);
  console.log('hexo admin is running at localhost:'+config.port+'/admin');
}
