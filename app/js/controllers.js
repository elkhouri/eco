(function () {
  'use strict';

  var app = angular.module('eco.controllers', []);

  app.controller('AuthCtrl', function ($scope, $state, User) {
    $scope.loggedIn = User.loggedIn;
    $scope.name = User.getName();

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

  app.controller('MainCtrl', function ($scope, Group, Post) {
    $scope.groups = Group.all();
    $scope.posts = Post.all();
    $scope.makePost = Post.add;

    $scope.nowPosting = '';
    $scope.postGroup = {};
    $scope.postText = '';
    $scope.postTitle = '';

    $scope.switchPost = function (postType){
      if($scope.nowPosting === postType){
        $scope.nowPosting = '';
      } else {
        $scope.nowPosting = postType;
      }
    };

  });

  app.controller('GroupsCtrl', function ($scope, $modal, Group, Friend) {
    $scope.friends = Friend.all();
    $scope.removeGroup = Group.remove;
    $scope.removeMember = Group.removeMember;

    $scope.addGroupModal = function () {
      $scope.newGroup = {
        name: '',
        members: {}
      };

      var modalInstance = $modal.open({
        templateUrl: 'templates/add_group_modal.html',
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

    $scope.addMemberModal = function (groupId) {
      $scope.groupName = Group.find(groupId).name;
      $scope.newMembers = {};

      Friend.getNonMembers(groupId).then(function(data){
        $scope.nonMembers = data;
      });

      var modalInstance = $modal.open({
        templateUrl: 'templates/add_member_modal.html',
        scope: $scope
      });

      modalInstance.result.then(function () {
        Group.addMember(groupId, $scope.newMembers);
        $scope.newMembers = {};
      });
    };

    $scope.groupTab = -1;
    $scope.switchTab = function (index) {
      if (index === $scope.groupTab) {
        $scope.groupTab = -1;
      } else {
        $scope.groupTab = index;
      }
    };

  });

  app.controller('FriendsCtrl', function ($scope, Friend) {
    $scope.friends = Friend.all();
    $scope.pendingInvites = Friend.pendingInvites();
    $scope.removeFriend = Friend.remove;
    $scope.requestFriend = Friend.request;
    $scope.cancelRequest = Friend.cancelRequest;
    $scope.fbFriends = [];

    Friend.getFbFriends().then(function (friends) {
      $scope.fbFriends = friends;
    });

    $scope.showing = '';
    $scope.show = function (name) {
      if (name !== $scope.showing) {
        $scope.showing = name;
      } else {
        $scope.showing = '';
      }
    };
  });

}());
