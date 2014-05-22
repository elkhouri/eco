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

  app.controller('MainCtrl', function ($scope, $modal, User, Friends, Groups, Posts) {
    $scope.groups = Groups.getGroups();
    $scope.posts = Posts.getPosts();
    $scope.me = User.getMe();

    $scope.postGroup = {};
    $scope.postText = '';
    $scope.currentGroup = {};
    $scope.groupTab = -1;

    $scope.makePost = function () {
      Posts.makePost($scope.postText, $scope.postGroup);
    };

    $scope.switchTab = function (index) {
      if (index === $scope.groupTab) {
        $scope.groupTab = -1;
      } else {
        $scope.groupTab = index;
      }
    };

    $scope.newGroup = {
      name: '',
      members: {}
    };

    $scope.addGroupModal = function () {
      var modalInstance = $modal.open({
        templateUrl: 'template/add_group_modal.html',
        scope: $scope
      });

      modalInstance.result.then(function () {
        Groups.addGroup($scope.newGroup);
        $scope.newGroup = {
          name: '',
          members: {}
        };
      });
    };
  });

}());
