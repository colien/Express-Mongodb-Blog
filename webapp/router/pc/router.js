/**
/**
 * Created by Danny on 2015/9/26 15:39.
 */
var formidable = require("formidable");
var path = require("path");
var fs = require("fs");
var db = require("../models/db.js");
var md5 = require("../models/md5.js");
//var gm = require("gm");

exports.pcIndex = function (req, res, next) {
	res.render("pc/index", {
            "active": "ȫ������" 
    });
}

//��ҳ
exports.showIndex = function (req, res, next) {

	console.log("/to index.html");
    //�������ݿ⣬���Ҵ��˵�ͷ��
    if (req.session.login == "1") {
        //�����½��
        var username = req.session.username;
        var login = true;
    } else {
        //û�е�½
        var username = "";  //�ƶ�һ�����û���
        var login = false;
    }
    //�Ѿ���½�ˣ���ô��Ҫ�������ݿ⣬���½����˵�ͷ��
    db.find("users", {username: username}, function (err, result) {
        if (result.length == 0) {
            var avatar = "moren.jpg";
        } else {
            var avatar = result[0].avatar;
        }
        res.render("pc/index", {
            "login": login,
            "username": username,
            "active": "ȫ������",
            "avatar": avatar    //��¼�˵�ͷ��
        });
    });
};

//ע��ҳ��
exports.showRegist = function (req, res, next) {
    res.render("regist", {
        "login": req.session.login == "1" ? true : false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active": "ע��"
    });
};

//ע��ҵ��
exports.doRegist = function (req, res, next) {
    //�õ��û���д�Ķ���
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //�õ���֮����������
        var username = fields.username;
        var password = fields.password;

        //console.log(username,password);
        //��ѯ���ݿ����ǲ����������
        db.find("users", {"username": username}, function (err, result) {
            if (err) {
                res.send("-3"); //����������
                return;
            }
            if (result.length != 0) {
                res.send("-1"); //��ռ��
                return;
            }
            //û����ͬ���ˣ��Ϳ���ִ�н������Ĵ����ˣ�
            //����md5����
            password = md5(md5(password) + "����");

            //���ڿ���֤�����û���û�б�ռ��
            db.insertOne("users", {
                "username": username,
                "password": password,
                "avatar": "moren.jpg"
            }, function (err, result) {
                if (err) {
                    res.send("-3"); //����������
                    return;
                }
                req.session.login = "1";
                req.session.username = username;

                res.send("1"); //ע��ɹ���д��session
            })
        });
    });
};

//��ʾ��½ҳ��
exports.showLogin = function (req, res, next) {
    res.render("login", {
        "login": req.session.login == "1" ? true : false,
        "username": req.session.login == "1" ? req.session.username : "",
        "active": "��½"
    });
};

//��½ҳ���ִ��
exports.doLogin = function (req, res, next) {
    //�õ��û���
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //�õ���֮����������
        var username = fields.username;
        var password = fields.password;
        var jiamihou = md5(md5(password) + "����");
        //��ѯ���ݿ⣬������û�и������
        db.find("users", {"username": username}, function (err, result) {
            if (err) {
                res.send({code:-5});
                return;
            }
            //û�������
            if (result.length == 0) {
                res.send({code:-1}); //�û���������
                return;
            }
            //�еĻ�����һ����������˵������Ƿ�ƥ��
            if (jiamihou == result[0].password) {
                req.session.login = "1";
                req.session.username = username;
                res.send({code:1});  //��½�ɹ�
                return;
            } else {
                res.send({code:-2});  //�������
                return;
            }
        });
    });
};

//����ͷ��ҳ�棬���뱣֤��ʱ�ǵ�½״̬
exports.showSetavatar = function (req, res, next) {
    //���뱣֤��½
    if (req.session.login != "1") {
        res.end("�Ƿ����룬���ҳ��Ҫ���½��");
        return;
    }
    res.render("setavatar", {
        "login": true,
        "username": req.session.username || "С����",
        "active": "���ø�������"
    });
};

