var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/att');
mongoose.Promise = global.Promise;
var AdminSchema = mongoose.Schema({
    email:  {
        type: String,
        unique:true
    }, 
    password:  {
        type: String
    }, 
    usertype: {
        type: String
    },
    flag:{
        type:String
    }
});

var Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;