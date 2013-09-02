//TODO to specify deploy

var exec=require('child_process').exec;
var express=require('express');
var fs=require('fs');
var moment=require('moment');

var app=express();

var deploying=false;
var config={
  port:3000,
  post_dir: './source/_posts/',
  site_dir: './',
  extension: '.md'
}

function postPath(post){
  return config.post_dir+post+config.extension;
}

var posts={};
if(fs.existsSync(config.post_dir)){
  fs.readdirSync(config.post_dir).forEach(function(post){
    var reg=post.match(/(.+)\.md/);
    if(!reg)return;
    var obj=read(reg[1]);
    if(obj)posts[reg[1]]=obj;
  });
}
else{
  process.stdout.write('no hexo blog found init a new one');
  exec('hexo init',{cwd:config.site_dir},function(err,stdout,stderr){
    if(err)return process.stderr.write(err);
    if(stderr)return process.stderr.write(stderr);
    process.stdout.write('finished');
  });
}

function read(post){
  var content=fs.readFileSync(postPath(post)).toString();
  var div=content.match(/title: (.*)\n.*date: (.*)\n\-\-\-\n([\s\S]*)/);
  if(!div)return;
  var ret={
    title:div[1],
    date:div[2],
    content:div[3]
  };
  return ret;
}

function write(post,content,cb){
  if(!content)return cb(new Error('no content'));
  fs.writeFile(postPath(post),content,function(err){
    if(err)return cb(err);
    cb('file updated');
    posts[post]=read(post);
  });
}

function parsePost(req,res,next){
  var post=req.route.params.post;
  req.post=post;
  req.file=postPath(post);
  next();
}

app.use(express.bodyParser());
app.use('/admin/',express.static(__dirname+'/static'));
app.use(express.static(config.site_dir+'public'));

app.get('/post',function(req,res){
  var ret=[];
  for(post in posts){
    ret.push({id:post,title:posts[post].title,date:posts[post].date});
  }
  res.send(ret);
});

app.post('/post',function(req,res){
  var now=moment();
  var post=now.format('YYYYMMDDhhmm');
  fs.exists(postPath(post),function(exists){
    if(exists)post=now.format('YYYYMMDDhhmms');
    var date=now.format('YYYY-MM-DD HH:mm:ss');
    var content='title: '+req.body.title+'\ndate: '+date+'\n---\n';
    write(post,content,function(msg){
      res.send({msg:msg,id:post,date:date});
    });
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
  write(req.post,req.body.post,function(msg){
    res.send(msg);
  });
});

app.delete('/post/:post',parsePost,function(req,res){
  fs.unlink(req.file,function(err){
    if(err)return res.send(err);
    delete(posts[req.post]);
    res.send('file '+req.post+'.md deleted');
  });
});

app.get('/deploy',function(req,res){
  if(deploying)return;
  deploying=true;
  exec('hexo generate',{cwd:config.site_dir},function(err,stdout,stderr){
    deploying=false;
    if(err)return res.send(err);
    if(stderr)return res.send(stderr);
    res.send('finish generating our blog');
  });
});

app.listen(config.port);
console.log('hexo admin is running at localhost:'+config.port+'/');
