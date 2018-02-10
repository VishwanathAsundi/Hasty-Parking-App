var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/att');
mongoose.Promise = global.Promise;
var space_for_rent = mongoose.Schema(
{
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    name:
    {
        type:String 
    },
    available_status:
    {
        type:String
    },
    location:
        {
          type:String
        },
     processingStatus:
    {
        type:String
    },

    title:
        {
            type:String
        },
    latlong:
    {
        type:[Number],
        index:"2dsphere"
    },
    markerId:
    {
        type:String,
        unique:true
    },
    markerStatus:
    {
        type:Boolean,
    },
    parking_type:
    {
        type:String
    },
    space_type:
    {
           type:String 
     },
    parkingAreaType:
    {
        type:String
    },
    type:
    {
        type: Boolean // true is for individual false is for business
    },
    paidFor:
    {
      type:String   
    },
      dimensionOfSpace:
    {
        type:String
    },
      surfaceMaterial:
    {
        type:String
    },
    space_delimeated:
    {
        type: Boolean
    },
    typeOfSpace:
    {
        type:String
    },
    numberOfSpace:
    {
        type:Number
    },
    numberOfAvailableSpaces:{
        type: Number
    },
    hourly:
    {
        type: String
    },
    weekly:
    {
        type: String
    },
    daily:
    {
        type: String
    },
    monthly:
    {
        type: String
    },
    amenties:
    {
        type: String
    },
    TyPe:
    [{
        lawn:Boolean,
        option2:Boolean,
        option3:Boolean
    }],
    owner_type:
    {
        type:String
    },
    space_delinated:
    {
        type:String
    },
    description:
    {
        type:String
    },
    rent_prev_violator:
    {
        type: String
    },
    placeHeight:
    {
        type:String
    },
    priceHours:
    {
        type:String
    },
    priceDaily:
    {
        type:String
    },
    priceWeek:
    {
        type:String
    },
    priceMonth:
    {
        type:String
    },
    violator:
    {
        type:String
    },
    paymentOption:
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
    status:
    {
        type:String
    },
    paymentStatus:
    {
        type:String
    },
    spotimage:
    [{
        image:
        {
            type:String
        }
    }],
    paymentDetails:
    {
        type: String    
    },
    // change paymentDetails
    // paymentDetails:
    // [{
    //     cardnumber:Boolean,
    //     ccv:Boolean,
    //     expiry_date:Boolean
    // }], 
    active:
    {
        type:String
    },
    paymentTransactionId:
    {
        type:String
    },
    spotSerialId:
    {
        type:String
    },
    flag:
    {
        type:String // Flag = 1 (NEW) , Flag = 2 (On Progress), Flag = 3 (ACCEPTED), Flag= 4 (REJECTED)
    },
    zipcode:
    {
        type:String 
    },
    cityState:
    {
        type:String 
    },
    address:
    {
        type:String 
    }
    
});

var add_space_schema = mongoose.model('AddspaceRent', space_for_rent);

module.exports = add_space_schema;
