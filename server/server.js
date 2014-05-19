'use strict';

Meteor.publish("Posts", function (userId) {
  return Posts.find({
    userId: userId
  });
});

Meteor.publish("Groups", function (userId) {
  return Groups.find({
    userId: userId
  });
});
