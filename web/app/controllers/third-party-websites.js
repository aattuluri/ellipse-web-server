var ThirdPartyWebsite = require("../models/third-party-website").ThirdPartyWebsite;

exports.getByApiKeyAndOrigin = function (apiKey, origin, cb) {
  var criteria = {apiKey: apiKey};
  if (origin) {
    criteria.domain = origin;
  }
  findSingle (criteria, cb);
};

exports.getById = function (id, cb) {
  findSingle ({_id: id}, cb);
};

exports.getByAdminEmail = function (adminEmail, cb) {
  findSingle ({adminEmail: adminEmail}, cb);
};

function findSingle (criteria, cback) {
  ThirdPartyWebsite.find (criteria, function (err, result) {
    if (!err && result && result.length > 0) {
      return cback (null, result[0]);
    } else {
      return cback (err, null);
    }
  });
}

exports.ThirdPartyWebsite = ThirdPartyWebsite;
