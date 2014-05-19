'use strict';
Router.configure({
  layoutTemplate: 'layout'
});

Router.map(function () {
  this.route('home', {
    path: '/',
    template: 'main'
  });
  this.route('add-friends', {
    path: 'add-friends',
    template: 'addFriends'
  });
  this.route('groups', {
    path: '/groups',
    template: 'groups'
  });
  this.route('login', {
    path: '/login',
    template: 'login'
  });
});

var loginCheck = function (pause) {
  if (!(Meteor.loggingIn() || Meteor.user())) {
    Router.go('login');
    pause();
  }
};

Router.onBeforeAction(loginCheck, {
  except: 'login'
});
