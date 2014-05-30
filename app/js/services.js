(function () {
  'use strict';

  var app = angular.module('eco.services', []);

  var FIREBASE_URL = 'https://eco.firebaseio.com/';

  app.factory('User', function ($firebase, $firebaseSimpleLogin) {
    var auth = $firebaseSimpleLogin(new Firebase(FIREBASE_URL));
    var usersRef = new Firebase(FIREBASE_URL + 'users');
    var users = $firebase(usersRef);

    var factory = {};
    var me = {};

    function createUser(user) {
      users[user.id] = {
        name: user.displayName,
        $priority: user.id
      };

      users.$save();
    }

    factory.checkAuth = function () {
      return auth.$getCurrentUser().then(function (user) {
        if (user !== null) {
          me.facebook = user;
        }
      });
    };

    factory.find = function (id) {
      return users.$child(id);
    };

    factory.getMe = function () {
      return me;
    };

    factory.getName = function () {
      return me && me.hasOwnProperty('facebook') ? me.facebook.displayName : '';
    };

    factory.getId = function () {
      return me.facebook.id;
    };

    factory.getUrl = function () {
      return FIREBASE_URL + 'users/' + factory.getId() + '/';
    };

    factory.loggedIn = function () {
      return auth.user !== null;
    };

    factory.login = function () {
      return auth.$login('facebook', {
        rememberMe: true
      }).then(function (user) {
        me.facebook = user;
        if (users.$child(user.id).$getIndex().length === 0) {
          createUser(user);
        }
      });
    };

    factory.logout = function () {
      me = null;
      auth.$logout();
    };

    return factory;
  });

  app.factory('Friend', function ($q, $http, $firebase, localStorageService, User, Group) {
    var friendsRef = new Firebase(User.getUrl() + '/friends');
    var pendingRef = new Firebase(User.getUrl() + '/pending');
    var friends = $firebase(friendsRef);
    var pendingInvites = $firebase(pendingRef);
    var factory = {};

    factory.all = function () {
      return friends;
    };

    factory.add = function (newFriend) {
      friends.$child(newFriend.id).$set(newFriend.name);
    };

    factory.find = function (friendId) {
      return friends[friendId];
    };

    factory.remove = function (friendId) {
      var friendRef = User.find(friendId);

      friends.$remove(friendId);
      friendRef.$child('friends').$remove(User.getId());

      Group.all().$on('loaded', function (groups) {
        _.forOwn(groups, function (group, id) {
          if (_.has(group.members, friendId)) {
            Group.removeMember(id, friendId);
          }
        });
      });
    };

    factory.pendingInvites = function () {
      return pendingInvites;
    };

    function updateFbFriends() {
      var defer = $q.defer();

      $http.get('https://graph.facebook.com/v1.0/me/friends', {
        params: {
          access_token: User.getMe().facebook.accessToken
        }
      }).then(function (friends) {
        localStorageService.set('fbFriends', friends.data.data);
        defer.resolve(friends.data.data);
      }, function (e) {
        defer.reject(e);
      });

      return defer.promise;
    }

    factory.getFbFriends = function () {
      var defer = $q.defer();
      if (localStorageService.get('fbFriends') !== null) {
        updateFbFriends();
        defer.resolve(localStorageService.get('fbFriends'));
      } else {
        updateFbFriends().then(function(data){
          defer.resolve(data);
        });
      }

      return defer.promise;
    };

    factory.getNonMembers = function (groupId) {
      var defer = $q.defer();
      friends.$on('loaded', function (friends) {
        var nonMembers = _.transform(friends, function (acc, name, id) {
          if (!Group.hasMember(groupId, id)) {
            acc[id] = name;
          }
        });
        defer.resolve(nonMembers);
      });

      return defer.promise;
    };

    factory.request = function (friend) {
      var friendRef = User.find(friend.id);
      var friendPending = friendRef.$child('pending').$child(User.getId());

      friendPending.$on('loaded', function () {
        if (friendPending.$value) {
          friendPending.$remove();
          friendRef.$child('friends').$child(User.getId()).$set(User.getName());
          friends.$child(friend.id).$set(friend.name);
        } else {
          pendingInvites.$child(friend.id).$set(friend.name);
        }
      });
    };

    factory.cancelRequest = function (friendId) {
      pendingInvites.$remove(friendId);
    };

    return factory;
  });

  app.factory('Group', function ($firebase, User) {
    var groupsRef = new Firebase(User.getUrl() + '/groups');
    var groups = $firebase(groupsRef);
    var factory = {};

    factory.all = function () {
      return groups;
    };

    factory.find = function (groupId) {
      return groups.$child(groupId);
    };

    factory.add = function (newGroup) {
      var name = newGroup.name;
      var members = _.transform(newGroup.members, function (acc, name, id) {
        if (name) {
          acc[id] = name;
        }
      });

      groups.$add({
        name: name,
        members: members
      });
    };

    factory.remove = function (groupId) {
      groups.$remove(groupId);
    };

    factory.getMembers = function (groupId) {
      return groups.$child(groupId).$child('members');
    };

    factory.hasMember = function (groupId, memberId) {
      return _.has(groups.$child(groupId).$child('members'), memberId);
    };

    factory.removeMember = function (groupId, oldMemberId) {
      groups.$child(groupId).$child('members').$remove(oldMemberId);
    };

    factory.addMember = function (groupId, newMembers) {
      _.forOwn(newMembers, function (name, id) {
        groups.$child(groupId).$child('members').$child(id).$set(name);
      });
    };

    return factory;
  });

  app.factory('Post', function ($firebase, User, Friend) {
    var allPostsRef = new Firebase(FIREBASE_URL + 'posts');
    var postsIndexRef = new Firebase(FIREBASE_URL + 'posts_index');
    var allPosts = $firebase(allPostsRef);
    var postsIndex = $firebase(postsIndexRef);
    var viewablePosts = $firebase(postsIndexRef).$child(User.getId());

    var posts = [];
    var factory = {};

    factory.find = function (postId) {
      return allPosts.$child(postId);
    };

    factory.all = function () {
      viewablePosts.$on('child_added', function (post) {
        posts.push(factory.find(post.snapshot.name));
      });

      return posts;
    };

    factory.remove = function (postId) {
      allPosts.$remove(postId);
    };

    function addPost(type, title, content, groups, link, image) {
      var groupsObj = {};
      if (groups) {
        groups.forEach(function (group) {
          groupsObj[group.id] = true;
        });
      }

      return allPosts.$add({
        timeStamp: Date.now(),
        type: type,
        title: title,
        content: content,
        link: link,
        image: image,
        user: {
          id: User.getId(),
          name: User.getName()
        },
        groups: groupsObj
      }).then(function (ref) {
        viewablePosts.$child(ref.name()).$set(true);

        if (groups) {
          groups.forEach(function (group) {
            for (var id in group.members) {
              postsIndex.$child(id).$child(ref.name()).$set(true);
            }
          });
        } else {
          Friend.all().$on('loaded', function (friends) {
            _.forOwn(friends, function (name, id) {
              postsIndex.$child(id).$child(ref.name()).$set(true);
            });
          });
        }
      });
    }

    factory.textPost = function (title, content, groups) {
      return addPost('text', title, content, groups);
    };

    factory.linkPost = function (title, content, groups, link) {
      return addPost('link', title, content, groups, link);
    };

    factory.imagePost = function (title, content, groups, imageUrl, imageFile) {
      return addPost('image', title, content, groups, imageUrl, imageFile);
    };

    return factory;
  });

}());
