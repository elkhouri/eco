(function () {
  'use strict';

  var app = angular.module('eco.controllers', []);

  app.controller('MainCtrl', function ($scope, UserService, GroupService, PostService) {
    $scope.loggedIn = UserService.loggedIn;
    $scope.login = UserService.login;
    $scope.logout = UserService.logout;
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
