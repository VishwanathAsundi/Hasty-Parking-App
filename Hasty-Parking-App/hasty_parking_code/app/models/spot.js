var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/att');
mongoose.Promise = global.Promise;
var spot_schema= mongoose.Schema(
    {
        place_id:
        {
            type: mongoose.Schema.ObjectId,
            ref: 'add_space_schema'
        },
        spotStickerId:
        {
            type: String,
        }
           
    });

var spotSticker= mongoose.model('spotSticker', spot_schema);

module.exports = spotSticker;
