var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
	name: String,
	password: String,
	email: String,
	blocked: Boolean,
	gender: String,
	admin: Boolean,
	number: String,
	address: String,
	creator: Boolean,
	platform: String,
	profileImage: String,
	balance: Number
}));
