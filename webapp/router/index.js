/**
 * Created by Danny on 2015/9/26 15:39.
 */
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
//var db = require("../mongodb/db.js");
var Users = require('../models/users/users');
var Record = require('../models/record/record');
var Type = require('../models/type/type');
var Collect = require('../models/collect/collect');
var Comment = require('../models/comment/comment');
var Friends = require('../models/friends/friends');
var Group = require('../models/group/group');

var md5 = require("../models/md5.js");
var crypto = require("../models/crypto.js");
var utils = require("./utils.js");
//socket.io 公式：
var http = require('http');
var socketIo = require('socket.io');
var io = null;
var alluser = [];


exports.dispense = function(app){
    http = http.Server(app);
    io = socketIo(http);
    app.get("/",showIndex);                 //首页
    app.get("/login",showLogin);            //跳转到登录页
    app.post("/dologin",doLogin);           //登录请求
    app.get("/regist",showRegist);          //跳转到注册
    app.post("/doregist",doRegist);         //注册请求
    app.post("/doPush",pushBlog);         //获取用户信息
    app.get("/toPush",showPush);            //获取用户信息
    app.get("/getAllType",getAllType);      //获取所有博客类型
    app.post("/doType",doType);              //添加博客类型
    app.get("/getAllRecord",getAllRecord);      //获取所有博客
    app.get("/my-home",showMyHome);      //跳转到我的主页
    app.get("/getUserInfo",getUserInfo);      //获取当前用户的信息
    app.get("/getCurrUserBlog",getCurrUserBlog);      //获取当前用户的博客
    app.get("/blog-detail",blogDetail);      //跳转到博客详情页
    app.get("/getBlogDetail",getBlogDetail);      //获取这个博客的信息
    app.get("/getAllComments",getAllComments);      //获取这个博客的评论
    app.post("/doComment",doComment);      //评论博客
    app.get("/friend-list",showFriends);      //跳转到好友列表页
    app.get("/getAllFriend",getAllFriend);      //获取用户的所有好友
    app.post("/addFrient",addFrient);      //添加好友

    return ;
    
    
    
    
    app.get("/setavatar",showSetavatar);    //
    app.post("/dosetavatar",dosetavatar);   //
    app.get("/cut",showcut);                //
    app.post("/post",doPost);               //
    app.get("/docut",docut);                //
    app.get("/getAllShuoshuo",getAllShuoshuo);  //
    app.get("/getuserinfo",getuserinfo);    //
    app.get("/getshuoshuoamount",getshuoshuoamount);  //
    app.get("/user/:user",showUser);        //
    app.get("/post/:oid",showUser);         //
    app.get("/userlist",showuserlist);      //
    app.get("/loginout",loginout);          //
    app.get("/check",check);
    app.get("/chat",chat);
    createSocket(app);                      // 创建 socket 
}
// 创建 socket 
var createSocket = function(app){
    io.on("connection",function(socket){
        socket.on("liaotian",function(msg){
            //把接收到的msg原样广播 
            io.emit("liaotian",msg);
        });
    });
}

var addFrient = function (req, res, next) {
    if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var username = userInfo[0].username;
            var friend_id = fields.friend_id;
            var friendsModel = {
                id : md5(md5(username +""+ friend_id)),
                username: username,
                friend_id: friend_id,
                relation_Type: 0,//关系类型；0:好友，1:关注
                remark : "",
                create_time : new Date(),
            };
            Friends.find({"username": username,"friend_id":friend_id,"relation_Type": 0},function(err, result){
                if (err) {
                    res.send({code:2,msg:"添加好友失败！"});
                }else {
                    if(result.length>0){
                        res.send({code:3,msg:"好友已存在！"});
                    }else{
                        Friends.create(friendsModel,function(err, result){
                        if(err){
                            res.send({code:2,msg:"添加好友失败"});
                        }else{
                            res.send({code:0,msg:""});
                        }
                    });
                    }
                }
            })
            
        });
    } else {
        res.send({code:1,msg:"你未登录"});
    }
};

