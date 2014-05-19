'use strict';

ServiceConfiguration.configurations.remove({
  service: "facebook"
});

ServiceConfiguration.configurations.insert({
  service: "facebook",
  appId: "277415149092039",
  secret: "e2d18ccda7da92fa064b8160e5abf7af"
});

function Facebook(accessToken) {
  this.fb = Meteor.require('fbgraph');
  this.accessToken = accessToken;
  this.fb.setAccessToken(this.accessToken);
  this.options = {
    timeout: 3000,
    pool: {maxSockets: Infinity},
    headers: {connection: "keep-alive"}
  };
  this.fb.setOptions(this.options);
}

Facebook.prototype.query = function(query, method) {
  var self = this;
  var method = (typeof method === 'undefined') ? 'get' : method;
  var data = Meteor.sync(function(done) {
    self.fb[method](query, function(err, res) {
      done(null, res);
    });
  });
  return data.result;
};

Facebook.prototype.getUserData = function() {
  return this.query('me');
};

Facebook.prototype.getFriendsData = function() {
  return this.query('/v1.0/me/friends');
};

Meteor.methods({
  getUserData: function() {
    var fb = new Facebook(Meteor.user().services.facebook.accessToken);
    var data = fb.getUserData();
    return data;
  },
  getFriendsData: function() {
    var fb = new Facebook(Meteor.user().services.facebook.accessToken);
    var data = fb.getFriendsData();
    return data;
  }
});
