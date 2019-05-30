var mongoose = require("../db/mongodb").mongoose;
var ObjectId = mongoose.Schema.Types.ObjectId;
var PasswordSchema = new mongoose.Schema({
    userId: ObjectId,
    password: { type: String, default: false},
});

var PasswordModel = mongoose.model('passworld', PasswordSchema );

exports.PasswordModel = PasswordModel;