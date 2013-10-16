
var should=require('should');
var fs=require('fs');
var post=require('../lib/post.js')({
  post_dir: __dirname+'/posts/',
  headers:['title','date'],
  extension:'.md'
});

describe('post management',function(){
  before(function(done){
    post.write({
      title:'test',
      date:'2012-12-12 12:12:12',
      id:'postid',
      content:'hello world'
    },done);
  });
  it('should return a json when file is existed and well formatted',function(){
    var test=post.read('postid');
    test.should.have.property('title','test');
    test.should.have.property('date','2012-12-12 12:12:12');
    test.should.have.property('content','hello world');
  });
  it('should delete the file',function(done){
    post.remove('postid',function(e){
      should.not.exist(e);
      post.remove('postid',function(e){
        should.exist(e);
        done();
      });
    });
  });
  it('create posts without same name',function(done){
    post.create('testtitle',function(posta){
      post.create('testtitle',function(postb){
        posts=post.load();
        var cnt=0;
        for(var key in posts){
          if(posts.hasOwnProperty(key)){
            cnt++;
          }
        }
        cnt.should.equal(2);
        post.remove(posta.id,function(){
          post.remove(postb.id,function(){
            done();
          });
        });
      });
    });
  });
});
