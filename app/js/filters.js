'use strict';

/* Filters */

var app = angular.module('eco.filters', []);

app.filter('byGroup', function () {
  return function (posts, groups) {
    if (!groups || groups.length === 0) {
      return posts;
    }

    return _.filter(posts, function (post) {
      return _.some(groups, function (group) {
        return _.has(post.groups, group.id) ||
          _.has(group.members, post.user.id);
      });
    });

  };
});

app.filter('byType', function(){
  return function (posts, types){
    if (!types || types.length === 0) {
      return posts;
    }

    return _.filter(posts, function (post) {
      return _.some(types, function (type) {
        return post.type === type.name;
      });
    });
  };
});

app.filter('notFriends', function () {
  return function (fbFriends, ecoFriends, pendings) {
    return _.filter(fbFriends, function (fb) {
      return !_.has(ecoFriends, fb.id) && !_.has(pendings, fb.id);
    });
  };
});

app.filter('isFriends', function(User, Friend){
  return function(comments){
    if(!comments){
      return comments;
    }

    return _.filter(comments, function(comment){
      if(!comment.user){
        return true; 
      }
      return User.getId() === comment.user.id || Friend.find(comment.user.id);
    });
  };
});

app.filter('postExists', function () {
  return function (posts) {
    return _.filter(posts, function (post) {
      return post.user;
    });
  };
});
