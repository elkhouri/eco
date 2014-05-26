'use strict';

var app = angular.module('eco.directives', []);

app.directive('textPost', function (Post) {
  var linker = function (scope, element) {
    scope.makePost = Post.textPost;
  };

  return {
    restrict: 'E',
    scope: {
      groups: '='
    },
    templateUrl: 'templates/text_posting_area.html',
    link: linker
  };

});

app.directive('imagePost', function (Post) {
  var linker = function (scope, element) {
    scope.makePost = Post.imagePost;

    scope.onFileSelect = function ($files) {
      var file = $files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        scope.$apply(function () {
          scope.img = e.target.result;
        });
      };
      reader.readAsDataURL(file);
    };
  };


  return {
    restrict: 'E',
    scope: {
      groups: '='
    },
    templateUrl: 'templates/image_posting_area.html',
    link: linker
  };

});

app.directive('linkPost', function (Post) {
  var linker = function (scope, element) {
    scope.makePost = Post.linkPost;

  };

  return {
    restrict: 'E',
    scope: {
      groups: '='
    },
    templateUrl: 'templates/link_posting_area.html',
    link: linker
  };

});

app.directive('comments', function(User){
  var linker = function(scope, element){
    scope.submit = function(comment){
      var commentObj = {
        user: {
          id: User.getId(),
          name: User.getName()
        },
        content: comment
      };
      scope.post.$child('comments').$add(commentObj);
      scope.comment = '';
    };
  };

  return {
    restrict: 'E',
    templateUrl: 'templates/comments.html',
    link: linker
  };
});

app.directive('post', function ($compile, $http, $templateCache) {
  var getTemplate = function (contentType) {
    var baseUrl = 'templates/';
    var templateMap = {
      text: 'text_post_template.html',
      image: 'image_post_template.html',
      link: 'link_post_template.html'
    };

    var templateUrl = baseUrl + templateMap[contentType];
    var templateLoader = $http.get(templateUrl, {
      cache: $templateCache
    });

    return templateLoader;
  };

  var linker = function (scope, element) {

    var loader = getTemplate(scope.post.type);

    loader.success(function (html) {
      element.html(html);
    }).then(function () {
      element.replaceWith($compile(element.html())(scope));
    });
  };

  return {
    restrict: 'E',
    scope: {
      post: '='
    },
    link: linker
  };
});
