var mongoose  = require('mongoose');
var Schema = mongoose.Schema;

var friendsSchema = new Schema({
	id : String,
	username: String,//当前用户
	friend_id: String,
	relation_Type: String,//关系类型；0:好友，1:关注
	remark : String,
	create_time: String
})
//创建索引
friendsSchema.index({id: 1});

var Friends = mongoose.model('Friends', friendsSchema);

module.exports = Friends;