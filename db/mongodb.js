var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://127.0.0.1:27017/easypark',{ useNewUrlParser: true });

exports.mongoose = mongoose;