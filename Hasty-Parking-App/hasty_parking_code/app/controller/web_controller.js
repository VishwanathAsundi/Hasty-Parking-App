var mongoose = require('mongoose');
var moment = require('moment');
//DB credentials
mongoose.createConnection('mongodb://localhost:27017/hasty_parking');
var ctrl_main = require('../controller/hasty_controller.js');

//DB Schema's
var user = require('../models/signup.js');
var add_space = require('../models/add_space_rent.js');
var cardDtls = require('../models/carddetails.js');
var vehicleDtls = require('../models/vehicleDetails.js');
var order= require('../models/order.js');
var spot = require('../models/spot.js');

var key = "$h%^&a!@s&^45*t%$^&*y";
var encryptor = require('simple-encryptor')(key);

//JWT token
var jwt = require('jsonwebtoken');

//File System
var fs = require('fs');

//controller starts here

var twilio = require('twilio');
var accountSid = 'AC43abc6d3eaee2631feb4a1d506b2f5b2'; // Your Account SID from www.twilio.com/console
var authToken = 'bccfa1762498c77f8cd28297cbe1f0d7'; // Your Auth Token from www.twilio.com/console
var coupon = require('coupon');
var createCoupon = require('coupon-code');

// Find your account sid and auth token in your Twilio account Console.
var client = twilio(accountSid, authToken);
var new_token="";
var amount=0;
var stripe = require('stripe')('sk_test_UJXC8Uvr6y4H7H24XBTWunUl');
  stripe.charges.retrieve("ch_1A9Y1qBABF9ppg6YiV4zIU8t", {
    api_key: "sk_test_UJXC8Uvr6y4H7H24XBTWunUl"
  });
  
function display(a)
    {
        var hours = Math.trunc(a/60);
        var minutes = a % 60;
        // var time = hours +":"+ minutes;
        var time = [hours,minutes];
        return time;
    }



