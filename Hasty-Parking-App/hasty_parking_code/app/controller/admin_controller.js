var mongoose = require('mongoose');


//DB credentials
mongoose.connect('mongodb://localhost:27017/hasty_parking');

//DB Schema's
var admin = require('../models/admin_login.js');
var user = require('../models/signup.js'); 
var add_space = require('../models/add_space_rent.js');
var cardDtls = require('../models/carddetails.js');
var vehicleDtls = require('../models/vehicleDetails.js');
var orders = require('../models/order.js');
var vilotors = require('../models/violator.js');

var key = "$h%^&a!@s&^45*t%$^&*y";
var encryptor = require('simple-encryptor')(key);

	//JWT token
	var jwt = require('jsonwebtoken');

	//File System
	var fs = require('fs');

//controller starts here

var ctrl = 
{
	save_admin_details:function(req,res)
	{
		if (req.session.mysess)
		{
			res.send({status:false,message:"Already logged in"})
		}
		else
		{
			admin.findOne({ email: 'hastyadmin@gmail.com' }, function(err, guy) 
			{
				if (!err && guy)
				{
					res.send({status:false,message:"Email Already Registered"})
				}
				else 
				{
					var pass = "Hasty2017";
					var ency_passwd = encryptor.encrypt(pass);
					var save_dtls = new admin({email:'admin@hastyparking.com',password:ency_passwd});

					save_dtls.save(function(err){
						if (!err) {
							res.send({status:true,message:"Signup Successful"});
						} else {
							console.error(err);
							res.send({status:false,message:"Error: Please Try Again"});
						}
					});
				}
			});
       }
   },
   
   adminlogin:function(req,res)
   {
      if (req.session.mysess)
      {
       res.send({status:false,message:"Already logged in"})
   }
   else
   {
       console.log(req.body.email);
			//console.log(rew.body.password);
            admin.findOne({ email: req.body.email }, 'email password usertype', function(err, guy) 
            {
            	if (!err && guy) {
            		console.log(encryptor.decrypt(guy.password));
            		if (encryptor.decrypt(guy.password) == req.body.password) {
            			var token = jwt.sign(guy._doc, key, {
                                expiresIn: 1440 // expires in 24 hours
                            });
            			req.session.email = encryptor.encrypt(guy.email);
            			var my_sessionEmail =  encryptor.encrypt(guy.email);
            			req.session.mysess = my_sessionEmail;


            			console.log(req.session.mysess)

            			res.json({
            				status: true,
            				message: 'Enjoy your token!',
            				token: token,
            				user_id: guy._id
            			});

            		} 
            		else 
            		{
            			res.json({
            				status: false,
            				message: 'Incorrect Email or Password'
            			});
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
    },
    UserList:function(req,res)
    {
    	var userList = [];
    	user.find({},function(err, users)
    	{
            console.log(users);
            for(var i=0;i<users.length;i++)
            {
               var usrObj = {userid:users[i]._id,s_no:i+1,customername: users[i].firstname +" "+users[i].lastname,email:users[i].email,contactnumber:users[i].phone_number,activefrom:users[i].created_at}
               userList.push(usrObj)
           }
           res.send({status:true,values:userList})
       });
    },
    ParseId:function(req,res)
    {
    	req.session.UserListUserId = req.body.userId;
        console.log(req.session.UserListUserId);
        res.send({status:true})
    	//console.log(req.body);
    },
    getuniqueUserDtls:function(req,res)
    {
    	console.log(req.session.UserListUserId);
    	if(req.session.UserListUserId)
    	{
          user.findOne({_id:req.session.UserListUserId},function(err,info)
          {
           console.log(info)
           var myobj = {userid:info._id,customername: info.firstname +" "+info.lastname,email:info.email,contactnumber:info.phone_number,activefrom:info.created_at}
           if (info)
           {
            orders.count({user_id:req.session.UserListUserId},function(resqa,respa)
            {
             if(respa)
             {
              vilotors.count({user_id:req.session.UserListUserId},function(rsqa,rspa)
              {
               console.log(rspa)
               if (rspa)
               {
                cardDtls.find({user_id:req.session.UserListUserId},function(reqa,resa)
                {
                 if (resa)
                 {
                  res.send({status:true,userdetails:myobj,noofbooking:respa,noofviolation:rspa,carddetails:resa})
              }
          });
            }

        });
          }
      })
        }
    });    		
      }
  },
  getallVehicleDetails:function(req,res)
  {

      var finalArr = [];
      vehicleDtls.find({user_id:req.session.UserListUserId},function(err,info)
      {
       console.log(info)
       if (info)
       {
        for (var i = 0;i < info.length;i++) 
        {
         var finalObj = 	{vehicleId:info[i]._id ,vehicleModel:info[i].vehicleModel ,vehicleNumber:info[i].vehicleNumber ,vehicleInsuranceNumber:info[i].vehicleInsuranceNumber};
         finalArr.push(finalObj);
     }
     res.send({status:true,VehicleDetails:finalArr})                
 }
 else
 {
    console.log(err)
    res.send({status:false,message:"No Vehicle To Show"})
}
})
  },
  verifyNew: function(req, res)
  {
    add_space.find({'flag': req.body.flag}, function(err, newSpaceRequest)
    {
            //console.log(newSpaceRequest)
            var userarray = [];
            for(var i=0;i<newSpaceRequest.length;i++)
            {
                /*userarray.push(newSpaceRequest[i]);*/
               // console.log(newSpaceRequest[i].user_id)
               var myspace = {space:newSpaceRequest[i]};
               //console.log(myspace);
               user.findOne({_id:newSpaceRequest[i].user_id},function(errs,info)
               {
                    //console.log("forloop i value -----> " + i )
                    var myobj = {sno:i,userid:info._id,customername: info.firstname +" "+info.lastname,email:info.email,contactnumber:info.phone_number,spacedetails:myspace};
                    userarray.push(myobj);
                    //console.log(userarray);
                    res.send({status:true,userSpacedetails:userarray});

                })
           }
       });
},   
getAllViolator:function(req,res)
{
    vilotors.distinct('user_id').exec(function(err,info){

        console.log(info);
        for(var i = 0;i<info.length;i++ )
        {
            vilotors.count({user_id:info},function(rsqa,rspa){
                if(rspa){
                    user.findOne({_id:info},function(resqa,respa){
                        var myobj = {customername: respa.firstname +" "+respa.lastname,email:respa.email,contactnumber:respa.phone_number,noofviolation:rspa};
                        res.send({userdetails:myobj});
                    });
                }
            });
        }
    });
},
spaceUserDetails:function(req,res)
{
    var spaceid = req.body.spaceId;
    req.session.useridforspace = req.body.userid;
    req.session.spaceId = spaceid;    
    res.send({status:true})      
},
getnewuserspace:function(req,res)
{
    var userid = req.session.useridforspace;
    var spaceid = req.session.spaceId;
    console.log(userid  +"111111111111 "+ spaceid +"111111111111111111111111111111111111111111111111111111111111111")
    user.findOne({_id:userid},function(errs,info)
    {
        console.log(info)
            //console.log("forloop i value -----> " + i )
            add_space.findOne({_id:spaceid,user_id:userid},function(eers,inff)
            {
                if (inff)
                {
                    add_space.count({user_id:inff.user_id},function(errs,innf)
                    {
                        var myobj = {userid:info._id,customername: info.firstname +" "+info.lastname,email:info.email,contactnumber:info.phone_number};
                        console.log(myobj)
                        orders.findOne({place_id:inff._id},function(weq,wes)
                        {
                            res.send({status:true,userdetails:myobj,spacecount:innf,spacedetails:inff,ordersdetails:wes})
                        })                        
                    })
                }
            })
        })
},
changeProgessTo2:function(req,res)
{
    var placeid = req.body.placeid;
    add_space.findOneAndUpdate({_id:req.body.placeid},{flag:"2"},function(err,info)
    {
        res.send({status:true})
    })
},
changeProgessTo3:function(req,res)
{
    var placeid = req.body.placeid;
    add_space.findOneAndUpdate({_id:req.body.placeid},{flag:"3"},function(err,info)
    {
        res.send({status:true})
    })
},
    changeProgessTo4:function(req,res)
    {
        var placeid = req.body.placeid;
        add_space.findOneAndUpdate({_id:req.body.placeid},{flag:"4"},function(err,info)
        {
            res.send({status:true})
        })
    },
}
module.exports = ctrl;
