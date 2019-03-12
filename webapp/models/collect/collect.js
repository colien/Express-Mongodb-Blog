var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var collectSchema = new Schema({
	id : String,
	blog_id: String,
	username: String,
	record_Type: String,//1:点赞，2:收藏
	remark : String,
	create_time: String
})
//创建索引
collectSchema.index({id: 1});

var Collect = mongoose.model('Collect', collectSchema);

module.exports = Collect;