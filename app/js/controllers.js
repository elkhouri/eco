(function () {
  'use strict';

  var app = angular.module('eco.controllers', []);

  app.controller('AuthCtrl', function ($scope, $state, User) {
    $scope.loggedIn = User.loggedIn;

    $scope.login = function () {
      User.login().then(function () {
        $state.go('main');
      });
    };

    $scope.logout = function () {
      User.logout();
      $state.go('login');
    };
  });

  app.controller('MainCtrl', function ($scope, User, Friend, Group, Post) {
    $scope.groups = Group.all();
    $scope.posts = Post.all();
    $scope.me = User.getMe();

    $scope.postGroup = {};
    $scope.postText = '';

    $scope.groups.$on('loaded', function(){
      $scope.currentGroup = $scope.groups[$scope.groups.$getIndex()[0]];
    });

    $scope.makePost = function () {
      Post.add($scope.postText, $scope.postGroup);
    };

  });

  app.controller('GroupsCtrl', function ($scope, $modal, Group) {
    $scope.newGroup = {
      name: '',
      members: {}
    };
    $scope.groupTab = -1;

    $scope.addGroupModal = function () {
      var modalInstance = $modal.open({
        templateUrl: 'template/add_group_modal.html',
        scope: $scope
      });

      modalInstance.result.then(function () {
        Group.add($scope.newGroup);
        $scope.newGroup = {
          name: '',
          members: {}
        };
      });
    };

    $scope.switchTab = function (index) {
      if (index === $scope.groupTab) {
        $scope.groupTab = -1;
      } else {
        $scope.groupTab = index;
      }
    };

    $scope.removeGroup = Group.remove;
  });

}());
