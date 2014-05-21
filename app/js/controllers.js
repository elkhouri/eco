(function () {
  'use strict';

  var app = angular.module('eco.controllers', []);

  app.controller('AuthCtrl', function ($scope, $state, UserService) {
    $scope.loggedIn = UserService.loggedIn;

    $scope.login = function () {
      UserService.login().then(function () {
        $state.go('main');
      });
    };

    $scope.logout = function () {
      UserService.logout();
      $state.go('login');
    };
  });

  app.controller('MainCtrl', function ($scope, UserService, GroupService, PostService) {
    $scope.groups = GroupService.getGroups();
    $scope.posts = PostService.getPosts();
    $scope.me = UserService.getMe();

    $scope.postGroup = {};
    $scope.postText = '';
    $scope.currentGroup = {};
    $scope.groupTab = -1;

    $scope.makePost = function () {
      PostService.makePost($scope.postText, $scope.postGroup);
    };

    $scope.switchTab = function (index) {
      if (index === $scope.groupTab) {
        $scope.groupTab = -1;
      } else {
        $scope.groupTab = index;
      }
    };
  });

  app.controller('FriendsCtrl', function ($scope, UserService, GroupService) {
    $scope.checked = {};
    $scope.groupName = '';
    $scope.me = UserService.getMe();

    $scope.addGroup = function () {
      GroupService.addGroup($scope.groupName, $scope.checked);
    };

  });

  app.controller('GroupsCtrl', function ($scope, GroupService) {
    $scope.groups = GroupService.getGroups();
  });

}());
