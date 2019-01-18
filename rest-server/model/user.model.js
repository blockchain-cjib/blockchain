var bcrypt = require('bcryptjs');

// ORM model for "user" table
module.exports = (sequelize, Sequelize) => {
	let User = sequelize.define('user', {
	  	username: { type: Sequelize.STRING },
	  	password: { type: Sequelize.STRING },
	  	role: { type: Sequelize.INTEGER }  // 0: CJIB, 1: Municipalities
	}, {
    	timestamps: false
	});
	
	User.prototype.comparePassword = function (passw, cb) {
		bcrypt.compare(passw, this.password, function (err, isMatch) {
			if (err) {
				return cb(err);
			}
			cb(null, isMatch);
		});
	};
	
	return User;
}
