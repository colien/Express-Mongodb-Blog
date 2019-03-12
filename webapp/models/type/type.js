var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogTypeSchema = new Schema({
	id : String,
	type_name: String,
	username: String,
	create_time: String
})
//创建索引
blogTypeSchema.index({id: 1});

var Type = mongoose.model('Type', blogTypeSchema);

module.exports = Type;