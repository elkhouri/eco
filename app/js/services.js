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

  app.factory('Friend', function ($q, $http, $firebase, User) {
    var friendsRef = new Firebase(User.getUrl() + '/friends');
    var friends = $firebase(friendsRef);
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
      friends.$remove(friendId);
    };

    factory.getFbFriends = function () {
      var defer = $q.defer();
      $http.get('https://graph.facebook.com/v1.0/me/friends', {
        params: {
          access_token: User.getMe().facebook.accessToken
        }
      }).then(function (friends) {
        defer.resolve(friends.data.data);
      }, function (e) {
        defer.reject(e);
      });

      return defer.promise;
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

    factory.add = function (newGroup) {
      var name = newGroup.name;
      var members = newGroup.members;

      _.each(members, function (name, id) {
        if (!name) {
          delete members[id];
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

    factory.removeMember = function (groupId, oldMemberId) {
      groups.$child(groupId).$child('members').$remove(oldMemberId);
    };

    factory.addMember = function (groupId, newMembers) {
      for (var id in newMembers) {
        var member = JSON.parse(newMembers[id]);
        groups.$child(groupId).$child('members').$child(member.id).$set(member.name);
      }
    };

    return factory;
  });

  app.factory('Post', function ($firebase, User) {
    var allPostsRef = new Firebase(FIREBASE_URL + 'posts');
    var postsIndexRef = new Firebase(FIREBASE_URL + 'posts_index');
    var allPosts = $firebase(allPostsRef);
    var postsIndex = $firebase(postsIndexRef);
    var viewablePosts = $firebase(postsIndexRef).$child(User.getId());

    var posts = [];
    var factory = {};

    factory.find = function (postId) {
      var post = allPosts.$child(postId);
      return post;
    };

    factory.all = function () {
      viewablePosts.$on('child_added', function (post) {
        posts.push(factory.find(post.snapshot.name));
      });

      return posts;
    };

    factory.add = function (text, groups) {
      var groupsObj = {};
      if (groups.length > 0) {
        groups.forEach(function (group) {
          groupsObj[group.id] = true;
        });
      }

      allPosts.$add({
        text: text,
        userId: User.getId(),
        groups: groupsObj
      }).then(function (ref) {
        viewablePosts.$child(ref.name()).$set(true);

        groups.forEach(function (group) {
          for (var id in group.members) {
            postsIndex.$child(id).$child(ref.name()).$set(true);
          }
        });
      });
    };

    return factory;
  });

}());
