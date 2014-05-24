'use strict';

/* Filters */

var app = angular.module('eco.filters', []);

app.filter('byGroup', function () {
  return function (posts, groups) {
    if (!groups) {
      return posts;
    }

    return _.filter(posts, function (post) {
      return _.some(groups, function (group) {
        return _.has(post.groups, group.name) ||
          _.has(group.group.members, post.userId);
      });
    });

  };
});

app.filter('notFriends', function () {
  return function (fbFriends, ecoFriends) {
    return _.filter(fbFriends, function (fb) {
      return !_.has(ecoFriends, fb.id);
    });
  };

});