var getAllFriend = function (req, res, next) {
   if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        var username = userInfo[0].username;
        Friends.find({"username": username,"relation_Type":0},function(err, result){
            if (err) {
                res.send({code:2,msg:"获取当前用户的好友失败！"});
            }else {
                res.send({code:0,msg:"",extra:result});
            }
        })
    } else {
        res.send({code:1,msg:"你未登录"});
    }
};

//跳转到好友列表页
var showFriends = function (req, res, next) {
    var url = utils.agent(req);
    if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        res.render(url+"/friend-list", {});
    } else {
        res.redirect("/login");
    }
};

//评论
var doComment = function (req, res, next) {
    if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var username = userInfo[0].username;
            var record_id = fields.record_id;
            var content = fields.content;
            var comment_id = fields.comment_id;
            var parent_id = fields.parent_id;
            var commentModel = {
                id : md5(md5(username +""+ record_id+""+content+""+comment_id+""+parent_id)),
                username: username,
                record_id: record_id,
                content: content,
                comment_id : comment_id,
                parent_id : parent_id,
                create_time : new Date(),
            };
            Comment.create(commentModel,function(err, result){
                console.log(result);
                if(err){
                    res.send({code:2,msg:"注册失败"});
                }else{
                    res.send({code:0,msg:""});
                }
            });
        });
    } else {
        res.send({code:1,msg:"你未登录"});
    }
};

//跳转到博客详情页
var blogDetail = function (req, res, next) {
    var url = utils.agent(req);
    if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        res.render(url+"/blog-detail", {});
    } else {
        res.redirect("/login");
    }
};
//获取该博客的所有评论
var getAllComments = function (req, res, next) {
   if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        var username = userInfo[0].username;
        var blogId = req.query.blogId;
        Comment.find({"record_id": blogId},function(err, result){
            if (err) {
                res.send({code:2,msg:"获取当前用户的博客信息失败"});
            }else {
                res.send({code:0,msg:"",extra:result});
            }
        })
    } else {
        res.send({code:1,msg:"你未登录"});
    }
};
//获取博客详情
var getBlogDetail = function (req, res, next) {
   if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        var username = userInfo[0].username;
        var blogId = req.query.blogId;
        Record.find({"id": blogId},function(err, result){
            if (err) {
                res.send({code:2,msg:"获取当前用户的博客信息失败"});
            }else {
                res.send({code:0,msg:"",extra:result});
            }
        })
    } else {
        res.send({code:1,msg:"你未登录"});
    }
};

//跳转到我的主页
var showMyHome = function (req, res, next) {
    var url = utils.agent(req);
    if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        res.render(url+"/my-home", {});
    } else {
        res.redirect("/login");
    }
};
//获取当前用户的blog
var getCurrUserBlog = function (req, res, next) {
   if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        var username = userInfo[0].username;
        var pageSize = req.query.pageSize || 20;
        var currentPage = req.query.currentPage || 1;
        var skipnum = (currentPage - 1) * pageSize;   //跳过数
        var sort = {"datetime":-1};
        Record.find({"username": userInfo[0].username}).skip(skipnum).limit(pageSize).sort(sort).exec(function (err, result) {
            if (err) {
                res.send({code:2,msg:"获取当前用户的博客信息失败"});
            }else {
                res.send({code:0,msg:"",extra:result});
            }
        })
    } else {
        res.send({code:1,msg:"你未登录"});
    }
};

