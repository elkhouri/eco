(function () {
  'use strict';

  var app = angular.module('eco.services', []);

  var firebaseRef = new Firebase('https://eco.firebaseio.com');
  var usersRef = new Firebase('https://eco.firebaseio.com/users');

  app.factory('User', function ($firebase, $firebaseSimpleLogin, $cookies) {
    var factory = {};
    var me = {};
    var auth = $firebaseSimpleLogin(firebaseRef);
    var users = $firebase(usersRef);

    function createUser(user) {
      users[user.uid] = {
        name: user.displayName,
        fbId: user.id,
        $priority: user.uid
      };

      users.$save();
    }

    auth.$getCurrentUser().then(function (user) {
      if (user !== null) {
        me.facebook = user;
      }
    });

    factory.getMe = function () {
      return me;
    };

    factory.loggedIn = function () {
      return $cookies.firebaseSessionKey ? true : false;
    };

    factory.login = function () {
      return auth.$login('facebook', {
        rememberMe: true
      }).then(function (user) {
        me.facebook = user;
        if(users.$child(user.uid).$getIndex().length === 0){
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

    $rootScope.$on('$firebaseSimpleLogin:login', function (e, authUser) {
      getFbFriends(authUser.accessToken);
    });

    return factory;
  });

  app.factory('Groups', function () {
    var factory = {};
    var groups = [];

    factory.getGroups = function () {
      return groups;
    };

    factory.addGroup = function (newGroup) {
      var name = newGroup.name;
      var members = newGroup.members;
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
