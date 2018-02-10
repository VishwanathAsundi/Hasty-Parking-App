//Users who have applied promocode and referal code
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var user_promo = mongoose.Schema({
	
	user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
	promo_code:
	{
		type: String
	},
	count:
	{
		type: String
	}
});

var user_promocode = mongoose.model('user_promocode', user_promo);
module.exports = user_promocode;