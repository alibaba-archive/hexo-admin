angular.module('hexo-admin',[]).
filter('markdown',function(){
  var convert=new Showdown.converter();
  return function(value){
    return convert.makeHtml(value||'');
  }
});

function post($scope,$http){
  $scope.deployState="deploy";
  $scope.change=function(post){
    post.modifyed=true;
  };
  $scope.deploy=function(){
    $scope.deployState="deploying...";
    $http.get('/deploy').
      success(function(data){
      console.log(data);
      $scope.deployState="deploy";
    });
  };
  $scope.create=function(){
    if($scope.newTitle){
      $http.post('/post',{title:$scope.newTitle}).
        success(function(data){
        console.log(data);
        var newPost={
          id:data.id,
          title:$scope.newTitle,
          date:data.date,
          content:''
        };
        $scope.posts.unshift(newPost);
        $scope.newTitle="";
        $scope.$apply();
        $('#'+data.id+' textarea').scroll(function(){
          var out=$('#'+data.id+' .output')[0];
          setH(out,getH(this));
        });
        $scope.show(newPost);
      });
    }
  };
  $scope.del=function(post){
    var index=$scope.posts.indexOf(post);
    if(index>-1){
      $scope.posts.splice(index,1);
      $http.delete('/post/'+post.id).
        success(function(date){
        dates();
        console.log(date);
      });
    }
  }
  $scope.modify=function(post){
    if(post.modifyed){
      $http.post('/post/'+post.id,post).
        success(function(data){
        console.log(data)
        post.modifyed=false;
      });
    }
  }
  $scope.slideup=function(){
    $('.content').slideUp();
    $scope.posts.map(function(post){
      if(post.show)post.show=false;
    });
    $scope.$apply();
  };
  var editor;
  function open(post){
    var id=post.id;
    post.show=true;
    var height=$(window).height();
    $('#'+id+' .input').height(height-100);
    $('#'+id+' .output').height(height-64);
    $('#'+id+' .markItUp').length==0&&
    $('#'+id+' textarea').markItUp(mySettings);
    $('#'+id+'>div').slideDown(function(){
      $.scrollTo('#'+id+'>h4','#'+id+'>h4');
    });
  }
  function getH(fn){
    return fn.scrollTop/(fn.scrollHeight-fn.offsetHeight+2);
  }
  function setH(fn,h){
    fn.scrollTop=h*(fn.scrollHeight-fn.offsetHeight+2);
  }
  $scope.show=function(post){
    if($('#'+post.id+'>div').css('display')!='none'){
      post.show=false;
      $('#'+post.id+'>div').slideUp();
    }
    else{
      if(post.content!=""&&!post.content){
        $http.get('/post/'+post.id).success(function(data){
          post.content=data.content;
          console.log(data);
          $scope.$apply();
          $('.output img').hover(function(){
            $(this).height('100%');
          },function(){
            $(this).height('30px');
          });
          $('#'+post.id+' textarea').scroll(function(){
            var out=$('#'+post.id+' .output')[0];
            setH(out,getH(this));
          });
          open(post);
        });
      }
      else open(post);
    }
    dates();
  };
  var edit='';
  var dates = function() {
    var j = $(".title");
    var o = $(window).scrollTop();
    var top=-1;
    for(var i=0;top==-1&&i<j.length;i++){
      var a=j[i+1]?$(j[i+1]).offset().top:65535;
      if(a>o){
        top=1;
        var p=$scope.title=$scope.posts[i-1];
        if(p&&edit!=p.id){
          if(edit!=''){
            $('#'+edit+' textarea').attr('id','');
          }
          edit=p.id;
          $('#'+p.id+' textarea').attr('id','wmd-input');
        }
      }
    }
    $scope.$apply();
  };
  $(window).scroll(dates);
  $http.get('/post').success(function(data){
    console.log(data);
    $scope.posts=data.reverse();
  });
}
