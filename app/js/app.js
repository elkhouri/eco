(function () {
  'use strict';

  angular.module('eco', [
    'ui.router',
    'firebase',
    'eco.controllers',
    'eco.filters',
    'eco.services',
    'eco.directives'
  ])
    .config(function ($stateProvider, $urlRouterProvider) {
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
        });
    });

}());
