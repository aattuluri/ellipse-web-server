var format = require('string-format');
var should = require('should');

describe('Misc tests', function() {

  before(function(done) {
    done();
  });

  beforeEach(function(done) {
    done();
  });

  it('Test string-format', function(done) {
    var data = { userName: 'Anil'};
    var result = format('{userName} is requesting support!', data);
    result.should.containEql(data.userName);
    done();
  });

});
