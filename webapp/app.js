var path = require("path");
var ejs = require("ejs");
var express = require("express");
var app = express();
var log4js = require("log4js");
var router = require("./router/index.js");
var session = require('express-session');
var cookieParser = require('cookie-parser');
app.use(cookieParser());
var http = require('http').Server(app);
var db = require("./mongodb/db.js");

app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.headers.origin || '*');
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  	res.header("Access-Control-Allow-Credentials", true); //可以带cookies
	res.header("X-Powered-By", '3.2.1')
	if (req.method == 'OPTIONS') {
	  	res.send(200);
	} else {
	    next();
	}
});

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

router.dispense(app);

//监听
http.listen(3002,"localhost");
