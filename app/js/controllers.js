(function () {
  'use strict';

  var app = angular.module('eco.controllers', []);

  app.controller('AuthCtrl', function ($scope, $state, User) {
    $scope.loggedIn = User.loggedIn;
    $scope.name = User.getName();
    User.checkAuth().then(function () {
      $scope.pic = User.find(User.getId()).pic;
    });

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

  app.controller('MainCtrl', function ($rootScope, $scope, $modal, Group, Post, User) {
    $scope.groups = Group.all();
    $scope.posts = Post.all();
    $scope.makePost = Post.add;
    $scope.me = User.find(User.getId());

    $scope.nowPosting = '';
    $scope.postGroup = {};
    $scope.postText = '';
    $scope.postTitle = '';

    $scope.postTypeSelect = [
      {
        name: 'text',
        selected: false
      },
      {
        name: 'image',
        selected: false
      },
      {
        name: 'link',
        selected: false
      }
    ];

    $scope.textPostModal = function () {
      var modalScope = $rootScope.$new(true);
      modalScope.makePost = function (postTitle, postContent, postGroups) {
        Post.textPost(postTitle, postContent, postGroups).then(function () {
          modalScope.postTitle = '';
          modalScope.postContent = '';
          modalScope.groupsSelect.forEach(function (g) {
            g.selected = false;
          });
        });
      };

      $scope.groups.$on('value', function (snapshot) {
        modalScope.groupsSelect = _.transform(snapshot.snapshot.value, function (acc, group, id) {
          group.selected = false;
          group.id = id;
          acc.push(group);
        }, []);
      });

      $modal.open({
        templateUrl: 'templates/text_posting_modal.html',
        scope: modalScope
      });
    };

    $scope.imagePostModal = function () {
      var modalScope = $rootScope.$new(true);

      modalScope.makePost = function (postTitle, postContent, postGroups, imageUrl, img) {
        Post.imagePost(postTitle, postContent, postGroups, imageUrl, img).then(function () {
          modalScope.postTitle = '';
          modalScope.postContent = '';
          modalScope.img = null;
          modalScope.groupsSelect.forEach(function (g) {
            g.selected = false;
          });
        });
      };

      $scope.groups.$on('value', function (snapshot) {
        modalScope.groupsSelect = _.transform(snapshot.snapshot.value, function (acc, group, id) {
          group.selected = false;
          group.id = id;
          acc.push(group);
        }, []);
      });

      modalScope.onFileSelect = function ($files) {
        var file = $files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
          modalScope.$apply(function () {
            modalScope.img = e.target.result;
          });
        };
        reader.readAsDataURL(file);
      };


      $modal.open({
        templateUrl: 'templates/image_posting_modal.html',
        scope: modalScope
      });
    };

    $scope.linkPostModal = function () {
      var modalScope = $rootScope.$new(true);

      modalScope.makePost = function (postTitle, postContent, postGroups, postLink) {
        Post.linkPost(postTitle, postContent, postGroups, postLink).then(function () {
          modalScope.postTitle = '';
          modalScope.postContent = '';
          modalScope.postLink = '';
          modalScope.groupsSelect.forEach(function (g) {
            g.selected = false;
          });
        });
      };

      $scope.groups.$on('value', function (snapshot) {
        modalScope.groupsSelect = _.transform(snapshot.snapshot.value, function (acc, group, id) {
          group.selected = false;
          group.id = id;
          acc.push(group);
        }, []);
      });

      $modal.open({
        templateUrl: 'templates/link_posting_modal.html',
        scope: modalScope
      });
    };

    $scope.switchPost = function (postType) {
      if ($scope.nowPosting === postType) {
        $scope.nowPosting = '';
      } else {
        $scope.nowPosting = postType;
      }
    };

    $scope.groups.$on('value', function (snapshot) {
      $scope.groupsSelect = _.transform(snapshot.snapshot.value, function (acc, group, id) {
        group.selected = false;
        group.id = id;
        acc.push(group);
      }, []);
    });

  });

  app.controller('GroupsCtrl', function ($rootScope, $scope, $modal, Group, Friend) {
    $scope.friends = Friend.all();
    $scope.removeGroup = Group.remove;
    $scope.removeMember = Group.removeMember;

    $scope.addGroupModal = function () {
      var modalScope = $rootScope.$new(true);

      modalScope.newGroup = {
        name: '',
        members: {}
      };

      var modalInstance = $modal.open({
        templateUrl: 'templates/add_group_modal.html',
        scope: modalScope
      });

      modalInstance.result.then(function () {
        Group.add(modalScope.newGroup);
        $scope.newGroup = {
          name: '',
          members: {}
        };
      });
    };

    $scope.addMemberModal = function (groupId) {
      $scope.groupName = Group.find(groupId).name;
      $scope.newMembers = {};

      Friend.getNonMembers(groupId).then(function (data) {
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
    $scope.paginatedFriends = [];
    $scope.itemsPerPage = 20;
    $scope.currentPage = 1;
    $scope.showing = 'friendList';

    function groupToPages() {
      $scope.fbFriends = _.sortBy($scope.fbFriends, 'name');
      for (var i = 0; i < $scope.fbFriends.length; i++) {
        if (i % $scope.itemsPerPage === 0) {
          $scope.paginatedFriends[Math.floor(i / $scope.itemsPerPage)] = [$scope.fbFriends[i]];
        } else {
          $scope.paginatedFriends[Math.floor(i / $scope.itemsPerPage)].push($scope.fbFriends[i]);
        }
      }
    }

    Friend.getFbFriends().then(function (friends) {
      $scope.fbFriends = friends;
      groupToPages();
    });

    $scope.show = function (name) {
      if (name !== $scope.showing) {
        $scope.showing = name;
      } else {
        $scope.showing = '';
      }
    };
  });

  app.controller('CommentsCtrl', function ($scope, User) {
    $scope.pic = User.find($scope.comment.user.id).pic;
  });

  app.controller('RepliesCtrl', function($scope, User){
    $scope.pic = User.find($scope.reply.user.id).pic;
  });

  app.controller('PostsCtrl', function($scope, User){
    $scope.pic = User.find($scope.post.user.id).pic;
  });

}());
