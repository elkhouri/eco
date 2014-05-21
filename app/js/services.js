(function () {
  'use strict';

  var app = angular.module('eco.services', []);

  var firebaseRef = new Firebase('https://eco.firebaseio.com');
  var userRef = new Firebase('https://eco.firebaseio.com/users');

  app.factory('UserService', function ($q, $firebaseSimpleLogin, $http, $cookies) {
    var factory = {};
    var auth = $firebaseSimpleLogin(firebaseRef);
    var me = {
      facebook: null,
      fbFriends: []
    };

    function getFriends() {
      $http.get('https://graph.facebook.com/v1.0/me/friends', {
        params: {
          access_token: me.facebook.accessToken
        }
      }).then(function (friends) {
        me.fbFriends = friends.data.data;
      });
    }

    auth.$getCurrentUser().then(function (user) {
      if (user !== null) {
        me.facebook = user;
        getFriends();
      }
    });

    factory.getMe = function () {
      return me;
    };

    factory.loggedIn = function () {
      return $cookies.firebaseSessionKey ? true: false;
    };

    factory.login = function () {
      return auth.$login('facebook', {
        rememberMe: true
      }).then(function (user) {
        me.facebook = user;
        getFriends();
      });
    };

    factory.logout = function () {
      me.facebook = null;
      auth.$logout();
    };

    return factory;
  });

  app.factory('FriendService', function() {

  });

  app.factory('GroupService', function () {
    var factory = {};
    var groups = [];

    factory.getGroups = function () {
      return groups;
    };

    factory.addGroup = function (name, members) {
      var membersList = [];

      for (var idKey in members) {
        var m = JSON.parse(members[idKey]);
        membersList.push({
          name: m.name,
          id: m.id
        });
      }

      groups.push({
        name: name,
        members: membersList
      });

    };

    return factory;
  });

  app.factory('PostService', function () {
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
