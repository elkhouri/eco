(function () {
  'use strict';

  var app = angular.module('eco.controllers', []);

  app.controller('MainCtrl', function ($scope, $firebase, UserService, GroupService, PostService) {
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
    var me = UserService.me();
    $scope.loggedIn = UserService.loggedIn;

    $scope.friends = [];
    $scope.checked = {};
    $scope.groupName = '';

    function getFriends() {
      me.facebook.get('/me/friends')
        .done(function (friends) {
          $scope.$apply(function () {
            $scope.friends = friends.data;
          });
        });
    }

    if ($scope.loggedIn()) {
      getFriends();
    }

    $scope.addGroup = function () {
      GroupService.addGroup($scope.groupName, $scope.checked);
    };

  });

  app.controller('GroupsCtrl', function ($scope, GroupService) {
    $scope.groups = GroupService.getGroups();
  });

}());
