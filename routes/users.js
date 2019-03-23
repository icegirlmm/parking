var express = require("express");
var https = require("https");
var iconv = require("iconv-lite");
var WXBizDataCrypt = require('./WXBizDataCrypt');
var router = express.Router();
var UserModel = require("../modal/User").UserModel;
const RestResult = require('./RestResult');
var nodemailer = require('nodemailer');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

//保存用户初次登录，param为code,获取openid
router.post('/login', function (req, res, next) {
    var resData = new RestResult();
    var param = req.body;
    var wxcode = param.wxcode;
    // var userInfo = param.userInfo;
    // var encryptedData = param.encryptedData;
    // var iv = param.iv;
    if(!wxcode){
        res.status(400).end();
        return
    }
    var session_key = null;
    var openid = null;
    var APPID = "wxb02f76269721e7b8"; //换成你的微信小程序对应的APPID SECRET
    var SECRET = "ab06fd83a98c3fe52d4418c143dfdfe5";
    var url = "https://api.weixin.qq.com/sns/jscode2session?appid=" + APPID + "&secret=" + SECRET + "&js_code=" + wxcode + "&grant_type=authorization_code";
    https.get(url, function (response) {
        var datas = [];
        var size = 0;
        response.on('data', function (data) {
            datas.push(data);
            size += data.length;
            //process.stdout.write(data);
        });
        response.on("end", function () {
            var buff = Buffer.concat(datas, size);
            var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring

            session_key = JSON.parse(result).session_key;
            openid = JSON.parse(result).openid;

            UserModel.findOne({openId: openid}, function (err, doc) {
                if (err) {
                    resData.code = 5;
                    resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                    res.send(resData);
                    return;
                }
                if (doc) {
                    if(doc.session_key != session_key){
                        UserModel.update({session_key: session_key},function(err,data){
                            if(err){
                                console.log(err)
                            }else{
                                console.log('update')   
                            }
                        })
                    }
                    resData = {
                        userId: doc._id,
                        session: doc.session_key,
                        totalmoney:doc.totalmoney,
                        userInfo:{
                            nickName:doc.nickName,
                            avatarUrl:doc.avatarUrl,
                        }
                    };
                    res.send(resData);
                   
                }
                else {
                    var userEntity;
                        userEntity = new UserModel({
                            openId: openid,
                            session_key: session_key
                        })
                    userEntity.save(function (err, doc) {
                        if (err) {
                            resData.code = 5;
                            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                            res.send(resData);
                        }
                        else {
                            resData = {
                                userId: doc._id,
                                session: session_key,
                                totalmoney:doc.totalmoney,
                                userInfo:{
                                    nickName:doc.nickName,
                                    avatarUrl:doc.avatarUrl,
                                }
                            };
                            res.send(resData);
                        }
                    });
                }
            });
        });
    }).on("error", function (err) {
        Logger.error(err.stack);
        callback.apply(null);
    });
});

//更新用户信息,param 为userInfo,userId
router.post('/addUserInfo', function (req, res, next) {
    var resData = new RestResult();
    var param = req.body;
    var userId = param.userId;
    var userInfo = param.userInfo;
    UserModel.update({_id: userId},
        {
            $set: {
                avatarUrl: userInfo.avatarUrl,
                nickName: userInfo.nickName,
                gender: userInfo.gender,
                city: userInfo.city,
                province: userInfo.province,
                country: userInfo.country,
                language: userInfo.language
            }
        },
        function (err, doc) {
            if (err) {
                resData.code = 5;
                resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                res.send(resData);
            }
            else {
                res.send('success');
            }
        }
    );
});


//展示用户个人信息
router.post('/display', function (req, res, next){
    var resData = new RestResult();  
    var param = req.body;
    var userId = param.userId;
    UserModel.findOne({_id: userId}, function (err, doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
            return;
        }
        if (doc) {
            console.log(doc)
            resData = {
                nickName:doc.nickName,
                telphone:doc.telphone,
                plate:doc.plate
            }
            res.send(resData);
        }


    })

})

//修改用户资料,param 为nickName,telphone,plate,userId
router.post('/updateUser', function (req, res, next) {
    var resData = new RestResult();
    var param = req.body;
    var userId = param.userId;
    var nickName = param.nickName;
    var telphone = param.telphone;
    var plate = param.plate;
    UserModel.update({_id: userId},
        {
            $set: {
                nickName: nickName,
                telphone: telphone,
                plate: plate
            }
        },
        function (err, doc) {
            if (err) {
                resData.code = 5;
                resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                res.send(resData);
            }
            else {
                resData.code = 0;
                resData.returnValue = "修改用户学校、校区成功。";
                res.send(resData);
            }
        }
    );
});

//发送反馈邮件
router.post('/sendEmailToMe',function (req,res,next) {
    var resData = new RestResult();
    var param = req.body;
    var content = param.content;
    console.log(content);
    var transporter = nodemailer.createTransport({
        service: 'qq',
        auth: {
            user: '2550546705@qq.com',
            pass: 'rvtcvevosjjfeagh'
        }
    });
    var mailOptions = {
        from: '2550546705@qq.com ', // sender address
        to: '158338402@qq.com',
        subject: '红领巾用户反馈',
        text: content
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            resData.code = 5;
            resData.errorReason = "提交失败";
            res.send(resData);
        }else{
            resData.code = 0;
            resData.returnValue = "提交成功！";
            res.send(resData);
        }
    });
});

module.exports = router;
