'use strict';

// Subscriptions
Meteor.subscribe('Posts', Meteor.userId());
Meteor.subscribe('Groups', Meteor.userId());

// Post Area Scripts
Template.postArea.groups = function () {
  return Groups.find();
};

Template.postArea.events({
  'submit': function (event) {
    event.preventDefault();
    var text = $('#postArea').val();
    var groupId = $('#postGroup').val();
    $('#postArea').val('');

    console.log(groupId);

    Posts.insert({
      userId: Meteor.userId(),
      groupId: groupId,
      text: text
    });
  }
});


// Main Area Scripts
Template.main.groups = function () {
  return Groups.find();
};

Template.main.postsLeft = function () {
  var posts = Posts.find({
    groupId: Session.get('leftGroup')
  });

  return {
    posts: posts
  };
};

Template.main.postsRight = function () {
  var posts = Posts.find({
    groupId: Session.get('rightGroup')
  });
  return {
    posts: posts
  };
};

Template.main.events({
  'change #leftGroup': function (event) {
    var val = $('#leftGroup').val();
    Session.set('leftGroup', val);
  },
  'change #rightGroup': function (event) {
    var val = $('#rightGroup').val();
    Session.set('rightGroup', val);
  }
});


// Friend Page Scripts
Deps.autorun(function () {
  if (Meteor.userId()) {
    Meteor.call('getFriendsData', function (err, data) {
      Session.set('friends', data.data);
    });
  }
});

Template.addFriends.friends = function () {
  return Session.get('friends');
};

Template.addFriends.events({
  'submit': function (event) {
    event.preventDefault();

    var groupName = $('#groupName').val();
    var checkedFriends = [];
    $('#addFriendsForm *').filter(':checkbox:checked').each(function () {
      var fbid = $(this).val().split('_')[0];
      var name = $(this).val().split('_')[1];
      if (this.checked) {
        checkedFriends.push({
          name: name,
          fbid: fbid
        });
      }
    });

    console.log(groupName, checkedFriends);

    Groups.insert({
      userId: Meteor.userId(),
      name: groupName,
      members: checkedFriends
    });

    Router.go('home');
    window.scrollTo(0, 0);
  }
});


// Groups Page Scripts
Template.groups.groups = function () {
  return Groups.find();
};


// Login Page Scripts
Template.login.events({
  'click #loginBtn': function () {
    Meteor.loginWithFacebook({
      requestPermissions: ['user_friends']
    }, function (err) {
      if (!err) {
        Router.go('home');
      }
    });
  }
});
