'use strict';

/* Filters */

var app = angular.module('eco.filters', []);

app.filter('filterByGroup', function (Posts) {
  return function (posts, group) {
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
