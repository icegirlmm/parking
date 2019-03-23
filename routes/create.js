var express = require("express");
var https = require("https");
var iconv = require("iconv-lite");
var router = express.Router();
var PasswordModel = require("../modal/Password").PasswordModel;
var codeModel = require("../modal/Password").codeModel;
const RestResult = require('./RestResult');
var querystring = require('querystring');
var fs = require('fs');
var path = require('path');
const stream = require('stream');



//更新用户信息,param 为userInfo,userId
router.post('/password', function (req, res, next) {
    var resData = new RestResult();
    var param = req.body;
    var userId = param.userId;
    var password = param.password;
    PasswordModel.findOne({
        userId: userId
    }, function (err, doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
            return;
        }
        if (doc) {
            PasswordModel.update({
                    userId: userId
                }, {
                    $set: {
                        userId: userId,
                        password: password,
                    }
                },
                function (err, doc) {
                    if (err) {
                        resData.code = 5;
                        resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                        res.send(resData);
                    } else {
                        res.send('success');
                    }
                }
            );
        } else {
            var userEntity;
            userEntity = new PasswordModel({
                userId: userId,
                password: password
            })
            userEntity.save(function (err, doc) {
                if (err) {
                    resData.code = 5;
                    resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
                    res.send(resData);
                } else {
                    res.send('success');
                }
            });
        }
    });
});

//查询该用户userid是否设置了密码
router.post('/searchpassword', function (req, res, next) {
    var resData = new RestResult();
    var param = req.body;
    var userId = param.userId;
    PasswordModel.findOne({
        userId: userId
    }, function (err, doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
            return;
        }
        if (doc) {
            resData.code = 0;
            console.log(doc)
            res.send(resData);
        } else {
            resData.code = 2;
            resData.password = false
            res.send(resData);
        }
    });
});
//确认密码
router.post('/surepassword', function (req, res, next) {
    var resData = new RestResult();
    var param = req.body;
    var userId = param.userId;
    var password = param.password;
    PasswordModel.findOne({
        userId: userId
    }, function (err, doc) {
        if (err) {
            resData.code = 5;
            resData.errorReason = RestResult.SERVER_EXCEPTION_ERROR_DESCRIPTION;
            res.send(resData);
            return;
        }
        if (doc) {
            console.log(doc)
            if (doc.password == password) {
                resData.code = 0;
                resData.surepassword = true
                res.send(resData);
            } else {
                resData.code = 1;
                resData.surepassword = false
                res.send(resData);
            }
        }
    });
});

//请求分享二维码
//   router.post('/codeimg', function (req, res, next) {
//     var resData = new RestResult();
//     var param = req.body;
//     var session = param.session;
//     var userId = param.userId;

//   });

/* GET users listing. */
router.post('/codeimg', function (req, res, next) {
    var APPID = "wxb02f76269721e7b8"; //换成你的微信小程序对应的APPID SECRET
    var SECRET = "ab06fd83a98c3fe52d4418c143dfdfe5";
    new Promise(function (resolve, reject) {

        var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + APPID + "&secret=" + SECRET
        https.get(url, function (response) {
            var buffer = [],
                result = "";
            // 监听 data 事件
            response.on("data", function (data) {
                buffer.push(data);
            });
            response.on("end", function () {
                var body = Buffer.concat(buffer);
                var result = iconv.decode(body, "utf8");
                var access_token = JSON.parse(result).access_token;
                // 

                const post_data = JSON.stringify({
                    path: 'paths/index/index',
                    width: 400
                });

                const url = 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=' + access_token
                const parsedUrl = require('url').parse(url);
                const options = Object.assign(parsedUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': post_data.length,
                    }
                });

                let imgreq = https.request(options, (req,res) => {
                    let resData = '';
                    req.setEncoding("binary");
                    req.on('data', data => {
                        resData += data;
                        // console.log(resData)
                    });
                    req.on('end', () => {
                        // 微信api可能返回json，也可能返回图片二进制流。这里要做个判断。
                        // errcode:42001 是指 token 过期了，需要重新获取。40001 是指token格式不对或很久之前的token。
                        const contentType = req.headers['content-type'];
                        if (!contentType.includes('image')) {
                            console.log('获取小程序码图片失败，微信api返回的json为：')
                            console.log(JSON.parse(resData))
                            return resolve(null);
                        }
                        const imgBuffer = Buffer.from(resData, 'binary');
                        const imgpath = path.resolve('./public/image/rqcode.jpg')
                        console.log(imgBuffer)
                        fs.writeFile(imgpath,imgBuffer,(err)=>{
                            if(err){
                                console.log(err)
                            }else{
                                console.log("文件保存成功")
                            }
                        })
                       
                        resolve({imgsrc:"/image/rqcode.jpg"});
                        
                    });
                })
                imgreq.on('error', (e) => {
                    console.log('获取微信小程序图片失败')
                    console.error(e);
                });
                imgreq.write(post_data); // 写入post请求的请求主体。
                imgreq.end();
               
            })

        }).on('error', function (err) {
            reject(err);
        });
    }).then(function (resolve) {
        // let data = resolve.imgBuffer.data
        res.send(resolve);
    });

});




// const post_data = JSON.stringify({
//     path : 'paths/index/index',
//     width: 200,
//   });
// const url = 'https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode&access_token=' + access_token
// const parsedUrl = require('url').parse(url);
// const options = Object.assign(parsedUrl, {
//     method: 'POST',
//     headers: {   
//         'Content-Type': 'application/json',
//         'Content-Length': post_data.length,
//       } 
// });
// https.request(options, function (responsed) {
//     var buffer = [],
//         result = "";
//     // 监听 data 事件
//     let resData = '';
//     responsed.setEncoding("binary");
//     responsed.on('data', data => {
//         resData += data;
//     });

//     response.on("end", function () {
//         var body = Buffer.concat(buffer);
//         var result = iconv.decode(body, "utf8");
//         console.log(result)
//         res.send("ssss")
//     })
// }).on('error', function (err) {
//     reject("错误" + err);
// });




module.exports = router;