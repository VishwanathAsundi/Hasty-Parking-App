//To store promoCode
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var promoSchema = mongoose.Schema({
	
	promo_code:{
		type: String
		},
	limit:{
			type: String
		},
	expiry:{
			type: String
		},
	discount_per:{
		type: String
	},
	discount_val:{
		type: String
	}
});

var promoCode = mongoose.model('promocode', promoSchema);
module.exports = promoCode;