var should = require('should');
var fbCommon = require('../../messenger/common');
var User = require('../../models/user').User;

describe('FB messenger tests', function() {
  var user;

  before(function(done) {
    User.save({
      firstName: "Gavazo",
      email: "test@gmail.com",
      thirdPartyId: '1040960522607288',
      source: User.SOURCE.FACEBOOK
    }, function(err, result) {
      user = result;
      if(err) throw err;
      done();
    });
  });

  beforeEach(function(done) {
		done();
  });

  it('Test user name presence in fb message', function(done) {
    fbCommon.convertAAtoFB(1040960522607288, {uid: user._id, m: 'Hello there!', c: 'Notimportant!'},
        function(err, fbMsg) {
      should.exist(fbMsg);
      var text = fbMsg.message.text;
      text.should.containEql(user.firstName);
      done();
    });
  });

  after(function(done) {
    User.remove({
      _id: user._id
    }, function(err) {
      if(err) throw err;
      done();
    });
  });

});
