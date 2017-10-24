var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Transactions', new Schema({
  date: String,
  value: Number,
  destination:  String,
  state: String
}));
