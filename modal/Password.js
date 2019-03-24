var mongoose = require("../db/mongodb").mongoose;
var ObjectId = mongoose.Schema.Types.ObjectId;
var PasswordSchema = new mongoose.Schema({
    userId: ObjectId,
    Password: { type: String, default: false},
});

var PasswordModel = mongoose.model('Passworld', PasswordSchema );

exports.PasswordModel = PasswordModel;