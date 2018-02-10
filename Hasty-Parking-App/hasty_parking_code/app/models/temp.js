var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/att');
mongoose.Promise = global.Promise;
var temp = mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }, 
    startTime:{
        type:String
    },
    endTime:{
        type:String
    },
    startDate:{
        type:String
    },
    endDate:{
        type:String
    }
});

var temp_export = mongoose.model('temp', temp);

module.exports = temp_export;
