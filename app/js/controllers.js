(function () {
  'use strict';

  var app = angular.module('eco.controllers', []);

  app.controller('MainCtrl', function ($scope, UserService, GroupService, PostService) {
    $scope.loggedIn = UserService.loggedIn;
    $scope.login = UserService.login;
    $scope.logout = UserService.logout;
    $scope.groups = GroupService.getGroups();
    $scope.posts = PostService.getPosts();

    $scope.postGroup = {};
    $scope.postText = '';
    $scope.currentGroup = {};

    $scope.makePost = function () {
      PostService.makePost($scope.postText, $scope.postGroup);
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
