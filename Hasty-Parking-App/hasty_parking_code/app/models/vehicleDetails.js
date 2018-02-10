var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/att');
mongoose.Promise = global.Promise;
var vehicle_dtls = mongoose.Schema(
{
    user_id: {
		type: mongoose.Schema.ObjectId,
		ref: 'User'
	},
    vehicleModel:
    {
        type:String
    },
    vehicleNumber:
    {
        type:String
    },
    vehicleInsuranceNumber:
    {
        type:String
    }
},
{
    timestamps: { createdAt: 'created_at' }
});    
var vehicle_dtls_export = mongoose.model('vehicledetails', vehicle_dtls);
module.exports = vehicle_dtls_export;