var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Question', new Schema({
	title: String,
  text: String,
  creator: String,
  commentFlag: Boolean,
  date: String,
  author: String,
	tag: [String],
	creatorData: {name: String, image: String, platform: String},
	reply: String,
	dateReply: String
}));
