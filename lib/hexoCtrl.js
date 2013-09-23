var exec=require('child_process').exec;

module.exports=function(config){
  function exe(cmd){
    return function(callback){
      exec('hexo '+cmd,{cwd:config.site_dir},function(err,stdout,stderr){
        if(err)return console.log(err);
        if(stderr)return console.log(stderr);
        console.log(cmd+' finished!');
        callback();
      });
    };
  }
  var hexo={
    generate:exe('generate'),
    init:exe('init'),
    deploy:exe('deploy'),
    clean:exe('clean')
  };
  return hexo;
};