// 获取用户信息
var getUserInfo = function (req, res, next) {
   if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }

        Users.find({"username": userInfo[0].username},function(err, result){
            if(err){
                res.send({code:2,msg:"获取用户信息失败"});
            }else{
                res.send({code:0,msg:"",extra:result});
            }
        });
    } else {
        res.send({code:1,msg:"你未登录"});
    }
};
// to index
var showIndex = function (req, res, next) {
    var url = utils.agent(req);
    res.render(url+"/index", {});
    return;
    var result = crypto.aesEncrypt("req.cookies.tgc");
    console.log(result);
    result = crypto.aesDecrypt(result);
    console.log(result);
    res.send({"aaa":1});
};
//to login
var showLogin = function (req, res, next) {
    var url = utils.agent(req);
    res.render(url+"/login", {});
};
//to regist
var showRegist = function (req, res, next) {
    var url = utils.agent(req);
    res.render(url+"/regist", {});
};
// execute login
var doLogin = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var username = fields.username;
        var password = fields.password;
        console.log("username:"+username+"    password:"+password);
        //先查看数据库有没有这个用户
        Users.find({"username": username,"password":password},function(err, result){
            console.log("login:"+result);
            if(result.length){
                var token = crypto.aesEncrypt(JSON.stringify(result));
                res.send({code:0,msg:"",token:token});         
            }else{
                res.send({code:1,msg:"登录失败"});
            }
        });
    });
};

//execute regist
var doRegist = function (req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var username = fields.username;
        var password = fields.password;
        //removeUser(username);
        Users.find({"username": username},function(err, result){
            console.log(result);
            if(result.length > 0){
                res.send({code:1,msg:"该账号已被注册"});  
                return ;
            }else{
                var userModel = {
                    id : md5(md5(username +""+ password)),
                    username : username,
                    password : password,
                    nickname : username,
                    create_time : new Date(),
                    mail : "",
                    status : 0, 
                    description : "",
                    user_img : "moren.jpg"
                };
                Users.create(userModel,function(err, result){
                    console.log(result);
                    if(result){
                        var token = crypto.aesEncrypt(JSON.stringify(result));
                        res.send({code:0,msg:"",token:token});
                        return;
                    }else{
                        res.send({code:2,msg:"注册失败"});
                    }
                });
            }
        });
    });
};

var removeUser = function (username){
    Users.remove({username:username}, function(err, res){
        if (err) {
            console.log("Error:" + err);
        }
        else {
            console.log("Res:" + res);
        }
    })
}
var showPush = function (req, res, next) {
    var url = utils.agent(req);
    res.render(url+"/push", {});
};
var getAllType = function (req, res, next) {
    if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        Type.find({"username": userInfo[0].username},function(err, result){
            if(err){
                res.send({code:2,msg:"获取博客类型失败"});
            }else{
                res.send({code:0,msg:"",extra:result});
            }
        });
    } else {
        res.send({code:1,msg:"你未登录"});
    }
};
//添加博客类型
var doType = function (req, res, next) {
    if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var type_name = fields.type_name;
            var username = userInfo[0].username;
            var typeModel = {
                id:md5(username +""+ type_name),
                type_name : type_name,
                username : username,
                create_time : new Date()
            }
            Type.create(typeModel,function(err, result){
                if(err){
                    res.send({code:2,msg:"添加博客类型失败"});
                }else{
                    res.send({code:0,msg:"",extra:result});
                }
            });
        })
    } else {
        res.send({code:1,msg:"你未登录"});
    }
};
//发布博客
var pushBlog = function(req, res, next){
    if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        console.log(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var title = fields.title;
            var tyle_id = fields.tyle_id;
            var content = fields.content;
            var privacy = fields.privacy;
            var username = userInfo[0].username;
            var recordModel = {
                id : md5(title +""+ tyle_id+""+username+""+content),
                title: title,
                tyle_id: tyle_id,
                content: content,
                username:username,
                remark : "",
                privacy: privacy,
                create_time: new Date()            
            };
            console.log(recordModel);
            Record.create(recordModel,function(err, result){
                if(err){
                    res.send({code:2,msg:"发布失败"});
                    return;
                }else{
                    res.send({code:0,msg:""});
                }
            });
        })
    } else {
        res.send({code:1,msg:"你未登录"});
    }
}

var getAllRecord = function (req, res, next) {
    if (req.cookies.token) {
        var userInfo = crypto.aesDecrypt(req.cookies.token);
        userInfo = JSON.parse(userInfo);
        if(userInfo[0].username){
            res.cookie('token', req.cookies.token, {maxAge: 12 * 60 * 1000});
        }
        Record.find({},function(err, result){
            if(err){
                res.send({code:2,msg:"获取博客列表失败"});
            }else{
                res.send({code:0,msg:"",extra:result});
            }
        });
    } else {
        res.send({code:1,msg:"你未登录"});
    }
};

