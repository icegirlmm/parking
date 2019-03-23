var mongoose = require("../db/mongodb").mongoose;
var ObjectId = mongoose.Schema.Types.ObjectId;
var codeSchema = new mongoose.Schema({
    session:String,
    userId: ObjectId,
    codeurl: String,
});

var codeModel = mongoose.model('code', codeSchema );

exports.codeModel = codeModel;