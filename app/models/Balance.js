var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Balance', new Schema({
	idUser: String,
	deleted: Boolean,
	date: String,
	value: Number,
	dateWithdrawal: String,
	action: String,
	actionId: String,
}));