// get login user info
var getLoginUser = function(req, res, next){
    if (req.cookies.tgc) {
        var userInfo = crypto.aesDecrypt(req.cookies.tgc);
        res.cookie('tgc', req.cookies.tgc, {maxAge: 12 * 60 * 1000});
        res.send(userInfo);
    } else {
        res.send("{}");
    }
}
//确认登陆，检查此人是否有用户名，并且昵称不能重复
var check = function(req,res,next){
    var username = req.query.username;
    if(!username){
        res.send("必须填写用户名");
        return;
    }
    if(alluser.indexOf(username) != -1){
        res.send("用户名已经被占用");
        return;
    }
    alluser.push(username);
    //付给session
    req.session.username = username;
    res.redirect("/chat");
}
//聊天室
var chat = function(req,res,next){
    //这个页面必须保证有用户名了，
    if(!req.session.username){
        res.redirect("/");
        return;
    }
    res.render("chat",{
        "login": req.session.login == "1" ? true : false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active": "登陆"
    });
}








//ÉèÖÃÍ·ÏñÒ³Ãæ£¬±ØÐë±£Ö¤´ËÊ±ÊÇµÇÂ½×´Ì¬
var showSetavatar = function (req, res, next) {
    //±ØÐë±£Ö¤µÇÂ½
    if (req.session.login != "1") {
        res.end("·Ç·¨´³Èë£¬Õâ¸öÒ³ÃæÒªÇóµÇÂ½£¡");
        return;
    }
    res.render("setavatar", {
        "login": true,
        "username": req.session.username || "Ð¡»¨»¨",
        "active": "ÉèÖÃ¸öÈË×ÊÁÏ"
    });
};

//ÉèÖÃÍ·Ïñ
var dosetavatar = function (req, res, next) {
    //±ØÐë±£Ö¤µÇÂ½
    if (req.session.login != "1") {
        res.end("·Ç·¨´³Èë£¬Õâ¸öÒ³ÃæÒªÇóµÇÂ½£¡");
        return;
    }

    var form = new formidable.IncomingForm();
    form.uploadDir = path.normalize(__dirname + "/../avatar");
    form.parse(req, function (err, fields, files) {
        console.log(files);
        var oldpath = files.touxiang.path;
        var newpath = path.normalize(__dirname + "/../avatar") + "/" + req.session.username + ".jpg";
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                res.send("Ê§°Ü");
                return;
            }
            req.session.avatar = req.session.username + ".jpg";
            //Ìø×ªµ½ÇÐµÄÒµÎñ
            res.redirect("/cut");
        });
    });
}

//ÏÔÊ¾ÇÐÍ¼Ò³Ãæ
var showcut = function (req, res) {
    //±ØÐë±£Ö¤µÇÂ½
    if (req.session.login != "1") {
        res.end("·Ç·¨´³Èë£¬Õâ¸öÒ³ÃæÒªÇóµÇÂ½£¡");
        return;
    }
    res.render("cut", {
        avatar: req.session.avatar
    })
};

//Ö´ÐÐÇÐÍ¼
var docut = function (req, res, next) {
	console.log("¿ªÊ¼ÇÐÍ¼");
    //±ØÐë±£Ö¤µÇÂ½
    if (req.session.login != "1") {
        res.end("·Ç·¨´³Èë£¬Õâ¸öÒ³ÃæÒªÇóµÇÂ½£¡");
        return;
    }
    //Õâ¸öÒ³Ãæ½ÓÊÕ¼¸¸öGETÇëÇó²ÎÊý
    //w¡¢h¡¢x¡¢y
    var filename = req.session.avatar;
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.x;
    var y = req.query.y;

    /*gm("F:\\NodeBlog\\avatar\\" + filename)
        .crop(w, h, x, y)
        .resize(100, 100, "!")
        .write("F:\\NodeBlog\\avatar\\" + filename, function (err) {//"./avatar/" + filename
			console.log("ÇÐÍ¼Íê³É"+err);
            if (err) {
                res.send("-1");
                return;
            }
            //¸ü¸ÄÊý¾Ý¿âµ±Ç°ÓÃ»§µÄavatarÕâ¸öÖµ
            db.updateMany("users", {"username": req.session.username}, {
                $set: {"avatar": req.session.avatar}
            }, function (err, results) {
                res.send("1");
            });
        });*/
}


