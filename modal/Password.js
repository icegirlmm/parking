var mongoose = require("../db/mongodb").mongoose;

var PasswordSchema = new mongoose.Schema({
    userId: String,
    password: {type: Number, default: null},
});

var PasswordModel = mongoose.model('Password', PasswordSchema);

exports.PasswordModel = PasswordModel;