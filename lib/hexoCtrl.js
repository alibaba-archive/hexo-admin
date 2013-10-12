var exec=require('child_process').exec;

module.exports=function(config){
  function exe(cmd){
    return function(callback){
      exec('hexo '+cmd,{cwd:config.site_dir},function(err,stdout,stderr){
        console.log(err,stdout,stderr);
        console.log(cmd+' finished!');
        callback(err,stdout,stderr);
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