//·¢±íËµËµ
var doPost = function (req, res, next) {
    //±ØÐë±£Ö¤µÇÂ½
    if (req.session.login != "1") {
        res.end("·Ç·¨´³Èë£¬Õâ¸öÒ³ÃæÒªÇóµÇÂ½£¡");
        return;
    }
    //ÓÃ»§Ãû
    var username = req.session.username;

    //µÃµ½ÓÃ»§ÌîÐ´µÄ¶«Î÷
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //µÃµ½±íµ¥Ö®ºó×öµÄÊÂÇé
        var content = fields.content;

        //ÏÖÔÚ¿ÉÒÔÖ¤Ã÷£¬ÓÃ»§ÃûÃ»ÓÐ±»Õ¼ÓÃ
        db.insertOne("posts", {
            "username": username,
            "datetime": new Date(),
            "content": content
        }, function (err, result) {
            if (err) {
                res.send("-3"); //·þÎñÆ÷´íÎó
                return;
            }
            res.send("1"); //×¢²á³É¹¦
        });
    });
};


//ÁÐ³öËùÓÐËµËµ£¬ÓÐ·ÖÒ³¹¦ÄÜ
var getAllShuoshuo = function(req,res,next){
    //Õâ¸öÒ³Ãæ½ÓÊÕÒ»¸ö²ÎÊý£¬Ò³Ãæ
    var page = req.query.page;
    db.find("posts",{},{"pageamount":20,"page":page,"sort":{"datetime":-1}},function(err,result){
        res.json(result);
    });
};


//ÁÐ³öÄ³¸öÓÃ»§µÄÐÅÏ¢
var getuserinfo = function(req,res,next){
    //Õâ¸öÒ³Ãæ½ÓÊÕÒ»¸ö²ÎÊý£¬Ò³Ãæ
    var username = req.query.username;
    db.find("users",{"username":username},function(err,result){
        if(err || result.length == 0){
            res.json("");
            return;
        }
        var obj = {
            "username" : result[0].username,
            "avatar" : result[0].avatar,
            "_id" : result[0]._id,
        };
        res.json(obj);
    });
};

//ËµËµ×ÜÊý
var getshuoshuoamount = function(req,res,next){
    db.getAllCount("posts",function(count){
        res.send(count.toString());
    });
};

//ÏÔÊ¾Ä³Ò»¸öÓÃ»§µÄ¸öÈËÖ÷Ò³
var showUser = function(req,res,next){
    var user = req.params["user"];
    db.find("posts",{"username":user},function(err,result){
       db.find("users",{"username":user},function(err,result2){
           res.render("user",{
               "login": req.session.login == "1" ? true : false,
               "username": req.session.login == "1" ? req.session.username : "",
               "user" : user,
               "active" : "ÎÒµÄ²©¿Í",
               "cirenshuoshuo" : result,
               "cirentouxiang" : result2[0].avatar
           });
       });
    });

}

//ÏÔÊ¾ËùÓÐ×¢²áÓÃ»§
var showuserlist = function(req,res,next){
    db.find("users",{},function(err,result){
        res.render("userlist",{
            "login": req.session.login == "1" ? true : false,
            "username": req.session.login == "1" ? req.session.username : "",
            "active" : "ºÃÓÑÁÐ±í",
            "suoyouchengyuan" : result
        });
    });
}

var loginout = function(req,res,next){
    req.session.login = "";
    req.session.username = "";
    res.redirect("/");
}
