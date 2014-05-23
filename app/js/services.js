(function () {
  'use strict';

  var app = angular.module('eco.services', []);

  var FIREBASE_URL = 'https://eco.firebaseio.com/';

  app.factory('User', function ($firebase, $firebaseSimpleLogin, $cookies) {
    var auth = $firebaseSimpleLogin(new Firebase(FIREBASE_URL));
    var usersRef = new Firebase(FIREBASE_URL + 'users');
    var users = $firebase(usersRef);

    var factory = {};
    var me = {};

    function createUser(user) {
      users[user.uid] = {
        name: user.displayName,
        $priority: user.uid
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

    factory.getMe = function () {
      return me;
    };

    factory.getId = function () {
      return me.facebook.uid;
    };

    factory.getUrl = function () {
      return FIREBASE_URL + 'users/' + factory.getId() + '/';
    };

    factory.loggedIn = function () {
      return $cookies.firebaseSessionKey ? true : false;
    };

    factory.login = function () {
      return auth.$login('facebook', {
        rememberMe: true
      }).then(function (user) {
        me.facebook = user;
        if (users.$child(user.uid).$getIndex().length === 0) {
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

  app.factory('Friend', function ($rootScope, $http, User) {
    var factory = {};

    function getFbFriends(accessToken) {
      $http.get('https://graph.facebook.com/v1.0/me/friends', {
        params: {
          access_token: accessToken
        }
      }).then(function (friends) {
        User.getMe().fbFriends = friends.data.data;
      });
    }

    getFbFriends(User.getMe().facebook.accessToken);

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

      groups.$child(name).$set({
        members: members
      });

    };

    factory.remove = function (groupId) {
      groups.$remove(groupId);
    };

    return factory;
  });

  app.factory('Post', function ($firebase, User) {
    var allPostsRef = new Firebase(FIREBASE_URL + 'posts');
    var postsIndexRef = new Firebase(FIREBASE_URL + 'posts_index');
    var viewablePosts = $firebase(postsIndexRef).$child(User.getId());
    var allPosts = $firebase(allPostsRef);
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
          groupsObj[group.name] = group.name;
        });
      }

      allPosts.$add({
        text: text,
        userId: User.getId(),
        groups: groupsObj
      }).then(function (ref) {
        viewablePosts.$child(ref.name()).$set({
          userId: User.getId()
        });
      });
    };

    return factory;
  });

}());