//����ͷ��
exports.dosetavatar = function (req, res, next) {
    //���뱣֤��½
    if (req.session.login != "1") {
        res.end("�Ƿ����룬���ҳ��Ҫ���½��");
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
                res.send("ʧ��");
                return;
            }
            req.session.avatar = req.session.username + ".jpg";
            //��ת���е�ҵ��
            res.redirect("/cut");
        });
    });
}

//��ʾ��ͼҳ��
exports.showcut = function (req, res) {
    //���뱣֤��½
    if (req.session.login != "1") {
        res.end("�Ƿ����룬���ҳ��Ҫ���½��");
        return;
    }
    res.render("cut", {
        avatar: req.session.avatar
    })
};

//ִ����ͼ
exports.docut = function (req, res, next) {
	console.log("��ʼ��ͼ");
    //���뱣֤��½
    if (req.session.login != "1") {
        res.end("�Ƿ����룬���ҳ��Ҫ���½��");
        return;
    }
    //���ҳ����ռ���GET�������
    //w��h��x��y
    var filename = req.session.avatar;
    var w = req.query.w;
    var h = req.query.h;
    var x = req.query.x;
    var y = req.query.y;

    /*gm("F:\\NodeBlog\\avatar\\" + filename)
        .crop(w, h, x, y)
        .resize(100, 100, "!")
        .write("F:\\NodeBlog\\avatar\\" + filename, function (err) {//"./avatar/" + filename
			console.log("��ͼ���"+err);
            if (err) {
                res.send("-1");
                return;
            }
            //�������ݿ⵱ǰ�û���avatar���ֵ
            db.updateMany("users", {"username": req.session.username}, {
                $set: {"avatar": req.session.avatar}
            }, function (err, results) {
                res.send("1");
            });
        });*/
}


//����˵˵
exports.doPost = function (req, res, next) {
    //���뱣֤��½
    if (req.session.login != "1") {
        res.end("�Ƿ����룬���ҳ��Ҫ���½��");
        return;
    }
    //�û���
    var username = req.session.username;

    //�õ��û���д�Ķ���
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //�õ���֮����������
        var content = fields.content;

        //���ڿ���֤�����û���û�б�ռ��
        db.insertOne("posts", {
            "username": username,
            "datetime": new Date(),
            "content": content
        }, function (err, result) {
            if (err) {
                res.send("-3"); //����������
                return;
            }
            res.send("1"); //ע��ɹ�
        });
    });
};


//�г�����˵˵���з�ҳ����
exports.getAllShuoshuo = function(req,res,next){
    //���ҳ�����һ��������ҳ��
    var page = req.query.page;
    db.find("posts",{},{"pageamount":20,"page":page,"sort":{"datetime":-1}},function(err,result){
        res.json(result);
    });
};


//�г�ĳ���û�����Ϣ
exports.getuserinfo = function(req,res,next){
    //���ҳ�����һ��������ҳ��
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

//˵˵����
exports.getshuoshuoamount = function(req,res,next){
    db.getAllCount("posts",function(count){
        res.send(count.toString());
    });
};

//��ʾĳһ���û��ĸ�����ҳ
exports.showUser = function(req,res,next){
    var user = req.params["user"];
    db.find("posts",{"username":user},function(err,result){
       db.find("users",{"username":user},function(err,result2){
           res.render("user",{
               "login": req.session.login == "1" ? true : false,
               "username": req.session.login == "1" ? req.session.username : "",
               "user" : user,
               "active" : "�ҵĲ���",
               "cirenshuoshuo" : result,
               "cirentouxiang" : result2[0].avatar
           });
       });
    });

}

//��ʾ����ע���û�
exports.showuserlist = function(req,res,next){
    db.find("users",{},function(err,result){
        res.render("userlist",{
            "login": req.session.login == "1" ? true : false,
            "username": req.session.login == "1" ? req.session.username : "",
            "active" : "�����б�",
            "suoyouchengyuan" : result
        });
    });
}
