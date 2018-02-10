var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/att');
mongoose.Promise = global.Promise;
var order_schema= mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        place_id:
        {
            type: mongoose.Schema.ObjectId,
            ref: 'add_space_schema'
        },
        spotStickerId:
        {
            type: String,
            ref: 'spotSticker'
        },
        start_timestamp:
        {
            type:Date
        },
        end_timestamp:
        {
            type:Date
        },
        booktime:
            {
                type:String
            },
        Amount:
            {
                type:String
            },
            ownerPaidStatus:
            {
                type:Boolean
            },
        walletDiscountAmount:
            {
              type:Number
             },
             orderStatus:
            {
                type:String
            },
        paymentStatus:
        {
            type:String
        },
        duration:
        {
            type:String
        },
        location:
        {
            type:String
        },
        address1:
        {
            type:String
        },
        address2:
        {
            type:String
        },
        timestamp:
        {
            type:Number
        },
        extendedStatus:
        {
            type: String
        },
        totalAmount:
        {
            type: String
        },
        extendedPastId:
        {
            type: String
        },
        vehicleId:
        {
            type:String
        },        
        vehicleNumber:
        {
            type:String
        },        
        vehicleModel:
        {
            type:String
        },        
        vehicleInsuranceNumber:
        {
            type:String
        }
    });

var order= mongoose.model('order', order_schema);

module.exports = order;
