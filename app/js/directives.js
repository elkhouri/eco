'use strict';

var app = angular.module('eco.directives', []);

app.directive('textPost', function (Post) {
  var linker = function (scope, element) {
    scope.makePost = function (postTitle, postContent, postGroups) {
      Post.textPost(postTitle, postContent, postGroups).then(function () {
        scope.postTitle = '';
        scope.postContent = '';
        scope.postGroups = [];
      });
    }
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
    scope.makePost = function (postTitle, postContent, postGroups, imageUrl, img) {
      Post.imagePost(postTitle, postContent, postGroups, imageUrl, img).then(function () {
        scope.postTitle = '';
        scope.postContent = '';
        scope.postGroups = [];
        scope.img = null;
      });
    }

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
    scope.makePost = function (postTitle, postContent, postGroups, postLink) {
      Post.linkPost(postTitle, postContent, postGroups, postLink).then(function () {
        scope.postTitle = '';
        scope.postContent = '';
        scope.postGroups = [];
        scope.postLink = '';
      });
    }

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

app.directive('comments', function (User) {
  var linker = function (scope, element) {
    scope.submit = function (comment) {
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

app.directive('post', function ($compile, $http, $templateCache, User, Post) {
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
    scope.removePost = function () {
      Post.remove(scope.post.$id);
    };

    scope.ownPost = function () {
      return scope.post.user.id === User.getId();
    }

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
