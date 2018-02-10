var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/att');
mongoose.Promise = global.Promise;
var cardSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }, 
    customerId:  {
        type: String
    },
    cardDetails:
    [{
        cardnumber:
        {
            type:String
        },
        expMonth:
        {
            type:String
        },
        expYear:
        {
            type:String
        }
    }]
},
{
    timestamps: { createdAt: 'created_at' ,updatedAt:'updated_at'}
});

var card = mongoose.model('carddetails', cardSchema);

module.exports = card;