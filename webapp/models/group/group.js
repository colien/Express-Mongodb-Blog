var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
	id : String,
	group_name: String,//分组名
	username: String,//
	remark : String,
	create_time: String
})
//创建索引
groupSchema.index({id: 1});

var Group = mongoose.model('Group', groupSchema);

module.exports = Group;