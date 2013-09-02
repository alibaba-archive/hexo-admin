function post($scope,$http){
  $scope.deployState="deploy";
  function resize(txt){
    txt.style.height="500px";
    if(txt.scrollHeight+2>500){
      txt.style.height=txt.scrollHeight+2+'px';
    }
  }
  $scope.change=function(post){
    post.modifyed=true;
    resize($('#'+post.id+' textarea')[0]);
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
        console.log(date);
      });
    }
  }
  $scope.modify=function(post){
    if(post.modifyed){
      $http.post('/post/'+post.id,{
        post:'title: '+post.title+
          '\ndate: '+post.date+
          '\n---\n'+post.content
      }).
      success(function(data){
        console.log(data)
        post.modifyed=false;
      });
    }
  }
  $scope.slideup=function(){
    $('.content').slideUp();
  };
  function open(id){
    $('#'+id+'>div').slideDown(function(){
      $.scrollTo('#'+id+'>h4','#'+id+'>h4');
      resize($('#'+id+' textarea')[0]);
    });
  }
  $scope.show=function(post){
    if($('#'+post.id+'>div').css('display')!='none'){
      $('#'+post.id+'>div').slideUp();
    }
    else{
      if(post.content!=""&&!post.content){
        $http.get('/post/'+post.id).success(function(data){
          post.content=data.content;
          console.log(data);
          $scope.$apply();
          open(post.id);
        });
      }
      else open(post.id);
    }
  };
  $http.get('/post').success(function(data){
    console.log(data);
    $scope.posts=data.reverse();
  });
}
