var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/att');
mongoose.Promise = global.Promise;
var Userdetails = mongoose.Schema({
    email:  
    {
        type: String,
        unique:true
    }, 
    username:
    {
        type:String
    },
    gender:
    {
        type:String
    },
    image_path:
    {
        type: String
    },
    hotline_email_id:
    {
        type: String
    },
    hotline_phone_number:
    {
        type: String
    },
    password:  
    {
        type: String
    },
    phone_number:
    {
        type: String,
        unique:true
    },
    promo_code:
    {
        type : String 
    },
    otp:
    {
        type:String
    }, 
    firstname: 
    {
        type: String
    }, 
    lastname: 
    {
        type: String
    },
    device_token:
    {
        type: String
    },
    device_type:
    {
        type: String
    },
    status:
    {
        type:String
    },
    f_id:
    {
        type:String,
	default:null
    },
    g_id:
    {
        type:String,
       default:null
    },
    token:
    {
        type:String,
	unique: true
    },
    ref_code:
    {
        type: String,
        unique: true
    },
    count_ref:
    {
        type:String
    },
    wallet:
    {
        type:String
    },
    violations:{
        type: Number
    }
},
{
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});
var User = mongoose.model('user', Userdetails);



module.exports = User;
