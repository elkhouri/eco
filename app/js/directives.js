'use strict';

var app = angular.module('eco.directives', []);

app.directive('comments', function (User) {
  var linker = function (scope, element) {
    scope.getPic = function(userId) {
      return User.find(userId).pic;
    };

    scope.submitComment = function (comment) {
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

    scope.submitReply = function (reply, commentId) {
      var replyObj = {
        user: {
          id: User.getId(),
          name: User.getName()
        },
        content: reply
      };
      scope.post.$child('comments').$child(commentId).$child('replies').$add(replyObj);
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
    };

    scope.posterPic = function() {
      return User.find(scope.post.user.id).pic;
    };

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
