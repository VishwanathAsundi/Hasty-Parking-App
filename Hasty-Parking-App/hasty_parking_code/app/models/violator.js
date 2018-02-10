var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var violatorSchema = mongoose.Schema(
{
    user_id: 
    {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    place_id:
    {
        type: mongoose.Schema.ObjectId,
        ref: 'add_space_schema'
    },
   carNumber: 
    {
        type: String  
    },
    State:{
        type: String
    },
    image_name:
    {
      type: String
    },
    status:
    {
        type: String
    },
    order_id:
    {
        type: mongoose.Schema.ObjectId,
        ref:'order'
    },
    violations:
    {
        type: Number
    },
    report_type:
    {
        type:String
    },
    problem_type:
    {
        type:String
    },
    not_listed_details:
    {
        type:String
    },
    spotStickerId:
    {
        type: String
    }


},
{
    timestamps: { createdOn: 'created_on' }
});

var violation = mongoose.model('Violation', violatorSchema);

module.exports = violation
