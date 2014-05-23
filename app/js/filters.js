'use strict';

/* Filters */

var app = angular.module('eco.filters', []);

app.filter('byGroup', function () {
  return function (posts, group) {
    if(group && group.name === 'All') {
      return posts;
    }

    var filteredPosts = [];

    posts.forEach(function (post) {
      for (var groupId in post.groups) {
        if (post.groups[groupId] === group.name) {
          filteredPosts.push(post);
        }
      }
    });

    return filteredPosts;
  };
});

app.filter('notFriends', function(){
  return function (fbFriends, ecoFriends){
    return _.filter(fbFriends, function(fb){
      return !_.has(ecoFriends, fb.id);
    });
  };

});
