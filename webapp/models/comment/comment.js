var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
	id : String,
	username: String,
	record_id: String,
	content: String,
	comment_id : String,//评论对象
	parent_id :String,//父评论的id
	create_time: String
})
//创建索引
commentSchema.index({id: 1});

var Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment