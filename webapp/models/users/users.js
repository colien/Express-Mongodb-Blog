var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
	id : String,
	username: String,
	password: String,
	nickname: String,
	create_time: String,
	mail: String,
	status: {type: Number, default: 0},  //0:激活的用户、 1: 查封的账号
	description: String,
	user_img: String,
})
//创建索引
usersSchema.index({id: 1});

var Users = mongoose.model('Users', usersSchema);

module.exports = Users;
