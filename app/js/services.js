(function () {
  'use strict';

  var app = angular.module('eco.services', []);

  var userRef = new Firebase('https://eco.firebaseio.com/users');

  app.factory('UserService', function ($q) {
    var factory = {};
    var me = {
      facebook: OAuth.create('facebook')
    };

    factory.me = function () {
      return me;
    };

    factory.loggedIn = function (){
      return me.facebook !== false; 
    };

    factory.login = function () {
      var d = $q.defer();
      
      OAuth.popup('facebook', function(err, result) {
        d.resolve(result);
      });
      
      d.promise.then(function(result){
        me.facebook = result;
      });
    };
    
    factory.logout = function () {
      OAuth.clearCache('facebook');
      me.facebook = false;
    };
    
    return factory;
  });
  
  app.factory('GroupService', function(){
    var factory = {};
    var groups = [];
    
    factory.getGroups = function () {
      return groups;
    };
    
    factory.addGroup = function (name, members) {
      var membersList = [];
      
      for( var idKey in members){
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
  
  app.factory('PostService', function(){
    var factory = {};
    var posts = [];
    
    factory.getPosts = function(){
      return posts; 
    };
    
    factory.makePost = function(text, group){
      posts.push({
        text: text,
        group: group
      });
    };
    
    return factory;
  });
  
}());
