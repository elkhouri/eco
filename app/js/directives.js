'use strict';

/* Directives */

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

app.directive('imagePost', function () {
  var linker = function (scope, element) {
    scope.makePost = function (postTitle, imageUrl, imageUpload, groups) {
      console.log(postTitle, imageUrl, imageUpload, groups);
    };

    scope.onFileSelect = function ($files) {
      var file = $files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        scope.$apply(function () {
          scope.imgPreview = e.target.result;
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
