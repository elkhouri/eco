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
        fbId: user.id,
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

  app.factory('Friends', function ($rootScope, $http, User) {
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

  app.factory('Groups', function ($firebase, User) {
    var groupsRef = new Firebase(FIREBASE_URL + 'groups');
    var groups = $firebase(groupsRef).$child(User.getId());
    var factory = {};

    factory.getGroups = function () {
      return groups;
    };

    factory.addGroup = function (newGroup) {
      var name = newGroup.name;
      var members = newGroup.members;

      _.each(members, function(v, k){
        if(!v) {
          delete members[k];
        }
      });

      groups.$add({
        name: name,
        members: members
      });

    };

    factory.removeGroup = function (groupId){
      groups.$remove(groupId);
    };

    return factory;
  });

  app.factory('Posts', function () {
    var factory = {};
    var posts = [];

    factory.getPosts = function () {
      return posts;
    };

    factory.makePost = function (text, group) {
      posts.push({
        text: text,
        group: group
      });
    };

    return factory;
  });

}());
