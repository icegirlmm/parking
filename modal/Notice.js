var mongoose = require("../db/mongodb").mongoose;
var ObjectId = mongoose.Schema.Types.ObjectId;
var NoticeSchema = new mongoose.Schema({
    issueuserId: ObjectId,
    issueaddress: String,
    issuelatitude: Number,
    issuelongitude: Number,
    issuenickName:String,
    issueavatarUrl:String,
    parkname: String,
    parktel: String,
    parkprice: Number,
    parkdec:String,
    date: { type: Date, default: Date.now},
    isPublish: { type: Boolean, default: true},//发布状态 true为发布中
    status: {type: Number,default: 0} //type为0时:0表示未接单，1表示接单;type为1时:表示收到几人预定
});

var NoticeModel = mongoose.model('notice', NoticeSchema);

exports.NoticeModel = NoticeModel;