(function () {
  'use strict';

  angular.module('eco', [
    'ui.router',
    'ui.bootstrap.tabs',
    'eco.controllers',
    'eco.filters',
    'eco.services',
    'eco.directives'
  ])
    .config(function ($stateProvider, $urlRouterProvider) {
      OAuth.initialize('S6i3fJXQNTUm7A6opZsJPA_1mto', {
        cache: true
      });
      
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
