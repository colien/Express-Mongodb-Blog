var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogRecordSchema = new Schema({
	id : String,
	title: String,
	tyle_id: String,
	content: String,
	username:String,
	remark : String,
	privacy: {type: Number, default: 0},//0:公开，1:私密
	create_time: String
})
//创建索引
blogRecordSchema.index({id: 1});

var Record = mongoose.model('Record', blogRecordSchema);

module.exports = Record;