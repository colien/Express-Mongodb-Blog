var path = require("path");
var ejs = require("ejs");
var express = require("express");
var app = express();
var log4js = require("log4js");
var router = require("./router/index.js"); 
var session = require('express-session');

//socket.io 公式：
var http = require('http').Server(app);
var io = require('socket.io')(http);
//session 公式：
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
//log4js 公式：
log4js.configure({
	appenders: {
        ruleConsole: {type: 'console'},
        ruleFile: {
            type: 'dateFile',
            filename: 'logs/server-',
            pattern: 'yyyy-MM-dd.log',
            maxLogSize: 10 * 1000 * 1000,
            numBackups: 3,
            alwaysIncludePattern: true
        }
    },
    categories: {
        default: {appenders: ['ruleConsole', 'ruleFile'], level: 'info'}
    }
});
app.use(log4js.connectLogger(log4js.getLogger("cheese"), {level: log4js.levels.INFO}));


app.use(express.static("./public"));
app.use("/avatar",express.static("./avatar"));
app.engine('html', ejs.__express);
app.set('view engine', 'html');



//中间件
app.get("/pc/index",router.pcIndex);		//pc 端index 页面逻辑
app.get("/",router.showIndex);              //显示首页
app.get("/regist",router.showRegist);       //显示注册页面
app.post("/doregist",router.doRegist);      //执行注册，Ajax服务
app.get("/login",router.showLogin);         //显示登陆页面
app.post("/dologin",router.doLogin);        //执行注册，Ajax服务
app.get("/setavatar",router.showSetavatar); //设置头像页面
app.post("/dosetavatar",router.dosetavatar);//执行设置头像，Ajax服务
app.get("/cut",router.showcut);             //剪裁头像页面
app.post("/post",router.doPost);            //发表说说
app.get("/docut",router.docut);             //执行剪裁
app.get("/getAllShuoshuo",router.getAllShuoshuo);  //列出所有说说Ajax服务
app.get("/getuserinfo",router.getuserinfo);  //列出所有说说Ajax服务
app.get("/getshuoshuoamount",router.getshuoshuoamount);  //说说总数
app.get("/user/:user",router.showUser);  //显示用户所有说说
app.get("/post/:oid",router.showUser);  //显示用户所有说说
app.get("/userlist",router.showuserlist);  //显示所有用户列表
app.get("/loginout",function(req,res,next){
	req.session.login = "";
	req.session.username = "";
	res.redirect("/");
})

var alluser = [];
//确认登陆，检查此人是否有用户名，并且昵称不能重复
app.get("/check",function(req,res,next){
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
});
//聊天室
app.get("/chat",function(req,res,next){
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
})

io.on("connection",function(socket){
	socket.on("liaotian",function(msg){
		//把接收到的msg原样广播 
		io.emit("liaotian",msg);
	});
});

//监听
http.listen(3002,"localhost");
