(function () {
  'use strict';

  var app = angular.module('eco', [
    'ui.router',
    'ui.bootstrap',
    'ngCookies',
    'firebase',
    'eco.controllers',
    'eco.filters',
    'eco.services',
    'eco.directives'
  ]);

  app.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'template/main.html',
        controller: 'MainCtrl'
      })
      .state('addFriends', {
        url: '/add-friends',
        templateUrl: 'template/add_friends.html',
        controller: 'FriendsCtrl'
      })
      .state('groups', {
        url: '/groups',
        templateUrl: 'template/groups.html',
        controller: 'GroupsCtrl'
      })
      .state('login', {
        url: '/login',
        templateUrl: 'template/login.html',
        controller: 'AuthCtrl'
      });
  });

  app.run(function ($rootScope, $state, User) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if (toState.name !== 'login' && !User.loggedIn()) {
        event.preventDefault();
        $state.go('login');
      }

    });
  });

}());