var ctrl = {

 webSign: function(req, res, next)   {
        if(req.session.mysess){
            console.log(req.session.mysess)
            res.send({
                status: false,
                message: "Already Logged In"
            })
        }
        else{        
                user.findOne({$or: [{ email: req.body.email},{phone_number:req.body.phone_number}]}, 'email password usertype', function(err, guy) 
                {
                    if (!err && guy)
                    { console.log(guy)
                
                        res.send({status:false,message:"Email or Phonenumber is Already Registered"})
                    }
                    else 
                    {
                        var objToken = {password:"sdq2312398qzkj^$%^$%^$bda@@$%%%skjd12312akjsd12321kasd1!@#!@12!^&$^%^@#$@$%",email:"pmelamparithi@gmail.com",_id:"asda12312342345654645645"}
                        var token = jwt.sign(objToken,key, {
                            expiresIn: 1440 // expires in 24 hours
                        });
                        new_token=token;
                        var wallet = 0;
                        var count_ref = 0;
                        //var code = createCoupon.generate({parts : 1, partLen : 6});
                        var ency_passwd = encryptor.encrypt(req.body.password);
                        function randomString(length, chars) {
                            var result = '';
                            for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
                                return result;
                        }
                        var otp_gen =randomString(5, '0123456789'); 
                        var ref_code = req.body.fname+randomString(5, '012AVkiskfkfbwkfsdflkjhasdfj3456789');
                        
                        var save_dtls = new user({ "firstname": req.body.fname,"ref_code":ref_code, "lastname": req.body.lname, "phone_number": req.body.phone_number, "email":req.body.email, "password":ency_passwd,"token":token, "wallet": wallet,"status":"0","otp":"12345"/*otp_gen*/,"device_token":req.body.deviceToken,"device_type":req.body.deviceType,"f_id":req.body.facebookId,"g_id":req.body.googleId,"violations":0});
                        console.log(save_dtls)
                        client.sendMessage({
                            to:"+919944721544",
                            from: '+16176525030',
                            body: 'One Time Password is : '+otp_gen
                        },function(errsms,data)
                        {
                            if (data)
                            {
                                save_dtls.save(function(errs,savedData)
                                {
                                    req.session.phoneNumber = savedData.phone_number;
                                    console.log("Session Handling:" + req.session.phoneNumber)
                                    var my_sessionEmail = encryptor.encrypt(savedData.email);
                                    req.session.mysess = my_sessionEmail;
                                    console.log("Session Variable mysess Initialized"+req.session.mysess)
                                    req.session.userid = savedData._id;

                                    //var myobj = {userName:savedData.firstname +" "+savedData.lastname,userPhoneNumber:savedData.phone_number,userMailId:savedData.email,HotlineMailId:savedData.hotline_email_id,HotlinePhoneNumber:savedData.hotline_phone_number};
                                    
                                    console.log(savedData)
                                    if (!errs) 
                                    {
                                        res.send({status:true,message:"Signup Successful",token:token});        
                                    }
                                    else
                                    {
                                        res.send({status:false,message:"Signup Not Successful"});       
                                    }
                                });
                            }
                            
                            else 
                            {

                                res.send({status:false,message:"Try Again"});
                            }
                        });
                    }
                });
            }
        },
      webLogin: function(req, res, next) {
           if(req.session.mysess)
           {
               
               res.send({
                   status: false,
                   message: "Already Logged In"
               })
           }
           else{           
            console.log(req.body)
            var g_id = req.body.googleId;
            var f_id = req.body.facebookId;
/*          console.log(encryptor.decrypt("59a2d8d2fe9e04f103c203f293ee5e851bdc04cb0770e318d97351286ad5cd6a2cb93b434b5348402ba0d12b79cadc88KKglAJ3w5sL43R6ZEzCufA=="))*/
            if (!g_id && !f_id && req.body.password) {
                 user.findOne(
                    {
                        email: req.body.email
                    }, 
                    function(err, guy) {
                        if (!err && guy)
                        {
                            console.log(encryptor.decrypt(guy.password));
                            if (encryptor.decrypt(guy.password) == req.body.password)
                            {
                                console.log(guy.status)
                                if(guy.status=="0"){
                                            res.send({status:false,"message":"Not a Verified User",phoneNumber:guy.phone_number});
                                                }
                                else
                                {
                                    var toKen = jwt.sign(guy._id, key, {
                                        expiresIn: 1440 // expires in 24 hours
                                    }); 
                                    new_token=toKen;
                                    console.log(req.body.email)
                                    console.log(req.body)
                                user.findOneAndUpdate({email:req.body.email},{token:toKen,device_token:req.body.deviceToken,device_type:req.body.deviceType},{new:true},function(reqa,resa)
                                {
                                        if(reqa)
                                        {
                                            res.send({status:false,"message":"Check DeviceToken and Type"})
                                        }
                    var imageurl = "http://192.169.164.224:8111/";
                    if(resa.image_path =="" || resa.image_path== null || resa.image_path == undefined){
                        imageurl = "" 
                    }
                    else{
                        var imageurl = imageurl+resa.image_path;
                    }
                                    var myobj = {userName:resa.firstname +" "+resa.lastname,userPhoneNumber:resa.phone_number,userMailId:resa.email,HotlineMailId:resa.hotline_email_id,HotlinePhoneNumber:resa.hotline_phone_number,imageUrl:imageurl,token:resa.token};

                                        req.session.phoneNumber = resa.phone_number;
                                        req.session.userid = resa._id;
                                        var my_sessionEmail = encryptor.encrypt(resa.email);
                                        req.session.mysess = my_sessionEmail;
                                        console.log("Session Initialized" + req.session.mysess)
                                    
                                       res.json({
                                       status: true,
                                       message: 'Login Successful',
                                       userdetails:myobj
                                    });
                                
                                });
                                  }
                            }
                                else
                                {
                                    res.send({status:false,"message":"Password is Incorrect"})
                                } 
                        } 
                        else 
                        {
                            res.json({
                                status: false,
                                message: 'User Not Found'
                            });
                        }
                    });
            } 
            else if (!g_id && f_id) //facebook
            {
                    user.findOne({'f_id': f_id }, function(err, docs) 
                    {
                        if(docs == null)
                        {
                            res.send({status:false,message:"This FacebookId is not registered"});
                            return false;
                        }
                        else if (err)
                        {       
                            res.send({status:false,message:"This FacebookId is not registered"});
                            return false;
                        }
                        else if(docs.status=="0"){
                            res.send({status:false,"message":"Not a Verified User",phoneNumber:docs.phone_number});
                        } 
                        else if(docs)
                        {
                            var object = new user(
                            {
                                'email': docs.email,
                                'image_path': docs.image_path,
                                'phone': docs.phone,
                                'fname': docs.fname,
                                'lname': docs.lname,
                                'f_id': docs.f_id
                            });
                            var objToken = {password:"sdq2312398qzkj^$%^$%^$bda@@$%%%skjd12312akjsd12321kasd1!@#!@12!^&$^%^@#$@$%",email:"pmelamparithi@gmail.com",_id:"asda12312342345654645645"}
                                        var toKen = jwt.sign(objToken,key, {
                                            expiresIn: 1440 // expires in 24 hours
                                        });

                            user.findOneAndUpdate({'f_id': f_id},
                            {
                                token:toKen
                            },
                    {new:true},
                            function(errf,finfo)
                            {
                                        var imageurl = "http://192.169.164.224:8111/";
                                        if(finfo.image_path =="" || finfo.image_path== null || finfo.image_path == undefined){
                                                imageurl = ""    
                                        }
                                        else{
                                               imageurl =  imageurl+finfo.image_path;
                                        }
                    var myobj = {userName:finfo.firstname +" "+finfo.lastname,userPhoneNumber:finfo.phone_number,userMailId:finfo.email,HotlineMailId:finfo.hotline_email_id,HotlinePhoneNumber:finfo.hotline_phone_number,imageUrl:imageurl,token:finfo.token};

                                        req.session.phoneNumber = finfo.phone_number;
                                        req.session.userid = finfo._id;
                                        var my_sessionEmail = encryptor.encrypt(finfo.email);
                                        req.session.mysess = my_sessionEmail;
                                        console.log("Session Initialized" + req.session.mysess)

                    res.json({status: true,message: 'Login Successful',userdetails:myobj}); 
                            })
                            
                        }
                        else{
                            res.json({
                                status: false,
                                message: 'This facebookid is not registered'
                            });
                        }
                    });

            } 
            else if (g_id && !f_id) //gmail login
            {
                user.findOne({'g_id': g_id }, function(err, docs) 
                {
                    if(docs == null)
                    {
                        res.send({status:false,message:"This GoogleId is not registered"});
                        return false;
                    }
                    else if (err)
                    {       
                        res.send({status:false,message:"This GoogleId is not registered"});
                        return false;
                    }
                    else if(docs.status=="0"){
                        res.send({status:false,"message":"Not a Verified User",phoneNumber:docs.phone_number});
                    }                                           
                    else if(docs)
                    {
                        var object = new user(
                        {
                            'email': docs.email,
                            'image_path': docs.image_path,
                            'phone': docs.phone,
                            'fname': docs.fname,
                            'lname': docs.lname,
                            'g_id': docs.g_id
                        });
                        var objToken = {password:"sdq2312398qzkj^$%^$%^$bda@@$%%%skjd12312akjsd12321kasd1!@#!@12!^&$^%^@#$@$%",email:"pmelamparithi@gmail.com",_id:"asda12312342345654645645"}
                                    var tokEn = jwt.sign(objToken,key, {
                                        expiresIn: 1440 // expires in 24 hours
                                    });

                        user.findOneAndUpdate({'g_id': g_id},
                        {
                            token:tokEn
                        },
                {new:true},
                        function(errf,finfo)
                        {
                                        var imageurl = "http://192.169.164.224:8111/";
                                        if(finfo.image_path =="" || finfo.image_path== null || finfo.image_path == undefined){
                                                imageurl = ""
                                        }
                                        else{
                                               imageurl =  imageurl+finfo.image_path;
                                        }
                                        var myobj = {userName:finfo.firstname +" "+finfo.lastname,userPhoneNumber:finfo.phone_number,userMailId:finfo.email,HotlineMailId:finfo.hotline_email_id,HotlinePhoneNumber:finfo.hotline_phone_number,imageUrl:imageurl,token:finfo.token};

                                        req.session.phoneNumber = finfo.phone_number;
                                        req.session.userid = finfo._id;
                                        var my_sessionEmail = encryptor.encrypt(finfo.email);
                                        req.session.mysess = my_sessionEmail;
                                        console.log("Session Initialized" + req.session.mysess)

                            res.json({
                                status: true,
                                message: 'Login Successful',
                                userdetails:myobj
                            }); 
                        })
                    }
                    else
                    {
                        res.json({
                            status: false,
                            message: 'This googleId Is Not Registered'
                        });
                    }
                });
            }
            else 
            {
                res.send({
                    status: false,
                    message: "Error"
                });
            }
          }
        },
    

    log_out: function(req, res, next) {
        if (!req.session.mysess) {
            console.log(req.session.mysess);
            res.send({
                status: false,
                message: "Login First..!!"
            });
        } else {
            console.log("Destroyed");
            req.session.destroy();
            res.send({
                status: true,
                message: "Session Destroyed"
            });
        }
    },
    findSpace: function(req, res, next) {
        // if (!req.session.mysess) {
        //     console.log(req.session.mysess);
        //     res.send({
        //         status: false,
        //         message: "Login First..!!"
        //     });
        // } else {

            var start = moment(req.body.startdate);
            var end = moment(req.body.enddate);
            console.log(req.body);
            if(!req.body.lat||!req.body.lng)
            {
                res.send({status:false,message:"Please Enter the Location"});
                return false;
            }
            else if(!req.body.startdate)
            {
                res.send({status:false,message:"Please select the Startdate"});
                return false;
            }
            else if(!req.body.enddate)
            {
                res.send({status:false,message:"Please select the Enddate"});
                return false;
            }
            else if(start>=end)
            {
                res.send({status:false,message:"Invalid dates"});
                return false;
            }
            else
            {
                req.session.lat = req.body.lat;
                req.session.lng = req.body.lng;
                req.session.startdate = req.body.startdate;
                req.session.enddate = req.body.enddate;
                res.send({
                status: true,
                message: "Success"
                });
            }
            
       // }


    },
    getspacedetails: function(req, res) {

        // if (!req.session.mysess) {
        //     console.log(req.session.mysess);
        //     res.send({
        //         status: false,
        //         message: "Login First..!!"
        //     });
        // } 
       // else
         //{
            var start = moment(req.session.startdate);         
         var end = moment(req.session.enddate);

         // console.log("Findspace"+start.format());
            // console.log(enddate);
            // console.log(req.body)
            // var timeParts = starttime.split(':'),
            // dateParts = startdate.split('-');
            // var start=new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);
            // console.log(new Date());
            // console.log("++++++++++++++++++++++++++++++++++++++++++++++++")
            // console.log(start)
            // timeParts = endtime.split(':'),
            // dateParts = enddate.split('-');
            // var end=new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);
        
            // start=start.getTime();
            // end=end.getTime();

            var t = end - start;
            var z = parseInt(t / 1000 / 60);
            var time = display(z);
            var hhmm;
            var hh1 = time[0];
            var mm1 = time[1];
            if(hh1=="0")
            {
                hhmm = mm1+" Minutes";
            }
            else
            {
                hhmm = hh1+" Hours and "+mm1+" Minutes";
            }
            console.log("hh"+hh1);
            console.log("mm"+mm1);
            var h = (Math.abs(end - start)/3.6e6);
            
            console.log("hours"+h);

            console.log('start Timestamp->'+start.format()+' end Timestamp->'+end.format());


            // console.log(startdate+' '+enddate+' '+starttime+' '+endtime);    
           //Getting Total Hours


            // Getting start & end Time , splitting
            //var e_t=endtime.split(':');
            //var s_t=starttime.split(':');
            var amount=0;

            //h=h+parseInt(e_t);
            //h=h+parseInt(s_t);

           //To get decimal value till 2 digits
           h = h.toFixed(2);           
           req.session.totalhours=h;
           console.log('hours->'+h);
           var total_hours=h+"hours";
           console.log(total_hours)
           // counting total number of months
           var months=0,weeks=0,days=0;

           // total hours for a day,week,month
           var wh=168,dh=24,mh=720;


           // calculating total number of months
           if(h>=mh)
           {
                months=parseInt(h/mh);
                h=parseInt(h%mh);

               //calculating total number of weeks
               if(h>=wh)
               {
                weeks=parseInt(h/wh);
                h=parseInt(h%wh);
               }

               //calculating total number of days
               if(h>=dh)
               {
                days=parseInt(h/dh);
                h=parseInt(h%dh);
               }
           }
           else
           {

               //calculating total number of weeks
               if(h>=wh)
               {
                weeks=parseInt(h/wh);
                h=parseInt(h%wh);
               }

               //calculating total number of weeks
               if(h>=dh)
               {
                days=parseInt(h/dh);
                h=parseInt(h%dh);
               }
           }

            console.log('hours:'+h+' days:'+days+' weeks:'+weeks+' months:'+months);
            var Searched_list = [],p=0;
            var latlong = [req.session.lat,req.session.lng];
            console.log(latlong);
            add_space.find({
                latlong:
                { 
                    $near :
                    {
                        $geometry: { type: "Point",  coordinates: latlong},
                        $maxDistance:2000.00
                    }
                },available_status:"yes"
            }).exec(function(err, docs) 
            {
                if (err) 
                {
                    console.log(err);
                    return res.json(500, err);
                }
                else
                {
                    if(start>=end)
                    {
                        console.log(start+' '+end);
                        res.send({status:false,message:"Wrong input values"});
                        return false;
                    }
                    else
                    {
                         console.log("TESTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT:"+docs[0]);
                        if(docs.length==0 || docs==null)
                        {
                            res.send({status:false,message:"No Entry Found"});
                        }
                       else 
                       {

                                var k=0;
                                console.log('k->'+k);
                                console.log('length-->'+docs.length);
                                console.log('Documents->'+docs[k]);
                                checkMe(k);
                                function checkMe(k)
                                {

                                        if(k==(docs.length))
                                        {

                                            if(Searched_list.length == 0)
                                            {
                                                res.json({status:false,'message':"No Space Found",'Searched_details':{'Searched_List':Searched_list}}); 
                                                return false;
                                            }
                                            console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
                                            console.log(docs.length)
                                            console.log("*************************************************")
                                            console.log('k==docs.length-->'+k+' '+docs.length);
                                            res.json({status:true,'message':"List of Available Spaces",'lat':req.session.lat,'long':req.session.lng,'Searched_details':{'Searched_List':Searched_list}});
                                            return false;
                                        }   
                                        else
                                        {

                                                spot.find({place_id:docs[k]._id},function(err1,spots)
                                                {
                                                    if(err1)
                                                    {
                                                        res.send({status:false,message:"Error occured!"});
                                                        return false;
                                                    }
                                                    else 
                                                    {
                                                        var len = spots.length;
                                                        var i=len-1;
                                                        ks(i);

                                                        function ks(i)
                                                        {
                                                                if(i!=-1)
                                                                {
                                                                    console.log("*****************************************")
                                                                    
                                                                    order.find({'spotStickerId':spots[i].spotStickerId, 'extendedStatus':null, 'orderStatus':{$ne:"cancelled"}, $or:[{start_timestamp:{$lte: start},end_timestamp: {$gte: start}}, {start_timestamp :{$lte: end}, end_timestamp : {$gte: end}}]}).exec(function(err2,space)
                                                                    {
                                                                        user.findOne({token:new_token},function(eror,user){
                                                                            if(eror)
                                                                            {
                                                                                res.send({status:false,message:"Eror Occured"});
                                                                                return false;
                                                                            }

                                                                        
                                                                            console.log('Id-->'+docs[k]._id)
                                                                            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6")
                                                                            console.log('Space-->'+space)
                                                                            if(err)
                                                                            {
                                                                                return res.send({status:false,message:"Error occured!!"});
                                                                            }
                                                                            // console.log('space'+space);
                                                                            if(space.length>0)
                                                                            {
                                                                                // console.log("start_timestamp"+space[0].start_timestamp);
                                                                                // console.log("end_timestamp"+space[0].end_timestamp);
                                                                                // console.log("start" + start);
                                                                                // console.log("end" + end);
                                                                                ks(i-1);
                                                                            }
                                                                            else
                                                                            {
                                                                                console.log('hi hello');
                                                                                var ph=docs[k].hourly;
                                                                                var pw=docs[k].weekly;
                                                                                var pd=docs[k].daily;
                                                                                var pm=docs[k].monthly;

                                                                                // location
                                                                                var location=docs[k].location;
                                                                                console.log('Location-->'+location);

                                                                                // calculating amount
                                                                                amount=(ph*h)+(pd*days)+(pw*weeks)+(pm*months);
                                                                                req.session.TotalAmount=amount;
                                                                                console.log("New Amount"+amount);
                                                                                if(amount<ph)
                                                                                {
                                                                                    amount = ph;
                                                                                    console.log(amount + "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")
                                                                                }
                                                                                var latlong=docs[k].latlong[0]+',';
                                                                                latlong+=docs[k].latlong[1];
                                                                                var result=[req.session.lat,req.session.lng];
                                                                                var disc_amount = amount - user.wallet;
                                                                                if(disc_amount<0)
                                                                                {
                                                                                    disc_amount = 0;
                                                                                }
                                                                                console.log('result->'+result +' latlong-->'+latlong);
                                                                                // var myDate = moment(req.body.start);
                                                                                // var startdate = start.format('DD-MMM-YYYY');
                                                                                // var enddate = end.format('DD-MMM-YYYY');
                                                                                // var starttime = start.format("hh:mm:ss a");
                                                                                // var endtime = end.format("hh:mm:ss a");
                                                                                //console.log(endtime);
                                                                                //console.log(starttime);
                                                                                if(result[0]==docs[k].latlong[0] && result[1]==docs[k].latlong[1])
                                                                                {
                                                                                  //creating object for each location
                                                                                    var temp={'LatLong':latlong,
                                                                                    'PlaceId':docs[k]._id,
                                                                                    'start':start.format(),
                                                                                    'end':end.format(), 
                                                                                    'Duration':hhmm,
                                                                                    'TotalAmount':amount,
                                                                                    'PlaceName':docs[k].title,
                                                                                    'LocationName':docs[k].location,
                                                                                    'discountedAmount':disc_amount,
                                                                                    'ParkingType':docs[k].parking_type,
                                                                                    'parkingAreaType':docs[k].parkingAreaType,
                                                                                    'SpaceType':docs[k].space_type,
                                                                                    'Description':docs[k].description,
                                                                                    'searchedStatus':'yes',
                                                                                    'Amentities':docs[k].amenties,
                                                                                    'placeHeight':docs[k].placeHeight,
                                                                                    'dimensionOfSpace':docs[k].dimensionOfSpace,
                                                                                    'surfaceMaterial':docs[k].surfaceMaterial,
                                                                                    'isThisSpaceDelinated':docs[k].space_delinated,
                                                                                    'hourly':docs[k].hourly+'/Hour',
                                                                                    'monthly':docs[k].monthly + '/Month',
                                                                                    'weekly':docs[k].weekly + '/Week',
                                                                                    'daily':docs[k].daily + '/Day'  
                                                                                    }
                                                                                  console.log(temp)
                                                                                  Searched_list[p++]=temp;  

                                                                                        k++;
                                                                                        console.log('k->'+k+' p-->'+p);
                                                                                        checkMe(k);
                                                                                }
                                                                                else
                                                                                {
                                                                                    //creating object for each location
                                                                                    var temp={'LatLong':latlong,
                                                                                    'PlaceId':docs[k]._id,
                                                                                    'start':start.format(),
                                                                                    'end':end.format(), 
                                                                                    'Duration':hhmm,
                                                                                    'TotalAmount':amount,
                                                                                    'PlaceName':docs[k].title,
                                                                                    'LocationName':docs[k].location,
                                                                                    'discountedAmount':disc_amount,
                                                                                    'ParkingType':docs[k].parking_type,
                                                                                    'parkingAreaType':docs[k].parkingAreaType,
                                                                                    'SpaceType':docs[k].space_type,
                                                                                    'Description':docs[k].description,
                                                                                    'searchedStatus':'yes',
                                                                                    'Amentities':docs[k].amenties,
                                                                                    'placeHeight':docs[k].placeHeight,
                                                                                    'dimensionOfSpace':docs[k].dimensionOfSpace,
                                                                                    'surfaceMaterial':docs[k].surfaceMaterial,                                                                          
                                                                                    'isThisSpaceDelinated':docs[k].space_delinated,
                                                                                    'hourly':docs[k].hourly+'/Hour',
                                                                                    'monthly':docs[k].monthly + '/Month',
                                                                                    'weekly':docs[k].weekly + '/Week',
                                                                                    'daily':docs[k].daily + '/Day'  
                                                                                    }
                                                                                    console.log(temp)
                                                                                    Searched_list[p++]=temp; 
                                                                                    
                                                                                        k++;
                                                                                        console.log('k->'+k+' p-->'+p);
                                                                                        checkMe(k);
                                                                                }

                                                                            }
                                                                        });                                 
                                                                    });
                                                                }
                                                                else
                                                                {
                                                                    k++;
                                                                    console.log('k->'+k);
                                                                    if(k==(docs.length))
                                                                    {
                                                                        console.log(Searched_list.length+"IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII")
                                                                        if(Searched_list.length == 0 )
                                                                        {
                                                                            res.json({status:false,'message':"No Space Found",'Searched_details':{'Searched_List':Searched_list}}); 
                                                                            return false;
                                                                        }
                                                                        res.json({status:true,'message':"List of Available Spaces",'lat':req.session.lat,'long':req.session.lng,'Searched_details':{'Searched_List':Searched_list}});

                                                                    }
                                                                    else
                                                                    {
                                                                        
                                                                        checkMe(k);
                                                                    }
                                                                }
                                                        }

                                                    
                                                    }

                                                });
                                        }

                                }
                       }
                    }
                }
            });
        //}
    },
rentaSpace: function(req, res) {
        // ZIP CODE IMPORTANT
        if (!req.session.mysess) {
            console.log(req.session.mysess);
            res.send({
                status: false,
                message: "Login First..!!"
            });
        } else {
            
            console.log("Inside Rent space Controller");
            console.log(req.body);
            var Location =  req.body.location;
            var LatLong = req.body.lat + ',' + req.body.lng;
            //var LatLong = "20.15428,55.5248";
            var amenities = "";
            
            var arr = [];
            arr.push(req.body.lat);
            arr.push(req.body.lng);
            //var str = LatLong.split(',');
            // arr[0] = req.body.data.lat;
            //arr[1] = req.body.data.lng;
            console.log('kkkkkkk'+arr[0]);
            console.log('kkkqwertykkkk'+arr[1]);
            user.findOne({
                token: req.body.token
            }, function(rez, resz) {
                    console.log("----------------------------------------");
                    console.log("vkfnknvkfvfv");
                    console.log(resz);
                    console.log("----------------------------------------");
                function randomString(length, chars) {
                    var result = '';
                    for (var i = length; i > 0; i--) result += chars[Math.round(Math.random() * (chars.length - 1))];
                    return result;
                }
                add_space.find({
                    'user_id': resz._id,
                    'latlong': arr
                }, function(err, guy) {
                    console.log('testing'+guy);

                        if(req.body.paidFor == "spacemarker"){
                            var markerAmount = 19.95;
                            console.log("Marker Amount:"+req.body.paidFor)
                             req.session.markerAmount = markerAmount;
                            console.log("Session for markerAmount"+req.session.markerAmount)
                        }else if(req.body.paidFor == "spotsticker"){
                            markerAmount = 4.95;
                            req.session.markerAmount = 4.95;
                            console.log("Session for SpotSticker" +req.session.markerAmount)
                        }

                    if (guy.length == 0 && (!err)) {
                        var noas;
                        var nos;
                       // console.log(req.body.data.SpaceType);
                        if (req.body.SpaceType == "single") {
                            console.log("single");
                            noas = 1;
                            nos = 1;
                        } else if (req.body.SpaceType == "multiple") {
                            console.log("multiplespace");
                            noas = req.body.numberOfSpace;
                            nos = req.body.numberOfSpace;
                        }
                        var str = LatLong.split(',');
                        arr[0] = str[0];
                        arr[1] = str[1];
                        var markerId;
            function mark() {
                            markerId = req.body.deliveryZip + randomString(5, '012AVkiskfkfbwkfsdflkjhasdfj3456789');
                        }
                        mark();
                        var markerStatus;
                        if (req.body.markerType == "1") {
                            markerStatus = true;
                        } else {
                            markerStatus = false;
                        }
                        var person = new add_space({
                            'user_id': resz._id,
                            'title': req.body.Title,
                            'location': Location,
                            'parking_type': req.body.parkingType,
                            // 'space': req.body.SpaceType,
                            "numberOfAvailableSpaces": noas,
                            'numberOfSpace': nos,
                            "description": req.body.Description,
                            "type": req.body.Type,
                            "space_delimited": req.body.sd,
                            "available_status": "yes",
                            "latlong": arr,
                            'hourly': req.body.Hourly,
                            'weekly': req.body.Weekly,
                            'daily': req.body.Daily,
                            'monthly': req.body.Monthly,
                            'rent_prev_violator': req.body.rpv,
                            'placeHeight': req.body.HeightRestriction,
                            'paymentDetails': req.body.PaymentDetails,
                            'owner_type': req.body.OwnerType.owner,
                            'zipcode': req.body.deliveryZip,
                            'cityState': req.body.deliveryState,
                            'city': req.body.city,
                            'space_type': req.body.SpaceType,
                            'space_delinated': req.body.SpaceDelinated,
                            'markerId': markerId,
                            'markerStatus': markerStatus,
                            'amenties': req.body.amenities,
                            'surfaceMaterial': req.body.material,
                            'paidFor':req.body.paidFor,
                            'address': req.body.deliveryAddres,
                            "flag": "1",
                            "paymentStatus": "processing",
                            "dimensionOfSpace": req.body.dimensionOfSpace
                        });
                        // type will be individual owner or business
                     
                        person.save(function(err, doc) {
                            console.log(err)
                            if (err || doc === 'null') return res.send({
                                status: false,
                                'message': 'sorry not stored:error'
                            });

                            else {
                                    req.session.placeId=doc._id;
                                    console.log(doc);
                                var spotIdGeneration;

                                function xyz() {
                                    spotIdGeneration = randomString(4, '0123456789') + req.body.deliveryZip;
                                }
            for (var i = 0; i < nos; i++) {
                                    xyz();
                                    console.log("SPOTID:" + spotIdGeneration);
                                    var obj = new spot({
                                        place_id: doc._id,
                                        spotStickerId: spotIdGeneration
                                    })
                                    obj.save(function(err, docs) {
                                        console.log('ddddddddddd'+docs);
                                        if (err) {
                                            return res.json({
                                                status: false,
                                                message: "spot Id not Saved"
                                            });
                                        } else {
                                            console.log("Successful..!!");
                                        }
                                    });
                                }
                                res.send({
                                    'status': 'true',
                                    'MySpaceId': person._id,
                                    message: "Successfully created",
                                    "space_status": "waiting for hasty approval"
                                });
                            }
                        });
                    } else if (guy.length > 0 || err) {
                        res.send({
                            'status': 'false',
                            message: "Sorry this place Already exist"
                        });
                    }

                })
            });
        }
    },
rentspacepayment:function(req,res)
{

    console.log("Session:"+ req.session.markerAmount);
    console.log('PlaceId'+req.session.placeId);
    var custId = req.body.customerId;
    var payamount = parseFloat( req.session.markerAmount);
    var stripeEmail = req.body.stripeEmail;
    var stripeToken = req.body.stripeToken;
    var toKen = new_token;
    var spaceId = req.session.placeId;
    user.findOne({token:toKen},function(reqa,resa)
    {
        var userId = resa._id;
        cardDtls.findOne({user_id:userId,customerId:custId},function(err,info)
        {
            if(err || info== null)
            {
                var amounT = parseInt(payamount)*100;
                stripe.customers.create(
                {
                    email: stripeEmail,
                    card: stripeToken
                })
                .then(customer =>
                stripe.charges.create(
                {
                    amount:parseInt(amounT),
                    description: "Marker Charge",
                    currency: "usd",
                    customer: customer.id
                }))
                .then(charge => {
                    console.log(charge.customer);
                    var cardobj = new cardDtls({user_id:userId,customerId:charge.customer,cardDetails:[{cardnumber:charge.source.last4,expMonth:charge.source.exp_month,expYear:charge.source.exp_year}]})
                cardobj.save(function(errcard,cardinfo)
                {
                    if (errcard)
                    {
                        res.send({status:false,message:"Card not saved"})
                    }
                    else
                    {
                                    add_space.findOneAndUpdate({_id:spaceId},{paymentStatus:"paid"},function(error,result)
                                    {
                                        if (error) 
                                        {
                                            res.send({'status':false,'message':error});
                                        }
                                        else
                                        {
                                            console.log('result-->'+result);
                                            res.send({status:true,message:"payment successful",details:charge})
                                            return false;
                                        }

                                    })

                    }   
                    });
                })
                .catch(err => {
                    add_space.find({'_id':spaceId},function(err)
                    {
                        if(err)
                        {
                        res.send({status:false,"message":"Error Occured"});
                        }  
                        else
                        {
                        res.send({status:false,message: "Purchase Failed"});
                        }      
                    }).remove().exec();
                });       
            }
            else
            {
                var amounT = payamount*100;
                console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                console.log(info.customerId)
                stripe.charges.create(
                {
                    amount:parseInt(amounT),
                    description: "Marker Charge",
                    currency: "usd",
                    customer: info.customerId
                })
                .then(charge => {
                    console.log(charge.customer);
                    cardDtls.findOne({user_id:userId,cardnumber : charge.source.last4},function(mmm,kkk)
                    {
                        if(kkk)
                        {
                            cardDtls.findOneAndUpdate(
                            {
                                user_id:userId
                            },
                            {
                                $push: 
                                {       
                                    customerId: charge.customer,
                                    cardDetails: 
                                    {   
                                        
                                        cardnumber:charge.source.last4,
                                        expMonth:charge.source.exp_month,
                                        expYear:charge.source.exp_year
                                    }   
                                }
                            },
                            {
                                new: true
                            },
                            function(errcard,cardinfo)
                                {
                                if (errcard)
                                {
                                    res.send({status:false,message:"Card not saved"})
                                }
                                else
                                {
                                    add_space.findOneAndUpdate({_id:spaceId},{paymentStatus:"paid"},function(error,result)
                                    {
                                        if (error) 
                                        {
                                            res.send({'status':false,'message':error});
                                        }
                                        else
                                        {
                                            console.log('result-->'+result);
                                            res.send({status:true,message:"payment successful",details:charge})
                                            return false;
                                        }

                                    })
                                }
                            })              
                        }
                        else
                        {
                                    add_space.findOneAndUpdate({_id:spaceId},{paymentStatus:"paid"},function(error,result)
                                    {
                                        if (error) 
                                        {
                                            res.send({'status':false,'message':error});
                                        }
                                        else
                                        {
                                            console.log('result-->'+result);
                                            res.send({status:true,message:"payment successful",details:charge})
                                            return false;
                                        }

                                    })

                        }
                    })
                })
                .catch(err => {
                    console.log("Error:", err);
                    add_space.find({'_id':spaceId},function(err)
                    {
                        if(err)
                        {
                        res.send({status:false,"message":"Error Occured"});
                        }  
                        else
                        {
                        res.send({status:false,message: "Purchase Failed"});
                        }      
                    }).remove().exec();
                });       
            }
        })
    })
},
rentspacepayment_card:function(req,res)
{

    console.log("Session:"+ req.session.markerAmount);
    console.log('PlaceId'+req.session.placeId);
    var custId = req.body.customerId;
    var payamount = parseFloat( req.session.markerAmount);
    var stripeEmail = req.body.stripeEmail;
    var stripeToken = req.body.stripeToken;
    var toKen = new_token;
    var spaceId = req.session.placeId;
    user.findOne({token:toKen},function(reqa,resa)
    {
        var userId = resa._id;
        cardDtls.findOne({user_id:userId,customerId:custId},function(err,info)
        {
            if(err || info== null)
            {
                var amounT = parseInt(payamount)*100;
                stripe.customers.create(
                {
                    email: stripeEmail,
                    card: stripeToken
                })
                .then(customer =>
                stripe.charges.create(
                {
                    amount:parseInt(amounT),
                    description: "Marker Charge",
                    currency: "usd",
                    customer: customer.id
                }))
                .then(charge => {
                    console.log(charge.customer);
                    var cardobj = new cardDtls({user_id:userId,customerId:charge.customer,cardDetails:[{cardnumber:charge.source.last4,expMonth:charge.source.exp_month,expYear:charge.source.exp_year}]})
                cardobj.save(function(errcard,cardinfo)
                {
                    if (errcard)
                    {
                         res.render('website/rentspacePayment.ejs');
                        //res.send({status:false,message:"Card not saved"})
                    }
                    else
                    {
                                    add_space.findOneAndUpdate({_id:spaceId},{paymentStatus:"paid"},function(error,result)
                                    {
                                        if (error) 
                                        {
                                             res.render('website/rentspacePayment.ejs');
                                            //res.send({'status':false,'message':error});
                                        }
                                        else
                                        {
                                            console.log('result-->'+result);
                                             res.render('website/paymentsuccessful.ejs');
                                           // res.send({status:true,message:"payment successful",details:charge})
                                            //return false;
                                        }

                                    })

                    }   
                    });
                })
                .catch(err => {
                    add_space.find({'_id':spaceId},function(err)
                    {
                        if(err)
                        {
                             res.render('website/rentspacePayment.ejs');
                       // res.send({status:false,"message":"Error Occured"});
                        }  
                        else
                        {
                             res.render('website/rentspacePayment.ejs');
                        //res.send({status:false,message: "Purchase Failed"});
                        }      
                    }).remove().exec();
                });       
            }
            else
            {
                var amounT = payamount*100;
                console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                console.log(info.customerId)
                stripe.charges.create(
                {
                    amount:parseInt(amounT),
                    description: "Marker Charge",
                    currency: "usd",
                    customer: info.customerId
                })
                .then(charge => {
                    console.log(charge.customer);
                    cardDtls.findOne({user_id:userId,cardnumber : charge.source.last4},function(mmm,kkk)
                    {
                        if(kkk)
                        {
                            cardDtls.findOneAndUpdate(
                            {
                                user_id:userId
                            },
                            {
                                $push: 
                                {       
                                    customerId: charge.customer,
                                    cardDetails: 
                                    {   
                                        
                                        cardnumber:charge.source.last4,
                                        expMonth:charge.source.exp_month,
                                        expYear:charge.source.exp_year
                                    }   
                                }
                            },
                            {
                                new: true
                            },
                            function(errcard,cardinfo)
                                {
                                if (errcard)
                                {
                                     res.render('website/rentspacePayment.ejs');
                                   // res.send({status:false,message:"Card not saved"})
                                }
                                else
                                {
                                    add_space.findOneAndUpdate({_id:spaceId},{paymentStatus:"paid"},function(error,result)
                                    {
                                        if (error) 
                                        {
                                             res.render('website/rentspacePayment.ejs');
                                            //res.send({'status':false,'message':error});
                                        }
                                        else
                                        {
                                            console.log('result-->'+result);
                                             res.render('website/paymentsuccessful.ejs');
                                            //res.send({status:true,message:"payment successful",details:charge})
                                            return false;
                                        }

                                    })
                                }
                            })              
                        }
                        else
                        {
                                    add_space.findOneAndUpdate({_id:spaceId},{paymentStatus:"paid"},function(error,result)
                                    {
                                        if (error) 
                                        {
                                             res.render('website/rentspacePayment.ejs');
                                            //res.send({'status':false,'message':error});
                                        }
                                        else
                                        {
                                            console.log('result-->'+result);
                                             res.render('website/paymentsuccessful.ejs');
                                            //res.send({status:true,message:"payment successful",details:charge})
                                            return false;
                                        }

                                    })

                        }
                    })
                })
                .catch(err => {
                    console.log("Error:", err);
                    add_space.find({'_id':spaceId},function(err)
                    {
                        if(err)
                        {
                             res.render('website/rentspacePayment.ejs');
                        //res.send({status:false,"message":"Error Occured"});
                        }  
                        else
                        {
                             res.render('website/rentspacePayment.ejs');
                        //res.send({status:false,message: "Purchase Failed"});
                        }      
                    }).remove().exec();
                });       
            }
        })
    })
},
    getInfo: function(req, res) {
        if (!req.session.mysess) {
            console.log(req.session.mysess);
            res.send({
                status: false,
                message: "Login First..!!"
            });
        } else {
            console.log("asdasd" + req.body.token);
            user.findOne({
                'token': req.body.token
            }, function(err, person) {
                if (err || !person) {
                    res.send({
                        status: false,
                        message: "Got Some Error!"
                    });
                    return false;
                } else {
                    console.log("Person logged in: " + person);
                    var user_id = person._id;
                    var user_email = person.email;
                    var phone_number = person.phone_number;
                    var final_count = 0;
                    var wallet_amount=person.wallet;
                    add_space.find({
                        user_id: person._id
                    }, function(er, doc) {
                        var i;
                        var len = doc.length;
                        for (i = 0; i < len; i++) {
                            order.count({
                                place_id: doc[i].place_id
                            }, function(er, count) {
                                if (er) {
                                    return res.send({
                                        status: false,
                                        message: "ERROR while getting the count"
                                    });
                                } else {

                                    final_count = final_count + count;
                                }
                           });
                        }
                        console.log(final_count);
                        res.send({
                            status: true,
                            f_name: person.firstname,
                            l_name: person.lastname,
                            count: final_count,
                            phone: person.phone_number,
                            email: user_email,
                            wallet:wallet_amount
                        });

                    });

                }
            });
       }
    },
    getparkingId: function(req, res) {
        // if (!req.session.mysess) {
        //     console.log(req.session.mysess);
        //     res.send({
        //         status: false,
        //         message: "Login First..!!"
        //     });
        // } else {
            console.log("hello testing"+req.body);
            req.session.placeId = req.body.placeid;
            req.session.latilong = req.body.latlng;
            req.session.TotalAmount=req.body.amount;
            req.session.totalhours=req.body.duration;
           req.session.orderId=req.body.orderId;
            //console.log("testing again111"+req.body.placeid);
            console.log("testing latlng"+req.body.latlng);

            res.send({
                status: true,
                'message': "Success"
            });
       // }


    },
    getbookingdetails: function(req, res) {
        // if (!req.session.mysess) {
        //     console.log(req.session.mysess);
        //     res.send({
        //         status: false,
        //         message: "Login First..!!"
        //     });
        // } else {


            console.log('getbookingdetails');
            res.send({
                'status': true,
                'message': "booking details",
                'startdate': req.session.startdate,
                'enddate': req.session.enddate,
                'userid': req.session.userid

            });
        //}


    },
         getallVehicleDetails:function(req,res)
        {

                var finalArr = [];
                user.findOne({token:req.body.token},function(reqz,resz)
                {
                    vehicleDtls.find({user_id:resz._id},function(err,info){
                        console.log(resz._id)
                        if (info)
                        {
                            for (var i = 0;i < info.length;i++) 
                            {
                                var finalObj =  {vehicleId:info[i]._id ,vehicleModel:info[i].vehicleModel ,vehicleNumber:info[i].vehicleNumber ,vehicleInsuranceNumber:info[i].vehicleInsuranceNumber};
                                finalArr.push(finalObj);
                            }
                            if(finalArr.length == 0){
                                res.send({status:false,message:"No vehicle found"});
                                return false;
                            }
                            res.send({status:true,vehicleDetails:finalArr})                
                        }
                        else
                        {
                            console.log(err)
                            res.send({status:false,message:"No Vehicle To Show"})
                        }
                    })                  
                })
        },

    addvehicle: function(req, res)
    {
            user.findOne({token:req.body.token},function(rez,resz)
            {
                //var userId = req.body.userid;
                vehicleDtls.find({ user_id: resz._id,vehicleNumber:req.body.vehicleNumber }, function(err, guy) 
                {
                  if(guy == null)
                  {
                    var vehicleInputs = new vehicleDtls({user_id:resz._id,vehicleModel:req.body.vehicleModel,vehicleNumber:req.body.vehicleNumber,vehicleInsuranceNumber:req.body.vehicleInsuranceNumber});
                    vehicleInputs.save(function(err,info) 
                    {
                      if (!err) {
                    var myobj = {vehicleId:info._id,vehicleInsuranceNumber:info.vehicleInsuranceNumber,vehicleModel:info.vehicleModel,vehicleNumber:info.vehicleNumber}
                        res.json({status:true,message:"Vehicle Added Successfully",vehicleId:info._id,vehicledetails:myobj});
                      } else {
                        res.json({status:false,message:"Error Occured!"});
                      }
                    });
                  }
                  else if(guy.length == 0)
                  {
                    var vehicleInputs = new vehicleDtls({user_id:resz._id,vehicleModel:req.body.vehicleModel,vehicleNumber:req.body.vehicleNumber,vehicleInsuranceNumber:req.body.vehicleInsuranceNumber});
                    vehicleInputs.save(function(err,info) 
                    {
                      if (!err) {
                var myobj = {vehicleId:info._id,vehicleInsuranceNumber:info.vehicleInsuranceNumber,vehicleModel:info.vehicleModel,vehicleNumber:info.vehicleNumber}
                        res.json({status:true,message:"Vehicle Added Successfully",vehicleId:info._id,vehicledetails:myobj});
                      } else {
                        res.json({status:false,message:"Error Occured"});
                      }
                    });
                  }
                  else if (req.body.vehicleNumber == guy[0].vehicleNumber) 
                  {
                    res.json({status:false,message:"Vehicle Already Saved"})
                  }
                });
            });
    },
    addcard: function(req, res) {
        // if (!req.session.mysess) {
        //     console.log(req.session.mysess);
        //     res.send({
        //         status: false,
        //         message: "Login First..!!"
        //     });
        // } else {
            var cardname = req.body.cName;
            var cardnumber = req.body.cNo;
            console.log(cardname);
            console.log(cardnumber);
            // cardDtls.find({ cardNumber:cardname }, function(err, guy) 
            // {
            //       //console.log(guy)
            //       if(guy == null)
            //       {
            //         var cardInputs = new cardDtls({defaultCard:"yes",cardNumber:cardnumber,expMonthYear:req.body.expiryMonthYEar});
            //         cardInputs.save(function(err,info) 
            //         {
            //           if (!err) {
            //             res.send({status:true,message:"Card Added Successfully",cardId:info._id});
            //           } else {
            //             console.log(err);
            //           }
            //         });
            //       }
            //       else if(guy.length == 0)
            //       {
            //         var cardInputs = new cardDtls({defaultCard:"yes",cardNumber:cardnumber,expMonthYear:req.body.expiryMonthYEar});
            //         cardInputs.save(function(err,info) 
            //         {
            //           if (!err) {
            //             res.send({status:true,message:"Card Added Successfully",cardnumber:info._id});
            //           } else {
            //             console.log(err);
            //           }
            //         });
            //       }
            //       else if ( cardnumber == guy[0].cardNumber) 
            //       {
            //         res.send({status:false,message:"Card Already Saved"})
            //       }
            //   });     
        //}
    },
    cnfrmotp: function(req, res) {
            var otp = req.body.otpnumber;
            console.log("OTP:" + otp);
            // console.log('lllllllllllllll'+req.session.phoneNumber)

            user.findOne({
                phone_number: req.session.phoneNumber
            }, function(err, guy) {
                if (!err && guy) {
                    console.log("nbvc" + guy)
                    //console.log(guy)
                    if (guy.otp == otp) {
                        console.log('lllllllllllllll' + req.session.phoneNumber);
                        user.findOneAndUpdate({
                                phone_number: req.session.phoneNumber
                            }, {


                                $unset: {
                                    otp: ""
                                },
                                $set: {
                                    status: "1"
                                }
                            }, {
                                new: true
                            },
                            function(errr, info) {
                                //  var imageurl = "http://192.169.164.224:8111/";
                                // if(info.image_path =="" || info.image_path== null || info.image_path == undefined){
                                //         imageurl = "";
                                // }
                                // else{
                                //         imageurl+info.image_path;
                                // }
                                var myobj = {
                                    userName: info.firstname + " " + info.lastname,
                                    userPhoneNumber: info.phone_number,
                                    userMailId: info.email,
                                    HotlineMailId: info.hotline_email_id,
                                    HotlinePhoneNumber: info.hotline_phone_number,
                                    token: info.token,
                                    imageUrl: info.imageurl
                                };
                                if (errr) {
                                    res.send({
                                        status: false,
                                        message: "Something went wrong try again"
                                    });
                                } else {
                                    res.send({
                                        status: true,
                                        message: "otp matched",
                                        userdetails: myobj
                                    });
                                }
                            })
                    } else {
                        res.json({
                            status: false,
                            message: 'OTP not matched'
                        });
                    }
                } else {
                    res.json({
                        status: false,
                        message: 'User Not Found'
                    });
                }
            });
        
    },
    cnfrmotp_signup: function(req, res) {
            var otp = req.body.otpnumber;
            console.log("OTP:" + otp);
            // console.log('lllllllllllllll'+req.session.phoneNumber)

            user.findOne({
                phone_number: req.session.phoneNumber
            }, function(err, guy) {
                if (!err && guy) {
                    console.log("nbvc" + guy)
                    //console.log(guy)
                    if (guy.otp == otp) {
                        console.log('lllllllllllllll' + req.session.phoneNumber);
                        user.findOneAndUpdate({
                                phone_number: req.session.phoneNumber
                            }, {


                                $unset: {
                                    otp: ""
                                },
                                $set: {
                                    status: "1"
                                }
                            }, {
                                new: true
                            },
                            function(errr, info) {
                                //  var imageurl = "http://192.169.164.224:8111/";
                                // if(info.image_path =="" || info.image_path== null || info.image_path == undefined){
                                //         imageurl = "";
                                // }
                                // else{
                                //         imageurl+info.image_path;
                                // }
                                var myobj = {
                                    userName: info.firstname + " " + info.lastname,
                                    userPhoneNumber: info.phone_number,
                                    userMailId: info.email,
                                    HotlineMailId: info.hotline_email_id,
                                    HotlinePhoneNumber: info.hotline_phone_number,
                                    token: info.token,
                                    imageUrl: info.imageurl
                                };
                                if (errr) {
                                    res.send({
                                        status: false,
                                        message: "Something went wrong try again"
                                    });
                                } else {
                                    res.send({
                                        status: true,
                                        message: "otp matched",
                                        userdetails: myobj
                                    });
                                }
                            })
                    } else {
                        res.json({
                            status: false,
                            message: 'OTP not matched'
                        });
                    }
                } else {
                    res.json({
                        status: false,
                        message: 'User Not Found'
                    });
                }
            });
        
    },
    frgt_passwd: function(req, res) {
        if (req.session.mysess) {
            console.log(req.session.mysess);
            res.send({
                status: false,
                message: "Oops! You are Already logged in"
            });
        } else {
            function randomString(length, chars) {
                var result = '';
                for (var i = length; i > 0;i--) result += chars[Math.round(Math.random() * (chars.length - 1))];
                return result;
            }
            // var user_email = req.session.mysess;
            var user_phone;
            req.session.phoneNumber=req.body.phone_number;
            console.log("phone_number" + req.session.phone)
            user.find({
                phone_number: req.body.phone_number
            }, function(err, docs) {
                if (err) {
                    res.send({
                        status: false,
                        message: "Something went wrong Try Again"
                    })
                } else {
                    user_phone = req.body.phone_number;
                    console.log(user_phone)
                    var otp_gen = randomString(5, '0123456789');
                    //console.log(otp_gen)
                    user.findOneAndUpdate({
                            phone_number: user_phone
                        }, {
                            otp: "12345" /* otp_gen*/ ,
                            status: "0"
                        }, {
                            new: true
                        },
                        function(errs, sdoc) {
                            console.log(sdoc)
                            if (!sdoc) {
                                res.json({
                                    status: false,
                                    message: "Phone Number Not Available"
                                });
                            } else {
                                client.sendMessage({
                                        to: "+918217641688" /* user_phone*/ ,
                                        from: '+16176525030',
                                        body: 'One time Password for forgot password : ' + otp_gen
                                    },
                                    function(erwr, data) {
                                        if (erwr) {
                                            res.json({
                                                status: false,
                                                message: "Otp Not Send"
                                            });
                                            return false;
                                        }
                                        res.json({
                                            status: true,
                                            message: "Otp Successfully Send"
                                        });
                                          console.log(data);
                                    });

                            }
                        });
                }

            });
        }
    },
    rst_pwd1: function(req, res) {
        if (!req.session.mysess) {
            console.log(req.session.mysess);
            res.send({
                status: false,
                message: "First Login"
            });
        } else {
            var new_passwd = req.body.new_pass;
            var new_passwd_encpt = encryptor.encrypt(new_passwd);
            console.log("mmmmmmmmmmmmmmmmmmm" + new_passwd_encpt)
            console.log(new_token)
            user.findOne({
                token: new_token
            }, function(err, guy) {
                if (!err && guy) {
                    user.findOneAndUpdate({
                            token: new_token
                        }, {
                            password: new_passwd_encpt
                        }, {
                            new: true
                        },
                        function(errr, info) {
                            console.log(info)
                            if (errr) {
                                res.send({
                                    status: false,
                                    message:errr
                                });
                            } else {
                                
                                res.send({
                                    status: true,
                                    message:'Successfully updated'
                                });
                            }
                            console.log("aaaaaaaaaa" + info.password);
                        })

                } else {
                    res.json({
                        status: false,
                        message: 'User Not Found'
                    });
                }
            });
        }
    },
    rst_pwd_signup: function(req, res) {
        if (req.session.mysess) {
            console.log(req.session.mysess);
            res.send({
                status: false,
                message: "your logged in"
            });
        } else {
            var new_passwd = req.body.new_pass;
            console.log('new password'+new_passwd);
            var new_passwd_encpt = encryptor.encrypt(new_passwd);
            console.log("mmmmmmmmmmmmmmmmmmm" + new_passwd_encpt)
            user.findOne({
                phone_number: req.session.phoneNumber
            }, function(err, guy) {
                if (!err && guy) {
                    user.findOneAndUpdate({
                            phone_number: req.session.phoneNumber
                        }, {
                            password: new_passwd_encpt
                        }, {
                            new: true
                        },
                        function(errr, info) {
                            console.log(info)
                            if (errr) {
                                res.send({
                                    status: false,
                                    message:'Sorry,Password not updated'
                                });
                            } else {
                                
                                res.send({
                                    status: true,
                                    message:'Successfully updated'
                                });
                            }
                            console.log("aaaaaaaaaa" + info.password);
                        })

                } else {
                    res.json({
                        status: false,
                        message: 'User Not Found'
                    });
                }
            });
        }
    },
    getallSpaces:function(req,res)
        {
            var current = moment();
            // var offset = 5+7; // 5 hours for IST and 7 hours for MST
            // current.setHours(current.getHours() + offset);
            // current.setMinutes(current.getMinutes() + 30);
            console.log('current_timestamp->'+current);

            user.findOne({token:req.body.token},function(rez,resz){
                if(rez||!user)
                {
                    res.send({status:false,message:"Error:No user Found"});
                    return false;
                }
                else
                {
                    var mySpaceDetails = [];
                    var upcoming_booking = [];
                    var past_booking = [];
                    var userId = resz._id;  
                    add_space.find({user_id:userId},function(err,space){
                        var i = space.length - 1;
                        justanotherfunction(i);
                        function justanotherfunction(i)
                        {
                            if(i==-1)
                            {
                                if(mySpaceDetails.length==0)
                                {
                                    res.send({status:false,message:"Sorry,No Results Found!"});
                                }
                                /*else if(upcoming_booking.length==0&&past_booking.length==0)
                                {
                                    res.send({status:true,message:"success",mySpaceDetails:mySpaceDetails});
                                }
                                else if(upcoming_booking.length==0)
                                {
                                    res.send({status:true,message:"success",mySpaceDetails:mySpaceDetails,spaceListReceivedBooking:{"bookingListPast":past_booking}});
                                }
                                else if(past_booking.length==0)
                                {
                                    res.send({status:true,message:"success",mySpaceDetails:mySpaceDetails,spaceListReceivedBooking:{"bookingListUpcoming":upcoming_booking}});
                                }*/
                                else
                                {
                                    res.send({status:true,message:"List Of Spaces",mySpaceDetails:mySpaceDetails,spaceListReceivedBooking:{"bookingListUpcoming":upcoming_booking,"bookingListPast":past_booking}});
                                }
                            }
                            else
                            {
                                spot.find({place_id:space[i]._id},function(err1,spots){
                                    var k=spots.length-1;
                                    var spot = [];                          
                                    getspots(k);
                                    function getspots(k)
                                    {
                                        if(k!=-1)
                                        {
                                            spot.push(spots[k].spotStickerId);
                                            getspots(k-1);
                                        }
                                        else
                                        {
                                            // var prices=space[i].hourly+'/hr,'+space[i].daily+'/hr,'+space[i].weekly+'/hr';
                                            var t_latlong=space[i].latlong[1]+',';
                                             t_latlong+=space[i].latlong[0];
                                             /*t_latlong.reverse();*/
                                             console.log(t_latlong);
                                             var parkingType = space[i].parking_type;//.split(',');
                                             var surfaceMaterial = space[i].surfaceMaterial;//.split(',');
                                             var amenties = space[i].amenties.split(',');
                                             var myobj = {userName:resz.firstname +" "+resz.lastname,userPhoneNumber:resz.phone_number,userMailId:resz.email,HotlineMailId:resz.hotline_email_id,HotlinePhoneNumber:resz.hotline_phone_number,ProfileImageUrl:resz.image_path};
                                            if(space[i].markerStatus==true)
                                            {
                                                 var myplace = {'mySpaceId':space[i]._id,
                                                'availableStatus':space[i].available_status,
                                                'statusFromHasty':'waiting for hasty approval',
                                                'mySpaceName':space[i].title,
                                                'markerIds':spot,
                                                'latLong':t_latlong,
                                                'locationName':space[i].location,
                                                'hourly':space[i].hourly,
                                                'daily':space[i].daily,
                                                'weekly':space[i].weekly,
                                                'monthly':space[i].monthly,
                                                'parkingType':parkingType,
                                                'parkingSpaceType':space[i].space_type,
                                                'parkingAreaType':space[i].parkingAreaType,
                                                'amentities':amenties,
                                                'isThisSpaceDelinated':space[i].space_delinated,
                                                'description':space[i].description,
                                                'imageLink':space[i].spotimage,
                                                'dimensionOfSpace':space[i].dimensionOfSpace,
                                                'surfaceMaterial':surfaceMaterial                                           
                                                

                                                }
                                            }
                                            else
                                            {
                                                 var myplace = {'mySpaceId':space[i]._id,
                                                'availableStatus':space[i].available_status,
                                                'statusFromHasty':'waiting for hasty approval',
                                                'mySpaceName':space[i].title,
                                                'spotStickerIds':spot,
                                                'latLong':t_latlong,
                                                'locationName':space[i].location,
                                                'hourly':space[i].hourly,
                                                'daily':space[i].daily,
                                                'weekly':space[i].weekly,
                                                'monthly':space[i].monthly,
                                                'parkingType':parkingType,
                                                'parkingSpaceType':space[i].space_type,
                                                'parkingAreaType':space[i].parkingAreaType,
                                                'amentities':amenties,
                                                'isThisSpaceDelinated':space[i].space_delinated,
                                                'description':space[i].description,
                                                'imageLink':space[i].spotimage,
                                                'dimensionOfSpace':space[i].dimensionOfSpace,
                                                'surfaceMaterial':surfaceMaterial                                       
                                                }
                                            }
                                            
                                            mySpaceDetails.push(myplace);
                                            
                                            order.find({place_id:space[i]._id,orderStatus:{$ne:"cancelled"}},function(err2,orders){
                                                
                                                var j=orders.length - 1;
                                                getorders(j);
                                                function getorders(j)
                                                {
                                                    if(j!=-1)
                                                    {
                                                        console.log("j"+j);
                                                        console.log(orders[j]);
                                                        var start = moment(orders[j].start_timestamp);
                                                        var end = moment(orders[j].end_timestamp);                                                      
                                                        user.findOne({_id:orders[j].user_id},function(err,userdtls)
                                                            {
                                                                if(err)
                                                                {
                                                                    res.send({status:false,'message':"user_not_found"});
                                                                }
                                                                else
                                                                {
                                                                        console.log('userdtls-->'+userdtls);
                                                                        var imageurl = "http://192.169.164.224:8111/";
                                                                        if(userdtls.image_path =="" || userdtls.image_path== null || userdtls.image_path == undefined){
                                                                            imageurl = "" 
                                                                        }
                                                                        else{
                                                                            var imageurl = imageurl+userdtls.image_path;
                                                                        }
                                                                        var myobj = {userName:userdtls.firstname +" "+userdtls.lastname,userPhoneNumber:userdtls.phone_number,userMailId:userdtls.email,HotlineMailId:userdtls.hotline_email_id,HotlinePhoneNumber:userdtls.hotline_phone_number,imageUrl:imageurl,token:userdtls.token};
                                                                                                                                if(moment(orders[j].end_timestamp)>current && orders[j].orderStatus!='cancelled')
                                                        {

                                                            if(space[i].markerStatus==true)
                                                            {
                                                                var order_temp=
                                                                {
                                                                      'bookingId':orders[j]._id,
                                                                      'mySpaceId':space[i]._id,
                                                                      'mySpaceName':space[i].title,
                                                                      'latLong':t_latlong,
                                                                      'locationName':space[i].location,
                                                                      'markerId':orders[j].spotStickerId,
                                                                      'start':start,
                                                                      'end':end,
                                                                      'orderStatus':orders[j].orderStatus,
                                                                      'duration':orders[j].duration,
                                                                      'paidAmount':Math.round(orders[j].totalAmount),
                                                                      'customerCarNumber':orders[j].vehicleNumber,
                                                                      'customerCarModelnumber':orders[j].vehicleModel,
                                                                      'customerInsuranceNumber':orders[j].vehicleInsuranceNumber,
                                                                      'userdetails':myobj
                                                                }
                                                            }
                                                            else
                                                            {
                                                                var order_temp=
                                                                {
                                                                      'bookingId':orders[j]._id,
                                                                      'mySpaceId':space[i]._id,
                                                                      'mySpaceName':space[i].title,
                                                                      'latLong':t_latlong,
                                                                      'locationName':space[i].location,
                                                                      'spotStickerId':orders[j].spotStickerId,
                                                                      'start':start,
                                                                      'end':end,
                                                                      'orderStatus':orders[j].orderStatus,
                                                                      'duration':orders[j].duration,
                                                                      'paidAmount':Math.round(orders[j].totalAmount),
                                                                      'customerCarNumber':orders[j].vehicleNumber,
                                                                      'customerCarModelnumber':orders[j].vehicleModel,
                                                                      'customerInsuranceNumber':orders[j].vehicleInsuranceNumber,
                                                                      'userdetails':myobj
                                                                }
                                                            }
                                                            upcoming_booking.push(order_temp);
                                                        }
                                                        else
                                                        {
                                                            
                                                             if(space[i].markerStatus==true)
                                                             {
                                                                var order_temp=
                                                                {
                                                                      'bookingId':orders[j]._id,
                                                                      'mySpaceId':space[i]._id,
                                                                      'mySpaceName':space[i].title,
                                                                      'latLong':t_latlong,
                                                                      'locationName':space[i].location,
                                                                      'markerId':orders[j].spotStickerId,
                                                                      'start':start,
                                                                      'end':end,
                                                                      'orderStatus':orders[j].orderStatus,
                                                                      'duration':orders[j].duration,
                                                                      'paidAmount':Math.round(orders[j].totalAmount),
                                                                      'customerCarNumber':orders[j].vehicleNumber,
                                                                      'customerCarModelnumber':orders[j].vehicleModel,
                                                                      'customerInsuranceNumber':orders[j].vehicleInsuranceNumber,
                                                                      'userdetails':myobj
                                                                };
                                                             }  
                                                             else
                                                             {
                                                                var order_temp=
                                                                {
                                                                      'bookingId':orders[j]._id,
                                                                      'mySpaceId':space[i]._id,
                                                                      'mySpaceName':space[i].title,
                                                                      'latLong':t_latlong,
                                                                      'locationName':space[i].location,
                                                                      'spotStickerId':orders[j].spotStickerId,
                                                                      'start':start,
                                                                      'end':end,
                                                                      'orderStatus':orders[j].orderStatus,
                                                                      'duration':orders[j].duration,
                                                                      'paidAmount':Math.round(orders[j].totalAmount),
                                                                      'customerCarNumber':orders[j].vehicleNumber,
                                                                      'customerCarModelnumber':orders[j].vehicleModel,
                                                                      'customerInsuranceNumber':orders[j].vehicleInsuranceNumber,
                                                                      'userdetails':myobj
                                                                };
                                                             }
                                                            past_booking.push(order_temp);
                                                        }
                                                        getorders(j-1);


                                                                }
                                                            });


                                                    }
                                                    else
                                                    {
                                                        justanotherfunction(i-1);
                                                    }
                                                }
                                            });
                                        }
                                    }
                                });                                         
                            }
                        }
                    }); 
                }       
            });
        },
    // getallSpaces:function(req,res)
    // {
    //     console.log('aaaaaaaaaaaaa');
    //     var current = new Date();
    //     var offset = 5+7; // 5 hours for IST and 7 hours for MST
    //     current.setHours(current.getHours() + offset);
    //     current.setMinutes(current.getMinutes() + 30);
    //     console.log('current_timestamp->'+current);

    //     user.findOne({token:req.body.token},function(rez,resz){
    //         if(rez||!user)
    //         {
    //             res.send({status:false,message:"Error:No user Found"});
    //             return false;
    //         }
    //         else
    //         {
    //             var mySpaceDetails = [];
    //             var upcoming_booking = [];
    //             var past_booking = [];
    //             var userId = resz._id;  
    //             add_space.find({user_id:userId},function(err,space){
    //                 var i = space.length - 1;
    //                 justanotherfunction(i);
    //                 function justanotherfunction(i)
    //                 {
    //                     if(i==-1)
    //                     {
    //                         if(mySpaceDetails.length==0)
    //                         {
    //                             res.send({status:false,message:"Sorry,No Results Found!"});
    //                         }
    //                         else
    //                         {
    //                             console.log('past-->'+past_booking.length+' upcoming-->'+upcoming_booking.length)
    //                             res.send({status:true,message:"success",mySpaceDetails:mySpaceDetails,spaceListReceivedBooking:{"bookingListUpcoming":upcoming_booking,"bookingListPast":past_booking}});
    //                         }
    //                     }
    //                     else
    //                     {
    //                         spot.find({place_id:space[i]._id},function(err1,spots){
    //                             var k=spots.length-1;
    //                             var spot = [];                          
    //                             getspots(k);
    //                             function getspots(k)
    //                             {
    //                                 if(k!=-1)
    //                                 {
    //                                     spot.push(spots[k].spotStickerId);
    //                                     getspots(k-1);
    //                                 }
    //                                 else
    //                                 {
    //                                     // var prices=space[i].hourly+'/hr,'+space[i].daily+'/hr,'+space[i].weekly+'/hr';
    //                                     var t_latlong=space[i].latlong[1]+',';
    //                                      t_latlong+=space[i].latlong[0];
    //                                      /*t_latlong.reverse();*/
    //                                      console.log(t_latlong)
    //                                      var myobj = {userName:resz.firstname +" "+resz.lastname,userPhoneNumber:resz.phone_number,userMailId:resz.email,HotlineMailId:resz.hotline_email_id,HotlinePhoneNumber:resz.hotline_phone_number,ProfileImageUrl:resz.image_path};
    //                                     if(space[i].markerStatus==true)
    //                                     {
    //                                          var myplace = {'mySpaceId':space[i]._id,
    //                                         'availableStatus':space[i].available_status,
    //                                         'statusFromHasty':'waiting for hasty approval',
    //                                         'mySpaceName':space[i].title,
    //                                         'markerIds':spot,
    //                                         'latLong':t_latlong,
    //                                         'locationName':space[i].location,
    //                                         'hourly':space[i].hourly,
    //                                         'daily':space[i].daily,
    //                                         'weekly':space[i].weekly,
    //                                         'monthly':space[i].monthly,
    //                                         'parkingType':space[i].parking_type,
    //                                         'parkingSpaceType':space[i].space_type,
    //                                         'parkingAreaType':space[i].parkingAreaType,
    //                                         'amentities':space[i].amenties,
    //                                         'isThisSpaceDelinated':space[i].space_delinated,
    //                                         'description':space[i].description,
    //                                         'imageLink':space[i].spotimage
                                            

    //                                         }
    //                                     }
    //                                     else
    //                                     {
    //                                          var myplace = {'mySpaceId':space[i]._id,
    //                                         'availableStatus':space[i].available_status,
    //                                         'statusFromHasty':'waiting for hasty approval',
    //                                         'mySpaceName':space[i].title,
    //                                         'spotStickerIds':spot,
    //                                         'latLong':t_latlong,
    //                                         'locationName':space[i].location,
    //                                         'hourly':space[i].hourly,
    //                                         'daily':space[i].daily,
    //                                         'weekly':space[i].weekly,
    //                                         'monthly':space[i].monthly,
    //                                         'parkingType':space[i].parking_type,
    //                                         'parkingSpaceType':space[i].space_type,
    //                                         'parkingAreaType':space[i].parkingAreaType,
    //                                         'amentities':space[i].amenties,
    //                                         'isThisSpaceDelinated':space[i].space_delinated,
    //                                         'description':space[i].description,
    //                                         'imageLink':space[i].spotimage
    //                                         }
    //                                     }
                                        
    //                                     mySpaceDetails.push(myplace);
                                        
    //                                     order.find({place_id:space[i]._id},function(err2,orders){
    //                                         var j=orders.length - 1;
    //                                         getorders(j);
    //                                         function getorders(j)
    //                                         {
    //                                             if(j!=-1)
    //                                             {
    //                                                 console.log("j"+j);
    //                                                 console.log(orders[j]);
    //                                                 var myDate = new Date(orders[j].start_timestamp);
    //                                                     var dd = myDate.getDate();
    //                                                     var mm = myDate.getMonth()+1; //January is 0!
    //                                                     var yyyy = myDate.getFullYear();
    //                                                     if(dd<10)
    //                                                     {
    //                                                         dd='0'+dd;
    //                                                     } 
    //                                                     if(mm<10)
    //                                                     {
    //                                                         mm='0'+mm;
    //                                                     } 
    //                                                     var hh = myDate.getHours();
    //                                                     var Mm = myDate.getMinutes();
    //                                                     if(hh<10)
    //                                                     {
    //                                                         hh='0'+hh;
    //                                                     } 
    //                                                     if(Mm<10)
    //                                                     {
    //                                                         Mm='0'+Mm;
    //                                                     }
    //                                                     var startTime = hh+':'+Mm;
    //                                                     var myDate = new Date(orders[j].end_timestamp);
    //                                                     var dd = myDate.getDate();
    //                                                     var mm = myDate.getMonth()+1; //January is 0!
    //                                                     var yyyy = myDate.getFullYear();
    //                                                     if(dd<10)
    //                                                     {
    //                                                         dd='0'+dd;
    //                                                     } 
    //                                                     if(mm<10)
    //                                                     {
    //                                                         mm='0'+mm;
    //                                                     } 
    //                                                     var hh = myDate.getHours();
    //                                                     var Mm = myDate.getMinutes();
    //                                                     if(hh<10)
    //                                                     {
    //                                                         hh='0'+hh;
    //                                                     } 
    //                                                     if(Mm<10)
    //                                                     {
    //                                                         Mm='0'+Mm;
    //                                                     }
    //                                                     var endTime = hh+':'+Mm;
    //                                                     var startDate = dd+'/'+mm+'/'+yyyy;
    //                                                     // var endDate = "asd";
    //                                                     var myDate = new Date(orders[j].end_timestamp);
    //                                                     var dd = myDate.getDate();
    //                                                     var mm = myDate.getMonth()+1; //January is 0!
    //                                                     var yyyy = myDate.getFullYear();
    //                                                     if(dd<10)
    //                                                     {
    //                                                       dd='0'+dd;
    //                                                     }   
    //                                                     if(mm<10)
    //                                                     {
    //                                                         mm='0'+mm;
    //                                                     } 
    //                                                     endDate = dd+'/'+mm+'/'+yyyy;
    //                                                 if(orders[j].end_timestamp>current && orders[j].paymentStatus!='cancelled')
    //                                                 {
    //                                                     if(space[i].markerStatus==true)
    //                                                     {
    //                                                         var order_temp=
    //                                                         {
    //                                                               'bookingId':orders[j]._id,
    //                                                               'mySpaceId':space[i]._id,
    //                                                               'mySpaceName':space[i].title,
    //                                                               'latLong':t_latlong,
    //                                                               'locationName':space[i].location,
    //                                                               'markerId':orders[j].spotStickerId,
    //                                                               'startDate':startDate,
    //                                                               'endDate':endDate,
    //                                                               'startTime':startTime,
    //                                                               'endTime':endTime,
    //                                                               'duration':orders[j].duration,
    //                                                               'paidAmount':Math.round(orders[j].Amount),
    //                                                               'customerCarNumber':orders[j].vehicleNumber,
    //                                                               'customerCarModelnumber':orders[j].vehicleModel,
    //                                                               'customerInsuranceNumber':orders[j].vehicleInsuranceNumber,
    //                                                               'userdetails':myobj
    //                                                         }
    //                                                     }
    //                                                     else
    //                                                     {
    //                                                         var order_temp=
    //                                                         {
    //                                                               'bookingId':orders[j]._id,
    //                                                               'mySpaceId':space[i]._id,
    //                                                               'mySpaceName':space[i].title,
    //                                                               'latLong':t_latlong,
    //                                                               'locationName':space[i].location,
    //                                                               'spotStickerId':orders[j].spotStickerId,
    //                                                               'startDate':startDate,
    //                                                               'endDate':endDate,
    //                                                               'startTime':startTime,
    //                                                               'endTime':endTime,
    //                                                               'duration':orders[j].duration,
    //                                                               'paidAmount':Math.round(orders[j].Amount),
    //                                                               'customerCarNumber':orders[j].vehicleNumber,
    //                                                               'customerCarModelnumber':orders[j].vehicleModel,
    //                                                               'customerInsuranceNumber':orders[j].vehicleInsuranceNumber,
    //                                                               'userdetails':myobj
    //                                                         }
    //                                                     }
    //                                                     upcoming_booking.push(order_temp);
    //                                                 }
    //                                                 else
    //                                                 {
                                                        
    //                                                      if(space[i].markerStatus==true)
    //                                                      {
    //                                                         var order_temp=
    //                                                         {
    //                                                               'bookingId':orders[j]._id,
    //                                                               'mySpaceId':space[i]._id,
    //                                                               'mySpaceName':space[i].title,
    //                                                               'latLong':t_latlong,
    //                                                               'locationName':space[i].location,
    //                                                               'markerId':orders[j].spotStickerId,
    //                                                               'startDate':startDate,
    //                                                               'endDate':endDate,
    //                                                               'startTime':startTime,
    //                                                               'endTime':endTime,
    //                                                               'duration':orders[j].duration,
    //                                                               'paidAmount':Math.round(orders[j].Amount),
    //                                                               'customerCarNumber':orders[j].vehicleNumber,
    //                                                               'customerCarModelnumber':orders[j].vehicleModel,
    //                                                               'customerInsuranceNumber':orders[j].vehicleInsuranceNumber,
    //                                                               'userdetails':myobj
    //                                                         };
    //                                                      }  
    //                                                      else
    //                                                      {
    //                                                         var order_temp=
    //                                                         {
    //                                                               'bookingId':orders[j]._id,
    //                                                               'mySpaceId':space[i]._id,
    //                                                               'mySpaceName':space[i].title,
    //                                                               'latLong':t_latlong,
    //                                                               'locationName':space[i].location,
    //                                                               'spotStickerId':orders[j].spotStickerId,
    //                                                               'startDate':startDate,
    //                                                               'endDate':endDate,
    //                                                               'startTime':startTime,
    //                                                               'endTime':endTime,
    //                                                               'duration':orders[j].duration,
    //                                                               'paidAmount':Math.round(orders[j].Amount),
    //                                                               'customerCarNumber':orders[j].vehicleNumber,
    //                                                               'customerCarModelnumber':orders[j].vehicleModel,
    //                                                               'customerInsuranceNumber':orders[j].vehicleInsuranceNumber,
    //                                                               'userdetails':myobj
    //                                                         };
    //                                                      }
    //                                                     past_booking.push(order_temp);
    //                                                 }
    //                                                 getorders(j-1);
    //                                             }
    //                                             else
    //                                             {
    //                                                 justanotherfunction(i-1);
    //                                             }
    //                                         }
    //                                     });
    //                                 }
    //                             }
    //                         });                                         
    //                     }
    //                 }
    //             }); 
    //         }       
    //     });
 // },
//   cancelBooking: function(req,res)
//  {
//     console.log(req.body)
//     user.findOne({token:req.body.token},function(err,user_details){
//         if(err)
//         {
//             res.send({status:false,message:"Some Error Occured"});
//             return false;
//         }
//         else
        
//         {
//             order.findOne({'user_id':req.session.userid,'place_id':req.session.placeId,'_id':req.session.orderId,'extendedStatus':null,'paymentStatus':{$ne:"cancelled"}},function(err1,docs){
//                 if(err1||!docs)
//                 {
//                     res.send({status:false, message:"No Entries Found!"});
//                 }
//                 else
//                 {
                
//                     docs.paymentStatus = "cancelled";
//                     docs.save(function(err2){
//                         if(err2)
//                         {
//                             res.send({status:false,message:"Error Occured!!"});
//                             return false;
//                         }
//                         else
//                         {
//                             res.send({status:true,message:"Booking cancelled"});
//                         }
//                     });
//                 }
//             });
//         }
//     });
// },
cancelBooking: function(req,res)
        {

            console.log(req.body)
            user.findOne({token:req.body.token},function(err,user_details){
                if(err)
                {
                    res.send({status:false,message:"Some Error Occured"});
                    return false;
                }
                else
                {
                    order.findOne({'user_id':user_details._id,'place_id':req.session.placeId,'_id':req.session.orderId,'extendedStatus':null,'orderStatus':{$ne:"cancelled"}},function(err1,docs){
                        if(err1||!docs)
                        {
                            res.send({status:false, message:"No Entries Found!"});
                        }
                        else
                        {   console.log('order-->'+docs);
                            // console.log(docs);
                            var startTime = moment(docs.start_timestamp);
                            console.log("StartTime"+startTime.format());
                            var endTime = moment(docs.end_timestamp);
                            console.log("EndTime"+endTime.format());
                            var diff = endTime - startTime;
                            diff = diff/3600000;
                            var current = moment();                  
                            // var offset = 5+7; // 5 hours for IST and 7 hours for MST
                            // current.setHours(current.getHours() + offset);
                            // current.setMinutes(current.getMinutes() + 30);
                            var startCurrentDiff = (startTime - current)/3600000;
                            console.log("Total Hours"+diff);
                            console.log("start Current Diff"+startCurrentDiff); 
                            var wh=168,dh=24,mh=720;
                           
                            if(docs.totalAmount)
                            {
                                amount = docs.totalAmount;
                            }
                            else
                            {
                                amount = docs.Amount;
                            }
                            if(diff>=mh || diff>=wh)
                            {
                                console.log("Monthly/Weekly");
                                if(startCurrentDiff>=48)
                                {
                                    var amountRefunded = Math.round((94/100)*(amount/2));
                                    res.send({status:true,message:"Booking Cancelled and 50% of the amount has been refunded to your wallet.Note:6% Service fee has also been deducted",totalAmountPaid:amount,amountRefunded:amountRefunded});
                                }   
                                else
                                {
                                    console.log("No refund");
                                    res.send({status:false,message:"No refund will be Provided",totalAmountPaid:amount,amountRefunded:0});
                                }
                            }
                            else
                            {
                                console.log("Hourly/Daily");
                                if(startCurrentDiff>=24)
                                {
                                    var amountRefunded = Math.round((94/100)*amount);
                                    res.send({status:true,message:"Booking Cancelled and 100% of the amount has been refunded to your wallet.Note:6% Service fee has also been deducted",totalAmountPaid:amount,amountRefunded:amountRefunded});
                                }
                                else
                                {
                                    console.log("No Refund");
                                    res.send({status:false,message:"No refund will be Provided",totalAmountPaid:amount,amountRefunded:0});
                                }
                            }
                        }
                    });
                }
            });
        },
confirmcancel:function(req,res)
{
    user.findOne({token:req.body.token},function(err,user_details){
        if(err)
        {
            res.send({status:false,message:"Some Error Occured"});
            return false;
        }
        else
        {
            user_details.wallet = parseInt(user_details.wallet) + parseInt(Math.round(94/100*(amount/2)));
            user_details.save(function(error){
                if(error)
                {
                    res.send({status:false,message:"error Occured"});
                    return false;
                }
                else
                {
                    console.log('order Id-->'+req.session.orderId);
                    order.findOne(
                        {
                            'user_id':user_details._id,
                            'place_id':req.session.placeId,
                            '_id':req.session.orderId,
                            'extendedStatus':null,
                            'orderStatus':{$ne:"cancelled"}
                        },
                        function(err1,docs){
                            if(err1||!docs)
                            {
                                res.send({status:false, message:"No Entries Found!"});
                            }
                            else
                            {
                                console.log("48 difference");
                                docs.orderStatus = "cancelled";
                                docs.save(function(err2){
                                    if(err2)
                                    {
                                        res.send({status:false,message:"Error Occured!!"});
                                        return false;
                                    }
                                    else
                                    {
                                        res.send({status:true,message:"Booking Cancelled ",wallet:user_details.wallet});
                                    }
                                });
                            }
                    });
                }
            })
        }
    
    });
},
getOrderId:function(req,res)
{
    var orderId = req.session.orderId;
    console.log("ORDER ID GETORDERID"+orderId);
    res.send({status:true,'orderId':orderId});
},
getparkingdetails: function(req, res) {
        // if (!req.session.mysess) {
        //     console.log(req.session.mysess);
        //     res.send({
        //         status: false,
        //         message: "Login First..!!"
        //     });
        // } else 
        // {

            var placeId = req.session.placeId;
            console.log("kittu"+placeId);
            var LatLong = req.session.latilong;
             var arr = [];
                        var str = LatLong.split(',');
                        arr[0] = str[0];
                        arr[1] = str[1];
                        console.log('getting latitude and longitude'+arr[0]+" "+arr[1]);
                        console.log('de'+arr);

            add_space.find({
                '_id': placeId,
                'latlong': arr
            }, function(err, docs) {
                console.log(docs.length);
                console.log('llllll'+docs);
                if (err) {
                    return res.send({
                        status: false,
                        message: "Got some Error!"
                    });
                }

                if (docs.length == 0) {

                    res.send({
                        'status': false,
                        "message": "No space found"
                    });
                } else if (docs.length > 0) {
                    console.log("hhhhhhhh" + docs);

                    console.log('total hours-->'+req.session.totalhours);
                    console.log('docs-->'+docs.length);
                    res.send({
                        'status': true,
                        'message': "space details",
                        'startdate': req.session.startdate,
                        'enddate': req.session.enddate,
                        'userid': req.session.userid,
                        'amount':req.session.TotalAmount,
                        'duration':req.session.totalhours,
                        'Searched_details': docs
                    });
                }


            });
       // }
    },
getUpcomingPastDetails:function(req,res)
{
    console.log('called getUpcomingPastDetails ');
      var current_timestamp=new Date();
      var offset = 5+7; // 5 hours for IST and 7 hours for MST
      current_timestamp.setHours(current_timestamp.getHours() + offset);
      current_timestamp.setMinutes(current_timestamp.getMinutes() + 30);
      console.log('current_timestamp->'+current_timestamp);
      console.log(req.session.userid);
      user.findOne({_id:req.session.userid},function(rez,resz){
        if(resz==null || rez)
        {
            res.send({status:false,'message':'not found'});
            return false;
        }
        console.log(resz._id);
        var myobj = {userName:resz.firstname +" "+resz.lastname,userPhoneNumber:resz.phone_number,userMailId:resz.email,HotlineMailId:resz.hotline_email_id,HotlinePhoneNumber:resz.hotline_phone_number,ProfileImageUrl:resz.image_path};
        order.find({'user_id':resz._id,'extendedStatus':null},function(err,info){
            if(err) 
            {
               return res.send({status:false,'message':err});
            }
            else if(info.length==0 || info==null)
            {
              return res.send({status:false,'message':'No data available'});
            }
            else
            {
                var booking_list_past=[];
                var booking_list_upcoming=[];
                var m = info.length-1;
                console.log(m);
                checkit(m);
                function checkit(m)
                {
                    if(m==-1)
                    {
                        console.log('upcoming-->'+booking_list_upcoming.length+' past-->'+booking_list_past.length);
                        res.send({status:true,message:"success","bookingDetails":{"bookingListUpcoming":booking_list_upcoming,"bookingListPast":booking_list_past}});
                    }
                    else
                    {
                        console.log('Info'+info[m].place_id);
                           add_space.findOne({'_id':info[m].place_id}).exec(function(err2,space){
                            if((err2 || space==null))
                            {
                                console.log('place id-->'+info[m].place_id);
                                console.log('space-->'+space);
                                res.send({status:false,message:' no upcoming and past details'});
                                return false;
                            }
                            //calculating date

                            var myDate = new Date(info[m].start_timestamp);

                              var dd = myDate.getDate();
                              var mm = myDate.getMonth()+1; //January is 0!
                              var yyyy = myDate.getFullYear();
                              if(dd<10){
                                  dd='0'+dd;
                              } 
                              if(mm<10){
                                  mm='0'+mm;
                              } 
                              var hh = myDate.getHours();
                              var Mm = myDate.getMinutes();
                              if(hh<10){
                                  hh='0'+hh;
                              } 
                              if(Mm<10){
                                     Mm='0'+Mm;
                              }
                              var startTime = hh+':'+Mm;
                              var startDate = dd+'/'+mm+'/'+yyyy;

                              var myDate1 = new Date(info[m].end_timestamp);
                              var dd1 = myDate1.getDate();
                              var mm1 = myDate1.getMonth()+1; //January is 0!
                              var yyyy1 = myDate1.getFullYear();
                              if(dd1<10){
                                  dd1='0'+dd1;
                              } 
                              if(mm1<10){
                                  mm1='0'+mm1;
                              } 
                              var hh1 = myDate1.getHours();
                              var Mm1 = myDate1.getMinutes();
                              if(hh1<10){
                                  hh1='0'+hh1;
                              } 
                              if(Mm1<10){
                                  Mm1='0'+Mm1;
                              }
                              var endTime = hh1+':'+Mm1;
                              var endDate = dd1+'/'+mm1+'/'+yyyy1;

                              var latlong = space.latlong[1] + ',' + space.latlong[0];
                              console.log(new Date(info[m].end_timestamp)>current_timestamp && info[m].orderStatus!="cancelled");
                            if(new Date(info[m].end_timestamp)>current_timestamp && info[m].orderStatus!="cancelled")
                            {
                                if(space.markerStatus==true)
                                {
                                    console.log('Location Name-->'+info[m]._id);
                                    console.log('upcoming + 2');
                                    var order =
                                    {
                                        'bookingId':info[m]._id,
                                        'bookingStatus':'Upcoming',
                                        'parkingPlaceName':space.location,
                                        'mySpaceName':space.title,
                                        'latLong':latlong,
                                        'placeId':info[m].place_id,
                                        'markerId': info[m].spotStickerId,
                                        'startDate':startDate,
                                        'endDate':endDate,
                                        'startTime':startTime,
                                        'endTime':endTime,
                                        'hourly':info[m].hourly,
                                        'daily':space.daily,
                                        'weekly':space.weekly,
                                        'monthly':space.monthly,
                                        'amount':Math.round(info[m].totalAmount),
                                        'parkingType':space.parking_type,
                                        'parkingSpaceType':space.space_type,
                                        'amentities':space.amenties,
                                        'parkingAreaType':space.parkingAreaType,
                                        'isThisSpaceDelinated':space.space_delinated,
                                        'description':space.description,
                                        'userdetails':myobj
                                    }
                                }
                                else  if(info[m].orderStatus!="cancelled")
                                {
                                    
                                    console.log('Location Name-->'+info[m]._id);
                                    console.log("upcoming +1");
                                    var order =
                                    {
                                        'bookingId':info[m]._id,
                                        'bookingStatus':'Upcoming',
                                        'placeId':info[m].place_id,
                                        'parkingPlaceName':space.location,
                                        'mySpaceName':space.title,
                                        'latLong':latlong,
                                        'spotStickerId':info[m].spotStickerId,
                                        'startDate':startDate,
                                        'endDate':endDate,
                                        'startTime':startTime,
                                        'endTime':endTime,
                                        'hourly':space.hourly,
                                        'daily':space.daily,
                                        'weekly':space.weekly,
                                        'monthly':space.monthly,
                                        'amount':Math.round(info[m].totalAmount),
                                        'parkingType':space.parking_type,
                                        'parkingSpaceType':space.space_type,
                                        'amentities':space.amenties,
                                        'parkingAreaType':space.parkingAreaType,
                                        'isThisSpaceDelinated':space.space_delinated,
                                        'description':space.description,
                                        'userdetails':myobj
                                    }
                                 }
                            }
                            else
                            {
                                if(space.markerStatus==true)
                                {
                                    console.log('past+1');

                                    var order =
                                    {
                                        'bookingId':info[m]._id,
                                        'bookingStatus':'Past',
                                        'parkingPlaceName':space.location,
                                        'placeId':info[m].place_id,
                                        'mySpaceName':space.title,
                                        'latLong':latlong,
                                        'markerId': info[m].spotStickerId,
                                        'startDate':startDate,
                                        'endDate':endDate,
                                        'startTime':startTime,
                                        'endTime':endTime,
                                        'hourly':space.hourly,
                                        'daily':space.daily,
                                        'weekly':space.weekly,
                                        'monthly':space.monthly,
                                        'amount':Math.round(info[m].totalAmount),
                                        'parkingType':space.parking_type,
                                        'parkingSpaceType':space.space_type,
                                        'amentities':space.amenties,
                                        'parkingAreaType':space.parkingAreaType,
                                        'isThisSpaceDelinated':space.space_delinated,
                                        'description':space.description,
                                        'userdetails':myobj
                                    }
                                }
                                else
                                {
                                    console.log("hello");
                                    var order =
                                    {
                                        'bookingId':info[m]._id,
                                        'bookingStatus':'Past',
                                        'parkingPlaceName':space.location,
                                        'mySpaceName':space.title,
                                        'latLong':latlong,
                                        'placeId':info[m].place_id,
                                        'spotStickerId':info[m].spotStickerId,
                                        'startDate':startDate,
                                        'endDate':endDate,
                                        'startTime':startTime,
                                        'endTime':endTime,
                                        'hourly':space.hourly,
                                        'daily':space.daily,
                                        'weekly':space.weekly,
                                        'monthly':space.monthly,
                                        'amount':Math.round(info[m].totalAmount),
                                        'parkingType':space.parking_type,
                                        'parkingSpaceType':space.space_type,
                                        'amentities':space.amenties,
                                        'parkingAreaType':space.parkingAreaType,
                                        'isThisSpaceDelinated':space.space_delinated,
                                        'description':space.description,
                                        'userdetails':myobj
                                    }
                                 }  
                            }
                            console.log("11111111111111111111");
                            console.log(info[m]);
                            // console.log("end:"+info[m].end_timestamp);
                            // console.log("current"+current_timestamp);
                            // console.log("end:"+info[m].end_timestamp.getTime());
                            // console.log("current"+current_timestamp.getTime());
                            // console.log(info[m].end_timestamp>current_timestamp && info[m].paymentStatus!="cancelled");
                                var myDate2 = new Date(info[m].end_timestamp);
                                console.log(current_timestamp);
                                
                                console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{")
                                console.log(myDate2);
                            if(new Date(info[m].end_timestamp)>current_timestamp && info[m].orderStatus!="cancelled")
                            {
                                console.log("upcoming");
                                booking_list_upcoming.push(order);
                            }
                            else
                            {
                                console.log("past");
                                booking_list_past.push(order);
                            }
                            checkit(m-1);
                        });
                    }
                }
            }
        });
      });
},
bookedhistory:function(req,res){
    
  
    console.log('google'+req.body);
    
    req.session.placeId = req.body.placeid;
    req.session.orderId = req.body.orderId;
    req.session.st = req.body.startDate;
    req.session.et = req.body.endDate;
    req.session.totalamount=req.body.totalamount;
    req.session.totalhours=req.body.totalhours;
    req.session.userdetails=req.body.userdetails;
    req.session.cardetails=req.body.cardetails;
    console.log('result-***'+req.body.result);
    console.log('kkkgkgk'+req.session.st);
    console.log(req.session.placeId);
    console.log("orderId"+req.session.orderId);
    res.send({
                status: true,
                'message': "Success"
    });

},

spacehistorydetails:function(req,res)
{
    var placeId = req.session.placeId;
    console.log('k'+placeId);
            add_space.find({
                '_id': placeId
            }, function(err, docs) {
                console.log('ffffffffffff'+docs);
                if (err) {
                    return res.send({
                        status: false,
                        message: "Got some Error!"
                    });
                }

                if (docs.length == 0) {

                    res.send({
                        'status': false,
                        "message": "No space found"
                    });
                } else if (docs.length > 0) {
                    res.send({
                        'status': true,
                        'message': "space details",
                        'startdate': req.session.st,
                        'enddate': req.session.et,
                        'userid': req.session.userid,
                        'amount':req.session.totalamount,
                        'duration':req.session.totalhours,
                        'userdetails':req.session.userdetails,
                        'cardetails':req.session.cardetails,
                        'Searched_details': docs
                    });
                }


            });

},
Booking:function (req,res)
{

            console.log("skdjaskfhaskjlfhbsklajdbfaslkblashbf");
            user.findOne({token:req.body.token},function(errr,person)
            {
                if(errr)
                {
                    res.send({status:false,message:"Errror Occured"});
                    return false;
                }
                else
                {

                    
                    var start = moment(req.session.startdate);
                    var end = moment(req.session.enddate);
                    // console.log(req.body)
                     // Getting Start &  End Date
                 
                    // var timeParts = starttime.split(':'),
                    //   dateParts = startdate.split('-');
                    //   var start = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);
                       
                    //   timeParts = endtime.split(':'),
                    //   dateParts = enddate.split('-');
                    // var end = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);

                        var t = end - start;
                        var z = parseInt(t / 1000 / 60);
                        var time = display(z);
                          var hhmm;
                          var hh1 = time[0];
                          var mm1 = time[1];
                              if(hh1=="0")
                              {
                                hhmm = mm1+" Minutes";
                              }
                              else
                              {
                                hhmm = hh1+" Hours and "+mm1+" Minutes";
                              }
                            // console.log('start date->'+start+' end date->'+end);
                          
                            // start=start.getTime();
                            // end=end.getTime();

                            var h = (Math.abs(end - start)/3.6e6);


                            console.log('start Timestamp->'+start.format()+' end Timestamp->'+end.format());


                              // console.log(startdate+' '+enddate+' '+starttime+' '+endtime);  
                               //Getting Total Hours


                                // Getting start & end Time , splitting
                                // var e_t=endtime.split(':');
                                // var s_t=starttime.split(':');
                                var amount=0;

                            //h=h+parseInt(e_t);
                            //h=h+parseInt(s_t);

                               var total_hours=h+"hours";
                               console.log(total_hours)
                               // counting total number of months
                               var months=0,weeks=0,days=0;

                               // total hours for a day,week,month
                               var wh=168,dh=24,mh=720;


                               // calculating total number of months
                               if(h>=mh)
                               {
                                   months=parseInt(h/mh);
                                   h=parseInt(h%mh);

                                   //calculating total number of weeks
                                   if(h>=wh)
                                   {
                                     weeks=parseInt(h/wh);
                                     h=parseInt(h%wh);
                                   }

                                   //calculating total number of days
                                   if(h>=dh)
                                   {
                                     days=parseInt(h/dh);
                                     h=parseInt(h%dh);
                                   }
                               }
                               else
                               {

                                   //calculating total number of weeks
                                   if(h>=wh)
                                   {
                                     weeks=parseInt(h/wh);
                                     h=parseInt(h%wh);
                                   }

                                   //calculating total number of weeks
                                   if(h>=dh)
                                   {
                                     days=parseInt(h/dh);
                                     h=parseInt(h%dh);
                                   }
                               }

                               console.log('hours:'+h+' days:'+days+' weeks:'+weeks+' months:'+months);

                                user.findOne({token:req.body.token},function(Err,gUy)
                                {
                                    if(Err)
                                    {
                                        return res.send({status:false,message:"ErroR"});
                                    }
                                    console.log("gUy"+gUy);
                                    add_space.findOne({_id:req.body.PlaceId},function(err,place)
                                    {
                                        if(err)
                                        {
                                            return res.send({status:false,message:"Error occured"});
                                        }
                                        // console.log("place"+place);
                                        spot.find({place_id:req.body.PlaceId},function(err1,spots)
                                        {
                                            if(err1)
                                            {
                                                return res.send({status:false,message:"Error occured!"});
                                            }
                                            console.log("spots"+spots);
                                            //checking if vehicle is present there or not
                                            var i,j;
                                            var len = spots.length;
                                            j = len -1;
                                            checkVehicleDetails(j);
                                            function checkVehicleDetails(j)
                                            {
                                                if(j==-1)
                                                {
                                                    console.log("It was here and its length is"+len+' PlaceId'+ req.body.PlaceId);
                                                    i = len - 1;                                
                                                    ks(i);
                                                }
                                                else
                                                {
                                                    order.find({'extendedStatus':null, 'orderStatus':{$ne:"cancelled"}, 'vehicleNumber':req.body.vehicleNumber, $or:[{start_timestamp:{$lte: start},end_timestamp: {$gte: start}}, {start_timestamp :{$lte: end}, end_timestamp : {$gte: end}}]}).exec(function(err4,check)
                                                    {
                                                        if(err4)
                                                        {
                                                            return res.send({status:false,message:"Got Some Error!!!!"});
                                                        }
                                                        else
                                                        {
                                                            if(check.length>0)
                                                            {
                                                                res.send({status:false,message:"Vehicle with same Id is already present"});
                                                            }
                                                            else
                                                            {
                                                                checkVehicleDetails(j-1);
                                                            }
                                                        }
                                                    });
                                                }

                                            }                           
                                                
                                                function ks(i)
                                                {
                                                    if(i!=-1)
                                                    {
                                                        order.find({'spotStickerId':spots[i].spotStickerId, 'extendedStatus':null, 'orderStatus':{$ne:"cancelled"}, $or:[{start_timestamp:{$lte: start},end_timestamp: {$gte: start}}, {start_timestamp :{$lte: end}, end_timestamp : {$gte: end}}]}).exec(function(err2,space)
                                                        {
                                                            if(err)
                                                            {
                                                                return res.send({status:false,message:"Error occured!!"});
                                                            }
                                                            // console.log('space'+space);
                                                            if(space.length>0)
                                                            {
                                            
                                                                ks(i-1);
                                                            }
                                                            else
                                                            {
                                                                var ph=place.hourly;
                                                                var pw=place.weekly;
                                                                var pd=place.daily;
                                                                var pm=place.monthly;
                                                                console.log("Amount" + amount +" and "+ ph)

                                                                // location
                                                                var location=place.location;
                                                                console.log(location);

                                                                // calculating amount
                                                                amount=(ph*h)+(pd*days)+(pw*weeks)+(pm*months);
                                                                if(amount<ph)
                                                                {
                                                                    amount = ph;
                                                                    console.log("sssssssssssssssssssssssssssssssssss")
                                                                }
                                                                console.log("New Amount"+amount);
                                                                var disc_amount=0;
                                                                var amount_pay=0;
                                                                disc_amount = amount - person.wallet;
                                                                if(amount>person.wallet)
                                                                {
                                                                amount_pay=amount-person.wallet;
                                                                }
                                                                else
                                                                {
                                                                    amount_pay=0;
                                                                }

                                                                req.session.amount_pay=amount_pay;
                                                                console.log(amount);
                                                                console.log(person.wallet);
                                                                var temp = 0;
                                                                if(disc_amount<0)
                                                                {
                                                                    temp = -1*disc_amount;
                                                                    disc_amount = 0;
                                                                }
                                                                console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
                                                                console.log(disc_amount);
                                                                // calculating time
                                                                var current_time=new Date();
                                                                var hours=current_time.getHours();
                                                                var minutes = current_time.getMinutes();
                                                                minutes = minutes < 10 ? '0'+minutes : minutes;
                                                                var strTime = hours + ':' + minutes;


                                                                // calculating current date
                                                                var currentdate = new Date(); 
                                                                var datetime = currentdate.getDate() + "/"
                                                                              + (currentdate.getMonth()+1)  + "/" 
                                                                              + currentdate.getFullYear();



                                                                console.log("current time"+ strTime+' current date'+datetime);

                                                                var new_order = new order({'user_id':gUy._id, 
                                                                                        'place_id':place._id,'spotStickerId':spots[i].spotStickerId,'start_timestamp':start,'end_timestamp':end,'totalAmount':parseInt(amount)+1,'Amount':parseInt(disc_amount)+1,
                                                                                        'booktime':strTime+' '+datetime,'duration':hhmm,'location':place.location,
                                                                                        'vehicleNumber':req.body.vehicle_number,'vehicleModel':req.body.model_number,'vehicleInsuranceNumber':req.body.insurance_number,"paymentStatus":"processing"
                                                                                        });
                                                                new_order.save(function(err,docs1)
                                                                {
                                                                  if(err) return res.send({status:false,'message':'error occured during saving order'});
                                                                  else
                                                                  {
                                                                    person.wallet = temp;
                                                                    person.save(function(errar){
                                                                        if(errar)
                                                                        {
                                                                            res.send({status:false,message:"Errar Occured"});
                                                                        }
                                                                        else
                                                                        {
                                                                            req.session.orderId=new_order._id;
                                                                            console.log("Place"+place);
                                                                            user.findOne({_id:place.user_id},function(erRor,owner){
                                                                                if(erRor)
                                                                                {
                                                                                    res.send({status:false,message:"erRor occured"});
                                                                                    return false;
                                                                                }
                                                                                else
                                                                                {
                                                                                    if(owner.ownerWalletAmount)
                                                                                    {
                                                                                        owner.ownerWalletAmount = Math.round(owner.ownerWalletAmount + (94/100)*parseInt(amount));
                                                                                    }
                                                                                    else
                                                                                    {
                                                                                        owner.ownerWalletAmount = Math.round((94/100)*parseInt(amount));
                                                                                    }
                                                                                    owner.save(function(erroR){
                                                                                        if(erroR)
                                                                                        {
                                                                                            console.error(erroR);
                                                                                            //res.send({status:false,message:"erroR occured"});
                                                                                            return false;
                                                                                        }
                                                                                        else
                                                                                        {
                                                                                            //console.log("Having some error");
                                                                                            res.send({status:true,message:"Booking Done",orderId:docs1._id});
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                  }
                                                                });
                                                                
                                                            }                                   
                                                        });
                                                    }
                                                    else
                                                    {
                                                        res.send({status:false,message:"No Space Found"});
                                                    }
                                                }
                                        });
                                    });
                                });
                        
                    
                }
                
                
            });             
},
payment:function(req,res)
{

            var custId = req.body.customerId;
            var payamount = parseInt(req.session.amount_pay);
            var stripeEmail = req.body.stripeEmail;
            var stripeToken = req.body.stripeToken;
            var toKen =new_token;
            var OrderID = req.body.orderId;
            console.log('customerId'+custId+' orderId '+OrderID);
            console.log("stripeEmail"+req.body.stripeEmail+'stripetoken'+req.body.stripeToken);
            user.findOne({token:toKen},function(reqa,resa)
            {
                var userId = resa._id;

                cardDtls.findOne({user_id:userId,"customerId":custId},function(err,info)
                {
                    if(err || info== null)
                    {
                        var amounT = Math.abs(payamount*100);
                        console.log("AMOUNT:"+amounT)
                        console.log(amounT)
                        stripe.customers.create(
                        {
                            email: stripeEmail,
                            card: stripeToken
                        })
                        .then(customer =>
                        stripe.charges.create(
                        {
                            amount:parseInt(amounT),
                            description: "Booking Charge",
                            currency: "usd",
                            customer: customer.id
                        }))
                        .then(charge => {
                            console.log(charge.customer);
                            var cardobj=new cardDtls({user_id:userId,customerId:charge.customer,cardDetails:[{cardnumber:charge.source.last4,expMonth:charge.source.exp_month,expYear:charge.source.exp_year}]})
                        cardobj.save(function(errcard,cardinfo)
                        {
                            if (errcard)
                            {
                                res.send({status:false,message:"Card not saved"})
                            }
                            else
                            {
                                order.findOne({"_id":OrderID},function(error1,order){
                                    if(error1)
                                    {
                                        res.send({status:false,message:"Error occured"});
                                    }
                                    else if(order)
                                    {
                                        order.paymentStatus = "paid";
                                        order.save(function(error2){
                                            if(error2)
                                            {
                                                res.send({status:false,message:"Error occured"});
                                            }
                                            else
                                            {
                                                 res.send({"status":true,"message":"payment successful","details":charge});
                                            }
                                        });
                                    }
                                    else
                                    {
                                        console.log('$$$$ order $$$$'+order);
                                        res.send({"status":false,message:"No order found"});
                                    }
                                })
                            }
                        });
                        })
                        .catch(err => {
                            order.find({'_id':OrderID},function(err)
                            {
                                if(err)
                                {
                                    res.send({status:false,"message":"Error Occured"});
                                }  
                            else
                            { 
                                    res.send({status:false,message: "Purchase Failed"});
                            }      
                            }).remove().exec();
                        });       
                    }
                    else
                    {
                        var amounT = Math.abs(payamount*100);
                        console.log('amounT-->'+amounT); 
                        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                        console.log('customerId-->'+info.customerId)
                        stripe.charges.create(
                        {
                            amount:parseInt(amounT),
                            description: "Booking Charge",
                            currency: "usd",
                            customer: info.customerId
                        })
                        .then(charge => {
                            console.log('customer-->'+charge.customer);
                            cardDtls.findOne({user_id:userId,"cardDetails.cardnumber" : charge.source.last4},function(mmm,kkk)
                            {
                                console.log('inside cardDtls');
                                if(kkk)
                                {
                                    cardDtls.findOneAndUpdate(
                                    {
                                        user_id:userId
                                    },
                                    {
                                        $push: 
                                        { 
                                            cardDetails: 
                                            {
                                                customerId: charge.customer,
                                                cardnumber:charge.source.last4,
                                                expMonth:charge.source.exp_month,
                                                expYear:charge.source.exp_year
                                            }   
                                        }
                                    },
                                    {
                                        new: true
                                    },
                                    function(errcard,cardinfo)
                                        {
                                        if (errcard)
                                        {

                                              res.send({status:false,message:"Card not saved"})
                                        }
                                        else
                                        {
                                                console.log('going in order');
                                                order.findOne({"_id":OrderID},function(error1,order)
                                                {
                                                    if(error1)
                                                    {
                                                        res.send({status:false,message:"Error occured"});
                                                    }
                                                    else if(order)
                                                    {
                                                        console.log("order available");
                                                        order.paymentStatus = "paid";
                                                        order.save(function(error2){
                                                            if(error2)
                                                            {
                                                                res.send({status:false,message:"Error occured"});
                                                            }
                                                            else
                                                            {
                                                                
                                                                res.send({"status":true,"message":"payment successful","details":charge});
                                                            }
                                                        });
                                                    }
                                                    else
                                                    {

                                                        console.log('$$$$ order $$$$'+order);

                                                        res.send({"status":true,"message":"payment successful","details":charge});
                                                        //res.send({"status":false,message:"No order found"});
                                                    }
                                                })

                                        }
                                    })              
                                }
                                else
                                {

                                    res.send({"status":true,"message":"payment successful","details":charge});
                                }
                            })
                        })
                        .catch(err => {
                            console.log("Error:", err);
                            order.find({'_id':OrderID},function(err)
                            {
                                if(err)
                                {
                                res.send({status:false,"message":"Error Occured"});
                                }  
                                else
                                {

                                       res.send({status:false,message: err});
                                }      
                            }).remove().exec();
                        });       
                    }
                })
            })
},
payment_with_card:function(req,res)
{
            console.log('************ hi hello********');
            /*console.log("ssssssssssssssssss" + req.body.token + )*/
            var custId = req.body.customerId;
            var payamount = parseInt(req.session.amount_pay*100);
            var stripeEmail = req.body.stripeEmail;
            var stripeToken = req.body.stripeToken;
            var toKen =new_token;
            var OrderID = req.session.orderId;
            console.log('customerId'+custId+' orderId '+OrderID);
            console.log("stripeEmail"+req.body.stripeEmail+'stripetoken'+req.body.stripeToken);
            user.findOne({token:toKen},function(reqa,resa)
            {
                var amounT = Math.abs(payamount);
                var userId = resa._id;
                cardDtls.findOne({user_id:userId,"customerId":custId},function(err,info)
                {
                    if(err || info== null)
                    {
                        stripe.customers.create(
                        {
                            email: stripeEmail,
                            card: stripeToken
                        })
                        .then(customer =>
                        stripe.charges.create(
                        {
                            amount:parseInt(amounT),
                            description: "Booking Charge",
                            currency: "usd",
                            customer: customer.id
                        }))
                        .then(charge => {
                            console.log(charge.customer);
                            var cardobj=new cardDtls({user_id:userId,customerId:charge.customer,cardDetails:[{cardnumber:charge.source.last4,expMonth:charge.source.exp_month,expYear:charge.source.exp_year}]})
                        cardobj.save(function(errcard,cardinfo)
                        {
                            if (errcard)
                            {
                               // res.render('website/spacebooking.ejs');
                                res.send({status:false,message:errcard})
                            }
                            else
                            {
                                order.findOne({"_id":OrderID},function(error1,order){
                                    if(error1)
                                    {
                                        //res.render('website/spacebooking.ejs');
                                       res.send({status:false,message:"Error occured"});
                                    }
                                    else if(order)
                                    {
                                        order.paymentStatus = "paid";
                                        order.save(function(error2){
                                            if(error2)
                                            {
                                               // res.render('website/spacebooking.ejs');
                                                   res.send({status:false,message:"Error occured"});
                                            }
                                            else
                                            {
                                                res.render('website/paymentsuccessful.ejs');
                                                //res.send({"status":true,"message":"payment successful","details":charge});
                                            }
                                        });
                                    }
                                    else
                                    {
                                        console.log('$$$$ order $$$$'+order);
                                        //res.render('website/spaceboo\king.ejs');
                                        res.send({"status":false,message:"No order found"});
                                    }
                                })
                            }
                        });
                        })
                        .catch(err => {
                            order.find({'_id':OrderID},function(err)
                            {
                                if(err)
                                {
                                    //res.render('website/spacebooking.ejs');
                                    res.send({status:false,"message":"Error Occured"});
                                }  
                            else
                            { 
                                    //res.render('website/spacebooking.ejs');
                                    res.send({status:false,message: "Purchase Failed"});
                            }      
                            }).remove().exec();
                        });       
                    }
                    else
                    {
                        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                        console.log('customerId-->'+info.customerId)
                        stripe.charges.create(
                        {
                            amount:parseInt(amounT),
                            description: "Booking Charge",
                            currency: "usd",
                            customer: info.customerId
                        })
                        .then(charge => {
                            console.log('customer-->'+charge.customer);
                            cardDtls.findOne({user_id:userId,"cardDetails.cardnumber" : charge.source.last4},function(mmm,kkk)
                            {
                                console.log('inside cardDtls');
                                if(kkk)
                                {
                                    cardDtls.findOneAndUpdate(
                                    {
                                        user_id:userId
                                    },
                                    {
                                        $push: 
                                        { 
                                            cardDetails: 
                                            {
                                                customerId: charge.customer,
                                                cardnumber:charge.source.last4,
                                                expMonth:charge.source.exp_month,
                                                expYear:charge.source.exp_year
                                            }   
                                        }
                                    },
                                    {
                                        new: true
                                    },
                                    function(errcard,cardinfo)
                                        {
                                        if (errcard)
                                        {

                                              res.render('website/spacebooking.ejs');
                                              //res.send({status:false,message:"Card not saved"})
                                        }
                                        else
                                        {
                                                console.log('going in order');
                                                order.findOne({"_id":OrderID},function(error1,order)
                                                {
                                                    if(error1)
                                                    {
                                                        res.render('website/spacebooking.ejs');
                                                        //res.send({status:false,message:"Error occured"});
                                                    }
                                                    else if(order)
                                                    {
                                                        console.log("order available");
                                                        order.paymentStatus = "paid";
                                                        order.save(function(error2){
                                                            if(error2)
                                                            {
                                                                res.render('website/spacebooking.ejs');
                                                                //res.send({status:false,message:"Error occured"});
                                                            }
                                                            else
                                                            {
                                                                      res.render('website/paymentsuccessful.ejs');
//                                                                    res.send({"status":true,"message":"payment successful","details":charge});
                                                                    //res.render('website/paymentsuccessful.ejs');
                                                                //res.send({"status":true,"message":"payment successful","details":charge});
                                                            }
                                                        });
                                                    }
                                                    else
                                                    {
                                                        console.log('$$$$ order $$$$'+order);
                                                        res.render('website/spacebooking.ejs');
                                                        //res.send({"status":false,message:"No order found"});
                                                    }
                                                })

                                        }
                                    })              
                                }
                                else
                                {
                                    res.render('website/spacebooking.ejs');
                                    //res.send({status:true,message:"payment successful",details:charge})
                                    return false;
                                }
                            })  
                        })
                        .catch(err => {
                            console.log("Error:", err);
                            order.find({'_id':OrderID},function(err)
                            {
                                if(err)
                                {
                                    res.render('website/spacebooking.ejs');
                                //res.send({status:false,"message":"Error Occured"});
                                }  
                                else
                                {
                                        res.render('website/spacebooking.ejs');
                                       //res.send({status:false,message: "Purchase Failed"});
                                }      
                            }).remove().exec();
                        });       
                    }
                })
            })
},
extend_booking:function(req,res,next) 
{
            console.log(req.body);
            console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
            // var start = moment(req.body.start);
            var end = moment(req.body.end);
            // var endDate = req.body.EndDate;
            // var endTime = req.body.EndTime; 

            // var timeParts = endTime.split(':'),
            // dateParts = endDate.split('-');
            // dateParts.reverse();
            // var end=new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);
                // console.log("old_end"+end);
                // end=end.getTime();
                // var offset = 5+7; // 5 hours for IST and 7 hours for MST
                // end.setHours(end.getHours() + offset);
                // end.setMinutes(end.getMinutes() + 30);
                // console.log("new_end"+end);
                var start;

                order.findOne({ '_id':req.body.OrderId ,'extendedStatus':null, 'orderStatus':{$ne:"cancelled"}}, function(err, pqr)
                {
                    if(err)
                    {
                        return res.send({status:false,'message':'error occured while searching in order'});
                    }
                    else if(pqr==null)
                    {
                        return res.send({status:false,'message':'not found any value from order'});
                    }
                    else
                    {
                        var placeID = pqr.place_id;
                        var orderID = pqr.order_id;   
                        var spotStickerId = pqr.spotStickerId;
                        var vehicleNumber = pqr.vehicleNumber;
                        var vehicleModel = pqr.vehicleModel;
                        var vehicleInsuranceNumber = pqr.vehicleInsuranceNumber;
                        var total_amount=pqr.totalAmount;
                        req.session.orderId=req.body.OrderId;
                        start=moment(pqr.start_timestamp);

                        console.log('start timestamp->'+start.format()+'  end timestamp->'+end.format());  

                      //Getting Total Hours        
                      var h = (Math.abs(end - start)/3.6e6);

                      // Getting start & end Time , splitting
                      start=moment(pqr.end_timestamp);
                                          
                      var amount=0;
                      // calculating total hours  
                        // h=h+parseInt(e_t);
                        // h=h+parseInt(s_t);

                        req.session.totalhours=h;
                        var total_hours=h+"hours";

                      // counting total number of months
                      var months=0,weeks=0,days=0;

                      // total hours for a day,week,month
                      var wh=168,dh=24,mh=720;

                      // calculating total number of months
                      if(h>=mh)
                      {
                        months=parseInt(h/mh);
                        h=parseInt(h%mh);
                        //calculating total number of weeks
                        if(h>=wh)
                        {
                            weeks=parseInt(h/wh);
                            h=parseInt(h%wh);
                        }
                        //calculating total number of days
                        if(h>=dh)
                        {
                            days=parseInt(h/dh);
                            h=parseInt(h%dh);
                        }
                        }
                        else
                        {
                            //calculating total number of weeks
                            if(h>=wh)
                            {
                                weeks=parseInt(h/wh);
                                h=parseInt(h%wh);
                            }

                            //calculating total number of weeks
                            if(h>=dh)
                            {
                                days=parseInt(h/dh);
                                h=parseInt(h%dh);
                            }
                        }
                        console.log('hours='+h+' days='+days+' weeks='+weeks+' months='+months);
 

                        start_old = moment(pqr.start_timestamp);
                        // start = pqr.end_timestamp;
                        placeId = pqr.place_id;
                        console.log("Start:" + start.format());
                        console.log("End:" + end.format());


                        user.findOne({token:req.body.token},function(Err,gUy)
                        {
                            if(Err)
                            {
                                return res.send({status:false,message:"ErroR"});
                            }
                            console.log("gUy"+gUy);
                            add_space.findOne({_id:placeID},function(err,place)
                            {
                                console.log(place)
                                if(err)
                                {
                                    return res.send({status:false,message:"Error occured"});
                                }
                                // console.log("place"+place);
                                add_space.findOneAndUpdate(
                                {
                                    _id:placeID
                                },
                                {
                                    processingStatus :"yes"
                                },
                                function(err7,kjh)
                                {
                                    console.log("uuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu")
                                    if(err7)
                                    {
                                        res.send({status:false,message:"Error Occured!!!!!!!"});
                                        return false;
                                    }
                                    else
                                    {
                                        spot.findOne({place_id:placeID,'spotStickerId':spotStickerId},function(err1,spots){
                                            if(err1)
                                            {
                                                return res.send({status:false,message:"Error occured!"});
                                            }
                                            console.log("aaaaaaaaaaaaaa"+start.format());
                                            console.log("bbbbbbbbbbbbbb" + end.format());       
                                            if(start>=end)
                                            {
                                                res.send({status:false,message:"Extend enddate should be greater the booking end date"});
                                                return false;
                                            }
                                            else
                                            {
                                                order.find({'spotStickerId':spots.spotStickerId, 'extendedStatus':null, 'orderStatus':{$ne:"cancelled"}, $or:[{ start_timestamp :{ $lte: end}, end_timestamp : { $gte: end}}]}).exec(function(err2,space){
                                                    if(err)
                                                    {
                                                        return res.send({status:false,message:"Error occured!!"});
                                                    }

                                                    console.log('totalAmount'+space.totalAmount);
                                                    console.log('space'+space);
                                                    if(space.length>0)
                                                    {
                                                        res.send({status:false,message:"Place Already Booked"});
                                                    }
                                                    else
                                                    {
                                                        var ph=place.hourly;
                                                        var pw=place.weekly;
                                                        var pd=place.daily;
                                                        var pm=place.monthly;

                                                        // location
                                                        var location=place.location;
                                                        console.log(location);

                                                        // calculating amount
                                                        amount=(ph*h)+(pd*days)+(pw*weeks)+(pm*months);
                                                        req.session.TotalAmount=amount;
                                                        amountT=amount;
                                                        if(amount<ph)
                                                        {
                                                            amount = ph;
                                                            console.log("sssssssssssssssssssssssssssssssssss")
                                                        }
                                                        console.log("New Amount"+amount);



                                                        // calculating time
                                                        // var current_time=moment();
                                                        
                                                        // var hours=current_time.getHours();
                                                        // var minutes = current_time.toMinutes();
                                                        // minutes = minutes < 10 ? '0'+minutes : minutes;
                                                        // var strTime = hours + ':' + minutes;


                                                        // calculating current date
                                                        // var currentdate = moment(); 
                                                        // var datetime = currentdate.format('DD-MMM-YYYY');

                                                        // console.log("current time"+ strTime+' current date'+datetime);
                                                        console.log(amount);
                                    //                  end = end.setHours(end.getHours() - 19);                                                        
                                    //                  end = new Date(end);
                                                        // end.setMinutes(end.getMinutes() - 30);
                                                        order.findOneAndUpdate({_id:req.body.OrderId},{end_timestamp:end,totalAmount:(parseInt(total_amount)+parseInt(amount)),paymentStatus:"processing",duration:parseInt(total_hours)+"hours",Amount:amount},function(err,result)
                                                        {
                                                            if(err || result==null)
                                                            {
                                                                res.send({status:false,'message':err});
                                                            }
                                                            else
                                                            {
                                                                console.log(result+' '+req.body.orderId+' '+end);
                                                                console.log(pqr.Amount + "ttttttttttttttttttttttttttttttt");
                                                                var amount_to_be_paid = amount;
                                                                req.session.amount_to_be_paid=amount;
                                                                /*amount_to_be_paid.toFixed(2)
                                                                console.log(amount_to_be_paid.toFixed(2))*/
                                                                res.send({status:true,message:"Success",amountToBePaid:amount_to_be_paid,endtmp:moment(end),totalhours:total_hours});
                                                            }
                                                        });
                                                    }                                   
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        })
                    }
                });                   
},
extend_order_payment:function(req,res)
{
            console.log('************ hi hello********');
            /*console.log("ssssssssssssssssss" + req.body.token + )*/
            var custId = req.body.customerId;
            var payamount = parseInt(req.session.TotalAmount);
            var stripeEmail = req.body.stripeEmail;
            var stripeToken = req.body.stripeToken;
            var toKen =new_token;
            var OrderID = req.session.orderId;
            console.log('customerId'+custId+' orderId '+OrderID);
            console.log("stripeEmail"+req.body.stripeEmail+'stripetoken'+req.body.stripeToken);
            user.findOne({token:toKen},function(reqa,resa)
            {
                var userId = resa._id;
                cardDtls.findOne({user_id:userId,"customerId":custId},function(err,info)
                {
                    if(err || info== null)
                    {
                        var amounT = payamount;
                        stripe.customers.create(
                        {
                            email: stripeEmail,
                            card: stripeToken
                        })
                        .then(customer =>
                        stripe.charges.create(
                        {
                            amount:parseInt(amounT),
                            description: "extend booking charge",
                            currency: "usd",
                            customer: customer.id
                        }))
                        .then(charge => {
                            console.log(charge.customer);
                            var cardobj=new cardDtls({user_id:userId,customerId:charge.customer,cardDetails:[{cardnumber:charge.source.last4,expMonth:charge.source.exp_month,expYear:charge.source.exp_year}]})
                        cardobj.save(function(errcard,cardinfo)
                        {
                            if (errcard)
                            {
                                res.send({status:false,message:"Card not saved"})
                            }
                            else
                            {
                                order.findOne({"_id":OrderID},function(error1,order){
                                    if(error1)
                                    {
                                        res.send({status:false,message:"Error occured"});
                                    }
                                    else if(order)
                                    {
                                        order.paymentStatus = "paid";
                                        order.save(function(error2){
                                            if(error2)
                                            {
                                                res.send({status:false,message:"Error occured"});
                                            }
                                            else
                                            {
                                                 res.send({"status":true,"message":"payment successful","details":charge});
                                            }
                                        });
                                    }
                                    else
                                    {
                                        console.log('$$$$ order $$$$'+order);
                                        res.send({"status":false,message:"No order found"});
                                    }
                                })
                            }
                        });
                        })
                        .catch(err => {
                            order.find({'_id':OrderID},function(err)
                            {
                                if(err)
                                {
                                    res.send({status:false,"message":"Error Occured"});
                                }  
                            else
                            { 
                                    res.send({status:false,message: "Purchase Failed"});
                            }      
                            }).remove().exec();
                        });       
                    }
                    else
                    {
                        var amounT = payamount*100;
                        console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$")
                        console.log('customerId-->'+info.customerId)
                        stripe.charges.create(
                        {
                            amount:parseInt(amounT),
                            description: "Sample Charge",
                            currency: "usd",
                            customer: info.customerId
                        })
                        .then(charge => {
                            console.log('customer-->'+charge.customer);
                            cardDtls.findOne({user_id:userId,"cardDetails.cardnumber" : charge.source.last4},function(mmm,kkk)
                            {
                                console.log('inside cardDtls');
                                if(kkk)
                                {
                                    cardDtls.findOneAndUpdate(
                                    {
                                        user_id:userId
                                    },
                                    {
                                        $push: 
                                        { 
                                            cardDetails: 
                                            {
                                                customerId: charge.customer,
                                                cardnumber:charge.source.last4,
                                                expMonth:charge.source.exp_month,
                                                expYear:charge.source.exp_year
                                            }   
                                        }
                                    },
                                    {
                                        new: true
                                    },
                                    function(errcard,cardinfo)
                                        {
                                        if (errcard)
                                        {

                                              res.send({status:false,message:"Card not saved"})
                                        }
                                        else
                                        {
                                                console.log('going in order');
                                                order.findOne({"_id":OrderID},function(error1,order)
                                                {
                                                    if(error1)
                                                    {
                                                        res.send({status:false,message:"Error occured"});
                                                    }
                                                    else if(order)
                                                    {
                                                        console.log("order available");
                                                        order.paymentStatus = "paid";
                                                        order.save(function(error2){
                                                            if(error2)
                                                            {
                                                                res.send({status:false,message:"Error occured"});
                                                            }
                                                            else
                                                            {
                                                                res.send({"status":true,"message":"payment successful","details":charge});
                                                            }
                                                        });
                                                    }
                                                    else
                                                    {
                                                        console.log('$$$$ order $$$$'+order);
                                                        res.send({"status":false,message:"No order found"});
                                                    }
                                                })

                                        }
                                    })              
                                }
                                else
                                {

                                    res.send({status:true,message:"payment successful",details:charge})
                                    return false;
                                }
                            })
                        })
                        .catch(err => {
                            console.log("Error:", err);
                            order.find({'_id':OrderID},function(err)
                            {
                                if(err)
                                {
                                res.send({status:false,"message":"Error Occured"});
                                }  
                                else
                                {

                                       res.send({status:false,message: "Purchase Failed"});
                                }      
                            }).remove().exec();
                        });       
                    }
                })
            })
},
cardDetails:function(req,res)
{
    user.findOne({token:req.body.token},function(reqa,resa)
    {
        var userId = resa._id;
        console.log("userIddddddddddddddd ---> " + userId)
        cardDtls.find({user_id:userId},function(err,info)
        {
            if (err)
            {
                res.send({status:false,message:"No cards found"})               
                return false;
            }
            console.log("info"+info);
            var cardDetails= [];
            for(var i = 0 ;i<info.length;i++)
            {
                if(info[i].cardDetails[0] != undefined || info[i]._id != undefined)
                {
                    console.log(info[i].cardDetails[0])
                    console.log('customerId-->'+info[i].customerId);
                    console.log("++++++++++===============++++++++========+++++++++")
                    var myobj = {c_Id:info[i].customerId,cardId:info[i].cardDetails[0]._id,customerId:info[i].cardDetails[0].customerId,cardnumber:info[i].cardDetails[0].cardnumber,expMonth:info[i].cardDetails[0].expMonth,expYear:info[i].cardDetails[0].expYear}
                    //var myobj = {carddetails:info[i].cardDetails[i]}
                    cardDetails.push(myobj)
                    console.log("Myobj"+myobj.c_Id);
                }
            }
            if(cardDetails.length == 0 || cardDetails.length == null)
            {
                res.send({status:false,message:"No cards found"})   
                return false;
            }
            res.send({status:true,message:"ListOfSavedCards",cardDetails:cardDetails})
        })  
    });
}

}
module.exports = ctrl;