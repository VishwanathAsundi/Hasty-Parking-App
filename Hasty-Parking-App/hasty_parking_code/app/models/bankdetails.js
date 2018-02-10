var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/att');
mongoose.Promise = global.Promise;
var bank_details = mongoose.Schema(
{
    user_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	},
    positionAppliedFor:
    {
        type:String
    },
    country:
    {
        type:String
    },
    routing_number:
    {
        type:String
    },
    account_number:
    {
        type:String
    }
},
{
    timestamps: { createdAt: 'created_at' ,updatedAt:'updated_at'}
});    
var bank_dtls_export = mongoose.model('bankdetails', bank_details);
module.exports = bank_dtls_export;