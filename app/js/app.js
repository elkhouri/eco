(function () {
  'use strict';

  var app = angular.module('eco', [
    'ui.router',
    'ui.bootstrap',
    'firebase',
    'angularFileUpload',
    'ngSanitize',
    'multi-select',
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
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl',
        resolve: {
          auth: function (User) {
            return User.checkAuth();
          }
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'AuthCtrl'
      });
  });

  app.run(function ($rootScope, $state, User) {
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
      if (toState.name !== 'login') {
        User.checkAuth().then(function () {
          if (!User.loggedIn()) {
            event.preventDefault();
            $state.go('login');
          }
        });
      }

    });
  });

}());
