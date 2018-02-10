
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema      = mongoose.Schema;

var locationSchema = new Schema({
	location:{
		type:[Number],
		index:'2dsphere'
	},
	name: String,
	created: {
		type: Date,
		default: Date.now()
	},
	user_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	}
});

exports.model = mongoose.model('locationschema', locationSchema);