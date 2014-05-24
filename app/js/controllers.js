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

  app.controller('MainCtrl', function ($scope, Group, Post) {
    $scope.groups = Group.all();
    $scope.posts = Post.all();

    $scope.postGroup = {};
    $scope.postText = '';

    $scope.makePost = function () {
      Post.add($scope.postText, $scope.postGroup);
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

    $scope.addMemberModal = function (groupName) {
      var members = Group.getMembers(groupName);
      $scope.nonMembers = _($scope.friends.$getIndex())
        .difference(members.$getIndex())
        .map(function (friendId) {
          return {
            name: Friend.find(friendId),
            id: friendId
          };
        })
        .value();

      $scope.groupName = groupName;
      $scope.newMembers = {};

      var modalInstance = $modal.open({
        templateUrl: 'template/add_member_modal.html',
        scope: $scope
      });

      modalInstance.result.then(function () {
        Group.addMember($scope.groupName, $scope.newMembers);
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
    $scope.addFriend = Friend.add;
    $scope.removeFriend = Friend.remove;
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
