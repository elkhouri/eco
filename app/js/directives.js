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

    function handleFileSelect(evt) {
      var f = evt.target.files[0];
      var reader = new FileReader();
      reader.onload = function (theFile) {

        var filePayload = theFile.target.result;
        console.log(filePayload);

      };
      reader.readAsDataURL(f);

    }
    document.getElementById('image-upload').addEventListener('change', handleFileSelect, false);
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

app.directive('linkPost', function () {
  var linker = function (scope, element) {

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
