var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Comment', new Schema({
  text: String,
  creator: String,
  date: String,
  author: String,
  idQuestion: String,
  like: [String]
}));
