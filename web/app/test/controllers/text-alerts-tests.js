var should = require('should');
var textAlertUtils = require('../../controllers/text-alert-utils');

describe('Text alerts tests', function() {

  before(function(done) {
    done();
  });

  beforeEach(function(done) {
    done();
  });

  it('Valid Phone Number', function(done) {
    var result = textAlertUtils.validateAndConvertToE164('+14159997694');
    should.not.exist(result.error);
    result = textAlertUtils.validateAndConvertToE164('7024238953');
    should.not.exist(result.error);
    done();
  });

  it('InValid Phone Number', function(done) {
    var result = textAlertUtils.validateAndConvertToE164('+149997694');
    should.exist(result.error);
    done();
  });

});
