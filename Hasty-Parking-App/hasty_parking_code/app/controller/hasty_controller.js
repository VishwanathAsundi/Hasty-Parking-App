	var mongoose = require('mongoose');
	//For send sms (OTP to phone)
	var twilio = require('twilio');
	var accountSid = 'AC43abc6d3eaee2631feb4a1d506b2f5b2'; // Your Account SID from www.twilio.com/console
	var authToken = 'bccfa1762498c77f8cd28297cbe1f0d7';   // Your Auth Token from www.twilio.com/console
	var coupon = require('coupon');
	var createCoupon = require('coupon-code');
	var moment = require('moment');
	// Find your account sid and auth token in your Twilio account Console.
	var client = twilio(accountSid, authToken);

	// Db credentials

	//For run cron 
	// var cron = require('node-cron');
	/*cron.schedule('* * * * *', function(){
		console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    });*/
	mongoose.createConnection('mongodb://localhost:27017/hasty_parking');

	//DB Schema's
	var user = require('../models/signup.js');
	var add_space = require('../models/add_space_rent.js');
	var cardDtls = require('../models/carddetails.js');
	var vehicleDtls = require('../models/vehicleDetails.js');
	var locationschema = require('../models/locationschema.js');
	var violator_dtls = require('../models/violator.js');
	var order = require('../models/order.js');
	var promo = require('../models/promo.js');
	var user_promo = require('../models/user_promo.js');
	var bankDtls = require('../models/bankdetails.js');
	var spot = require('../models/spot.js');
	var tempvalues = require('../models/temp.js');

	//Encrytion
	var key = "$h%^&a!@s&^45*t%$^&*y";
	var encryptor = require('simple-encryptor')(key);

	//JWT token
	var jwt = require('jsonwebtoken');

	//File System
	var fs = require('fs');

	//Stripe payment gateway
	var stripe = require('stripe')('sk_test_UJXC8Uvr6y4H7H24XBTWunUl');
  stripe.charges.retrieve("ch_1A9Y1qBABF9ppg6YiV4zIU8t", {
    api_key: "sk_test_UJXC8Uvr6y4H7H24XBTWunUl"
  });
	//var ObjectId = require('mongoose').Types.ObjectId; 

	// Image Upload Module
	var multer = require('multer');
	var storage = multer.diskStorage({ //multers disk storage settings
		destination: function (req, file, cb) {
			cb(null, './public/images/user_images');
		},
		filename: function (req, file, cb) {
			var datetimestamp = Date.now();
			cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
		}
	});
	var violatorCar = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, './public/images/violator_car');
		},
		filename: function (req, file, cb) {
			var datetimestamp = Date.now();
			cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
		}
	});

	var location_images = multer.diskStorage({ //multers disk storage settings
		destination: function (req, file, cb) {
			cb(null, './public/images/location_images');
		},
		filename: function (req, file, cb) {
			var datetimestamp = Date.now();
			cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
		}
	});

	var carUpload = multer({storage: violatorCar}).single('file');
	var upload = multer({ storage: storage}).single('file');
	var loc_upload=multer({storage:location_images}).single('file');

	//To increment number of avaiable spaces
	var add = function add_numberOfAvailableSpaces(n,place_id){
		setInterval(function(){
			add_space.find({_id:place_id},function(err,docs){
				if(err) return console.error(err);

				else
				{
					docs[0].numberOfAvailableSpaces = docs[0].numberOfAvailableSpaces + 1;
					docs[0].save();
					clearInterval(add);
				}
			})
		}, n * 60 * 60 * 1000);
	}

	function deletetoken(email)
	{
		setTimeout(function(){
			user.find({email:email},function(err,docs){
				if(err) return console.error(err);

				else
				{
					docs[0].token = "";
					docs[0].save();
				}
			})
		}, 24 * 60 * 60 * 1000);
	}

	//For add the amount to Owner Wallet
	// cron.schedule('0 */1 * * * *', function(){
	// 	var current = moment();
	// 	// var offset = 5+7; // 5 hours for IST and 7 hours for MST
	// 	// current.setHours(current.getHours() + offset);
	// 	// current.setMinutes(current.getMinutes() + 30);
	// 	// console.log("")
	// 	order.find({'orderStatus':{$ne:"cancelled"},'end_timestamp':{$lt:current},'ownerPaidStatus':{$ne:true}},function(err,orders){
	// 		if(err)
	// 		{
	// 			console.error(err);
	// 		}
	// 		else if(orders.length<=0)
	// 		{
	// 			console.log("No orders matches the requirement");
	// 		}
	// 		else
	// 		{
	// 			var orderLen = orders.length - 1; // Starting from zero
	// 			OWA(orderLen);
	// 			function OWA(i){
	// 				if(i==-1)
	// 				{
	// 					console.log("Ended");
	// 				}
	// 				else
	// 				{
	// 					var current = moment();
	// 					console.log("Order:"+orders[i]);
	// 					add_space.findOne({_id:orders[i].place_id},function(err1,place){
	// 						if(err1)
	// 						{
	// 							console.error(err1);
	// 						}
	// 						else
	// 						{
	// 							if(!place)
	// 							{
	// 								console.log("No place found");
	// 							}
	// 							else
	// 							{
	// 								user.findOne({_id:place.user_id},function(err2,owner){
	// 									if(err2)
	// 									{
	// 										console.log(err2);
	// 									}
	// 									else
	// 									{
	// 										console.log("Owner"+owner);
	// 										if(!owner)
	// 										{
	// 											console.log("Owner not found");
	// 										}
	// 										else
	// 										{
	// 											// console.log(on)
	// 											var transMoney = 0;
	// 											amount = orders[i].Amount;
	// 											var ownerWalletAmount = owner.ownerWalletAmount;
	// 											if(ownerWalletAmount)
	// 											{
	// 												transMoney = ownerWalletAmount + (94/100)*amount;
	// 											}
	// 											else
	// 											{
	// 												transMoney = (94/100)*amount;
	// 											}
	// 											console.log("TRANSFERED MONEY"+transMoney);
	// 											owner.ownerWalletAmount = ownerWalletAmount + transMoney;
	// 											console.log()
	// 											orders[i].ownerPaidStatus = true;
	// 											owner.save(function(error){
	// 												if(error)
	// 												{
	// 													console.error(error);
	// 												}	
	// 												else
	// 												{
	// 													console.log("owner Saved");
	// 													orders[i].save(function(erroR){
	// 														if(erroR)
	// 														{
	// 															console.log(erroR);
	// 														}
	// 														else
	// 														{
	// 															console.log("Order Status Saved.");
	// 															OWA(i-1);
	// 														}
	// 													})
	// 												}
	// 											})
	// 										}
	// 									}
	// 								})
	// 							}								
	// 						}
	// 					});
	// 				}
	// 			}	
	// 		}
	// 	});
    // });
    
    // //For remove the order from DB 
	// cron.schedule('0 */7 * * * *', function()
	// {
	// 	add_space.find({processingStatus:"yes"},function(placereq,placeres)
	// 	{
	// 		if (placereq)
	// 		{
	// 			console.log("no place is in processing");
	// 		}
	// 		else
	// 		{
	// 			if(placeres.length>0)
	// 			{
	// 				var len = placeres.length - 1;
	// 				del(len);
	// 				function del(i)
	// 				{
	// 					if(i==-1)
	// 					{
	// 						console.log("FINISHED");
	// 					}
	// 					else if(placeres[i])
	// 					{
	// 						console.log(placeres[i]);
	// 						var id = placeres[i]._id;
	// 						console.log(id);
	// 						add_space.findOneAndUpdate(
	// 						{
	// 							'_id':placeres[i]._id
	// 						},
	// 						{
	// 							"processingStatus":"no"
	// 						},
	// 						function(err1,docs)
	// 						{
	// 							if(err1)
	// 							{
	// 								console.log("unable update , check the code ")
	// 							}
	// 							console.log("place id"+placeres[i]._id+" updated");
	// 							del(i-1);
	// 						})
							
	// 					}
	// 					else
	// 					{
	// 						console.log("No order with status processing");
	// 					}
	// 				}
	// 			}
	// 		}
	// 	})
	// });
	function display(a)
	{
		var hours = Math.trunc(a/60);
		var minutes = a % 60;
		// var time = hours +":"+ minutes;
		var time = [hours,minutes];
		return time;
	}
	var startdate='',enddate='',starttime='',endtime='';

	// Controller Code Starts here
	var ctrl = 
	{
		//For check the token is right or wrong
		authMiddleware: function(req, res, next) 
		{
			console.log(req.body)
		 	var token = req.body.token || req.query.token || req.headers['token'];
			user.find({"token": token},function(err,docs){
				console.log(docs)
				if(docs.length == 0 || docs == null || docs == undefined)
				{
					res.send({status:false,message:"Token Not Found"})
					return false;
				}
				else
				{
					var tokenDB = docs[0].token;
					if (tokenDB) 
					{
						if (token == tokenDB)
						{
							next();
						}
						else
						{
							res.send({status:false,message:"Token is wrong"});
							return false;
						}
					}
					else {
						return res.status(403).send({
							status: false,
							message: 'No token provided.'
						});
					}
				}
			});			
		},
		//For user signup
		save_user_details:function(req,res)
		{
				user.findOne({$or: [{ email: req.body.email},{phone_number:req.body.phonenumber}]}, 'email password usertype', function(err, guy) 
				{
					if (!err && guy)
					{
				
						res.send({status:false,message:"Email or Phonenumber is Already Registered"})
					}
					else 
					{
						var objToken = {password:"sdq2312398qzkj^$%^$%^$bda@@$%%%skjd12312akjsd12321kasd1!@#!@12!^&$^%^@#$@$%",email:"pmelamparithi@gmail.com",_id:"asda12312342345654645645"}
				        var token = jwt.sign(objToken,key, {
				            expiresIn: 1440 // expires in 24 hours
				        });
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
						
						var save_dtls = new user({ "firstname": req.body.fname,"ref_code":ref_code, "lastname": req.body.lname, "phone_number": req.body.phonenumber, "email":req.body.email, "password":ency_passwd,"token":token, "wallet": wallet,"status":"0","otp":"12345"/*otp_gen*/,"device_token":req.body.deviceToken,"device_type":req.body.deviceType,"f_id":req.body.facebookId,"g_id":req.body.googleId,"violations":0,"ownerWalletAmount":0,"wallet":0});
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
							
						//   console.log(data);
						});
					}
				});
		},
		//For user login
		userlogin: function(req, res) 
		{
			console.log(req.body)
		    var g_id = req.body.googleId;
		    var f_id = req.body.facebookId;
			/*console.log(encryptor.decrypt("59a2d8d2fe9e04f103c203f293ee5e851bdc04cb0770e318d97351286ad5cd6a2cb93b434b5348402ba0d12b79cadc88KKglAJ3w5sL43R6ZEzCufA=="))*/
		    if (!g_id && !f_id && req.body.password) {
					//console.log(req.body.email)
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
		                            var myobj = {userName:resa.firstname +" "+resa.lastname,userPhoneNumber:resa.phone_number,userMailId:resa.email,HotlineMailId:resa.hotline_email_id,HotlinePhoneNumber:resa.hotline_phone_number,imageUrl:imageurl,ownerWalletAmount:resa.ownerWalletAmount,wallet:resa.wallet,token:resa.token};
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
		            user.findOne({email:req.body.socEmail }, function(err, docs) 
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
							return false;
						}
		                else if(docs.email == req.body.socEmail)
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

		                    user.findOneAndUpdate({email:req.body.socEmail},
		                    {
		                    	token:toKen,
		                    	f_id:f_id
		                    },
				    		{
				    			new:true
				    		},
		                    function(errf,finfo)
		                    {
		                    	console.log(errf)
		                    	console.log("ssssssssssssssssssssssssssssssssssssss");
		                    	console.log(finfo.image_path)
		                                var imageurl = "http://192.169.164.224:8111/";
		                                if(finfo.image_path =="" || finfo.image_path== null || finfo.image_path == undefined){
		                                        imageurl = ""    
		                                }
		                                else{
		                                       imageurl =  imageurl+finfo.image_path;
		                                }
										var myobj = {userName:finfo.firstname +" "+finfo.lastname,userPhoneNumber:finfo.phone_number,userMailId:finfo.email,HotlineMailId:finfo.hotline_email_id,HotlinePhoneNumber:finfo.hotline_phone_number,imageUrl:imageurl,token:finfo.token};

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
		        user.findOne({email:req.body.socEmail }, function(err, docs) 
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
						return false;
					}                      					
		            else if(docs.email == req.body.socEmail)
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

		                user.findOneAndUpdate({email:req.body.socEmail},
		                {
		                	token:tokEn,
		                	g_id:g_id
		                },
			    		{new:true},
		                function(errf,finfo)
		                {
		                	console.log(errf)
		                	console.log("VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
		                	console.log(finfo)
		                                var imageurl = "http://192.169.164.224:8111/";
		                                if(finfo.image_path =="" || finfo.image_path== null || finfo.image_path == undefined){
		                                        imageurl = ""
		                                }
		                                else{
		                                       imageurl =  imageurl+finfo.image_path;
		                                }
		                                var myobj = {userName:finfo.firstname +" "+finfo.lastname,userPhoneNumber:finfo.phone_number,userMailId:finfo.email,HotlineMailId:finfo.hotline_email_id,HotlinePhoneNumber:finfo.hotline_phone_number,imageUrl:imageurl,token:finfo.token};
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
		                    message: 'This GoogleId Is Not Registered'
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
		},
		//For save the vehicel details
		savevehicleDtls:function(req,res)
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
		// Get the vehicle details
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
								var finalObj = 	{vehicleId:info[i]._id ,vehicleModel:info[i].vehicleModel ,vehicleNumber:info[i].vehicleNumber ,vehicleInsuranceNumber:info[i].vehicleInsuranceNumber};
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
		//Confirm the OTP
		cnfrmotp:function(req,res)
		{
				var otp = req.body.otp;
				console.log(req.body.phoneNumber)
				user.findOne({ phone_number: req.body.phoneNumber }, function(err, guy) 
				{
					if (!err && guy) 
					{
		                //console.log(guy)
		                //console.log(guy)
		                if (guy.otp == req.body.otp) 
		                {
		                	user.findOneAndUpdate({phone_number:req.body.phoneNumber},
		                	{
		                		$unset: { otp: ""},
		                		$set: {status:"1"}
		                	},
		                	{new:true},
		                	function(errr,info)
		                	{
                                var imageurl = "http://192.169.164.224:8111/";
                                if(info.image_path =="" || info.image_path== null || info.image_path == undefined)
                                {
                                        imageurl = "";
                                }
                                else
                                {
                                        imageurl+info.image_path;
                                }
		                		var myobj = {userName:info.firstname +" "+info.lastname,userPhoneNumber:info.phone_number,userMailId:info.email,HotlineMailId:info.hotline_email_id,HotlinePhoneNumber:info.hotline_phone_number,token:info.token,imageUrl:info.imageurl};
		                		if(errr)
		                		{
		                			res.send({status:false,message:"Something went wrong try again"});
		                		}
		                		else
		                		{
		                			res.send({status:true,message:"otp matched",userdetails:myobj});
		                		}
		                	})     
		                }
		                else 
		                {
		                	res.json(
		                	{
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
		//validate the space is available or not
		rentspaceValidation:function(req,res)
		{
			var arr=[];
			var str=req.body.LatLong.split(',');
			arr[0]=str[1];
			arr[1]=str[0];
			user.findOne({token:req.body.token},function(rez,resz)
			{
			    add_space.find({'user_id':resz._id,'latlong':arr}, function(err, guy) 
			    {
					if(guy.length==0 && (!err))
					{
						res.send({status:true,message:"No place available for this latlong"});
					}	
					else if(guy.length>0  || err)
					{  
						res.send({status:false,message:"Sorry this place Already exist"});
					}						    	

			    });				
			});		      
		},
		// Edit the space
		rentspaceEdit:function(req,res)
		{
			console.log("BODY"+req.body);
			loc_upload(req,res,function(err){
				if(err)
				{
					console.error(err);
					return false;
				}
				user.findOne({token:req.headers['token']},function(rez,resz)
				{
					if(rez)
					{
						console.error(rez);
						return false;
					}
					console.log("world");
					if (resz)
					{
						console.log("hello")
						add_space.findOneAndUpdate({_id:req.body.myplaceId},
						{
							$set:
							{
								'spotimage':[{'image':"http://192.169.164.224:8111/"+req.file.path}],
								'parking_type':req.body.ParkingType,
								"description": req.body.Description,
								"available_status":req.body.AvailableStatus,
								'hourly':req.body.Hourly,
								'weekly':req.body.Weekly,
								'daily' :req.body.Daily,
								'monthly':req.body.Monthly,
								'dimensionOfSpace':req.body.dimensionOfSpace,
								'surfaceMaterial':req.body.surfaceMaterial,
								'placeHeight':req.body.HeightRestriction,
								'space_delinated':req.body.SpaceDelinated,
								'amenties':req.body.Amentities
							}
						},
						{
							new:true
						},function(err,info)
						{
							if (err)
							{
								res.send({status:false,message:"space not updated"})
								return false;
							}
							else if (info)
							{
								console.log("info"+info);
								res.send({status:true,message:"Space updated successfully",'SpaceId':info._id});
								return false;
							}
							else
							{
								console.log("no info found");
							}
						});					
					}
				});
			})
		},
		// add the new space
		rentSpace:function(req,res)
		{  
			//ZIP CODE IMPORTANT
			 

		      var arr=[];
		      var str=req.body.LatLong.split(',');
		      arr[0]=str[1];
		      arr[1]=str[0];
			user.findOne({token:req.body.token},function(rez,resz)
			{
				function randomString(length, chars) {
			              var result = '';
			              for (var i = length; i > 0; i--) result += chars[Math.round(Math.random() * (chars.length - 1))];
					                return result;
				          }
			    add_space.find({'user_id':resz._id,'latlong':arr}, function(err, guy) 
			    {
			      if(guy.length==0 && (!err))
			      {
			        var spaceArr = [];
			        spaceArr.push({singleSpace:req.body.singlespace,multipleSpace:req.body.multiplespace});
			        var noas;
					var nos;
			        if(req.body.SpaceType=="single")
			        {
			          console.log("single");
			          noas = 1;
				 	  nos =1;
			        }
			        else if(req.body.SpaceType=="multiple")
			        {
			          console.log("multiplespace");
			          noas = req.body.NumberOfSpace;
				  	  nos = req.body.NumberOfSpace;
			        }
			        var arr=[];
			        var str=req.body.LatLong.split(',');
			        arr[0]=str[1];
			        arr[1]=str[0];
			        var markerId;
			        function mark()
			        {
			        	markerId = req.body.zipcode + randomString(5, '012AVkiskfkfbwkfsdflkjhasdfj3456789');
			        }
			        mark();
			        var markerStatus;
			        if(req.body.markerType=="1")
			        {
						markerStatus = true;	
			        }
			        else
			        {
			        	markerStatus = false;
			        }

			        var person = new add_space({'user_id':resz._id,
			        'title': req.body.Title, 'location': req.body.Location,
			        'parking_type':req.body.ParkingType,'space':spaceArr,
			        "numberOfAvailableSpaces":noas, 'numberOfSpace':nos,
			        "description": req.body.Description, "type": req.body.Type,
			        "space_delimited":req.body.sd,"available_status":req.body.AvailableStatus,
			        "latlong":arr,'hourly':req.body.Hourly,
			        'weekly':req.body.Weekly,
			        'daily' :req.body.Daily,
			        'flag':'1',
			        'monthly':req.body.Monthly,
					'dimensionOfSpace':req.body.dimensionOfSpace,
					'surfaceMaterial':req.body.surfaceMaterial,
			        'rent_prev_violator':req.body.rpv,
			        'placeHeight':req.body.HeightRestriction,
			        'paymentDetails':req.body.PaymentDetails,
			        'owner_type':req.body.OwnerType,
			        'zipcode':req.body.zipcode,
			        'cityState':req.body.cityState,
			        'address':req.body.address,
			        'space_type':req.body.SpaceType,
			        'paidFor':req.body.paidFor,
			        'space_delinated':req.body.SpaceDelinated,'markerId':markerId,'markerStatus':markerStatus,
			        'amenties':req.body.Amentities,'parkingAreaType':req.body.parkingAreaType}); 
			        // type will be individual owner or business
			        console.log("+++++++++++++++++++++++++")
			        console.log(person);
			        console.log("_________________________")
			        person.save(function(err,doc){
			          if(err || doc==='null') return res.send({status:false,'message':'sorry not stored:error'});

			          else 
			          {
			          	
			          	var spotIdGeneration;
			          	function xyz()
			          	{
			          		spotIdGeneration = randomString(4, '0123456789')+req.body.zipcode;
					    }

					      	for(var i=0;i<nos;i++)
					      	{
					      		xyz();
					      		console.log("SPOTID:"+ spotIdGeneration);
					      		var obj = new spot({place_id:doc._id, spotStickerId:spotIdGeneration})
						        obj.save(function(err, docs){
						          if(err)
						          {
						            return res.json({status: false, message: "spot Id not Saved"});
						          }
						          else
						          {
						              console.log("Successful..!!");
						          }
						        });	
					      	}
			            res.send({status:true,'MySpaceId':person._id,message:"Successfully created","space_status":"waiting for hasty approval"});
			          }
			        });
			      }
			      else if(guy.length>0  || err)
			      {  
			        res.send({status:false,message:"Sorry this place Already exist"});
			      }
			    })
		    });  
		},
		//finding the nearest space 
		findSpace:function(req,res,next)
		{
		//Getting Total Hours
		// startdate=req.body.startdate;
		 //    enddate=req.body.enddate;
		 //    starttime=req.body.starttime;
		 //    endtime=req.body.endtime;
		 var start = moment(req.body.start);         
		 var end = moment(req.body.end);

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
			var Searched_list=[],p=0;
			var latlong=req.body.LatLong.split(',');
			latlong.reverse();
			add_space.find({
				latlong:
				{ 
					$near :
					{
						$geometry: { type: "Point",  coordinates: latlong},
						$maxDistance:2000.00
					}
				},available_status:"yes",processingStatus:{$ne:"yes"}
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
			           			console.log('Documents->'+docs);
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
			           						res.json({status:true,'message':"List of Available Spaces",'Searched_details':{'Searched_List':Searched_list}});
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
										        						user.findOne({token:req.body.token},function(eror,user){
										        							if(eror)
										        							{
										        								res.send({status:false,message:"Eror Occured"});
										        								return false;
										        							}

										        						
												        					console.log(docs[k]._id)
												        					console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^6")
												        					console.log(space)
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
														                        console.log(location);

														                        // calculating amount
														                        amount=(ph*h)+(pd*days)+(pw*weeks)+(pm*months);

														                        console.log("New Amount"+amount);
														                        if(amount<ph)
														                        {
														                        	amount = ph;
														                        	console.log(amount + "TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT")
														                        }
														                        var latlong=docs[k].latlong[1]+',';
																                latlong+=docs[k].latlong[0];
																				var result=req.body.LatLong.split(',');
																				var disc_amount = amount - user.wallet;
																				if(disc_amount<0)
																				{
																					disc_amount = 0;
																				}
																              	console.log('result->'+result);
																              	// var myDate = moment(req.body.start);
																              	// var startdate = start.format('DD-MMM-YYYY');
																              	// var enddate = end.format('DD-MMM-YYYY');
																              	// var starttime = start.format("hh:mm:ss a");
																              	// var endtime = end.format("hh:mm:ss a");
																              	console.log(endtime);
																              	console.log(starttime);
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
																		        }
													        					k++;
													        					console.log('k->'+k);
													        					if(k==(docs.length))
													        					{													        									      
																					tempvalues.findOne({'userId':user._id},function(errq,resk){
																						if(errq)
																						{
																							res.send({status:false,message:"Error error error"});
																							return false;
																						}
																						else if(resk)
																						{
																							resk.start = moment(req.body.start);         
																							resk.end = moment(req.body.end);
																							resk.save(function(errr){
																								if(errr)
																								{
																									res.send({status:false,message:"Errror Occured"});
																									return false;
																								}
																								else
																								{
																									if(Searched_list.length == 0 )
																									{
																										res.json({status:false,'message':"No Space Found",'Searched_details':{'Searched_List':Searched_list}});	
																										return false;
																									}
																									console.log("nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn");
														        									res.json({status:true,'message':"List of Available Spaces",'Searched_details':{'Searched_List':Searched_list}});
																								}
																							});
																						}
																						else
																						{
															        						var dates = new tempvalues({'userId':user._id,'start':moment(req.body.start),'end':moment(req.body.end)});
																							dates.save(function(errr){
																								if(errr)
																								{
																									res.send({status:false,message:"Errror Occured"});
																									return false;
																								}
																								else
																								{
																									console.log("wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
																									if(Searched_list.length == 0 )
																									{
																										res.json({status:false,'message':"No Space Found",'Searched_details':{'Searched_List':Searched_list}});	
																										return false;
																									}
														        									res.json({status:true,'message':"List of Available Spaces",'Searched_details':{'Searched_List':Searched_list}});
																								}
																							});
																						}
																					});									        																										       																				    
													        					}
													        					else
													        					{
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
										        						res.json({status:true,'message':"List of Available Spaces",'Searched_details':{'Searched_List':Searched_list}});
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
		},
		//validation for vehicle is already exists or not
		findSpaceValidation:function(req,res)
		{
			user.findOne({token:req.body.token},function(errr,person){
				if(errr)
				{
					res.send({status:false,message:"Errror Occured"});
					return false;
				}
				else
				{
					tempvalues.findOne({userId:person._id},function(errz,tempo)
					{
						if(errz||!tempo)
						{
							res.send({status:false,message:"Error: Find a space before booking"});
							return false;
						}
						else
						{
								var start = moment(tempo.start);
								var end = moment(tempo.endDate);
								
								// console.log(startdate);
								// console.log(enddate);
								// console.log(starttime);
								// console.log(endtime);
								// console.log(req.body)
								// Getting Start &  End Date
								// var timeParts = starttime.split(':'),
								// dateParts = startdate.split('-');
								// var start = new Date(dateParts[0], parseInt(dateParts[1], 10) - 1, dateParts[2], timeParts[0], timeParts[1]);
								// timeParts = endtime.split(':'),
								// dateParts = enddate.split('-');
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
								console.log('start Timestamp->'+start.format()+' end Timestamp->'+end.format());

								// start=start.getTime();
								// end=end.getTime();

								var h = (Math.abs(end - start)/3.6e6);


								// console.log('start Timestamp->'+start+' end Timestamp->'+end);


								// console.log(startdate+' '+enddate+' '+starttime+' '+endtime);  
								//Getting Total Hours


					            // Getting start & end Time , splitting
					            // var e_t=endtime.split(':');
					            // var s_t=starttime.split(':');
					            var amount=0;
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
					    			// console.log("gUy"+gUy);
						        	add_space.findOne({_id:req.body.PlaceId},function(err,place)
						        	{
						        		if(err)
						    			{
						    				return res.send({status:false,message:"Error occured"});
						    			}
						        		// console.log("place"+place);
						        		add_space.findOneAndUpdate(
					        			{
					        				_id:req.body.PlaceId
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
								        		spot.find({place_id:req.body.PlaceId},function(err1,spots)
								        		{
								        			if(err1)
									    			{
									    				return res.send({status:false,message:"Error occured!"});
									    			}
								        			// console.log("spots"+spots);
									        		//checking if vehicle is present there or not
													var i,j;
								        			var len = spots.length;
								        			j = len -1;
								        			checkVehicleDetails(j);
													function checkVehicleDetails(j)
													{
														if(j==-1)
														{
															console.log(len);
									        				i = len - 1;
									        				return res.send({status:true,message:"No vehicles found for this time"});			        			
														}
														else
														{
															order.find({'place_id':req.body.PlaceId,'spotStickerId':spots[j].spotStickerId, 'extendedStatus':null, 'bookingStatus':{$ne:"cancelled"}, 'vehicleNumber':req.body.vehicleNumber, $or:[{start_timestamp:{$lte: start},end_timestamp: {$gte: start}}, {start_timestamp :{$lte: end}, end_timestamp : {$gte: end}}]}).exec(function(err4,check){
																if(err4)
																{
																	return res.send({status:true,message:"No vehicles found for this time"});
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
												})
											}
										});				
									})
						        });
					    	}
				    });
				}
			});
		},
		// For making the order
		Booking:function (req,res)
		{

			console.log("skdjaskfhaskjlfhbsklajdbfaslkblashbf");
			user.findOne({token:req.body.token},function(errr,person){
				if(errr)
				{
					res.send({status:false,message:"Errror Occured"});
					return false;
				}
				else
				{
					tempvalues.findOne({userId:person._id},function(errz,tempo){
						if(errz||!tempo)
						{
							res.send({status:false,message:"Error: Find a space before booking"});
							return false;
						}
						else
						{
							var start = moment(tempo.start);
							var end = moment(tempo.end);
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
						        	add_space.findOne({_id:req.body.PlaceId},function(err,place){
						        		if(err)
						    			{
						    				return res.send({status:false,message:"Error occured"});
						    			}
						        		// console.log("place"+place);
						        		spot.find({place_id:req.body.PlaceId},function(err1,spots){
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
													console.log("It was here and its length is"+len);
							        				i = len - 1;			        			
							        				ks(i);
												}
												else
												{
													order.find({'extendedStatus':null, 'bookingStatus':{$ne:"cancelled"}, 'vehicleNumber':req.body.vehicleNumber, $or:[{start_timestamp:{$lte: start},end_timestamp: {$gte: start}}, {start_timestamp :{$lte: end}, end_timestamp : {$gte: end}}]}).exec(function(err4,check){
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
								        				order.find({'spotStickerId':spots[i].spotStickerId, 'extendedStatus':null, 'bookingStatus':{$ne:"cancelled"}, $or:[{start_timestamp:{$lte: start},end_timestamp: {$gte: start}}, {start_timestamp :{$lte: end}, end_timestamp : {$gte: end}}]}).exec(function(err2,space){
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
										                        var disc_amount = amount - person.wallet;
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
																						'place_id':place._id,'spotStickerId':spots[i].spotStickerId,'start_timestamp':start,'end_timestamp':end,'totalAmount':amount,'Amount':disc_amount,
																						'booktime':strTime+' '+datetime,'duration':hhmm,'location':place.location,
																						'vehicleNumber':req.body.vehicleNumber,'vehicleModel':req.body.vehicleModel,'vehicleInsuranceNumber':req.body.vehicleInsuranceNumber,"paymentStatus":"processing"
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
				}
			});				
		},
		// Extend the booking
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
			        				_id:req.body.placeID
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
							        //                 	end = end.setHours(end.getHours() - 19);							                        	
							        //                 	end = new Date(end);
											 			// end.setMinutes(end.getMinutes() - 30);

								                        console.log(pqr.Amount + "ttttttttttttttttttttttttttttttt");
								                        var amount_to_be_paid = amount;
														/*amount_to_be_paid.toFixed(2)
								                        console.log(amount_to_be_paid.toFixed(2))*/
								                        res.send({status:true,message:"Success",amountToBePaid:amount_to_be_paid.toFixed(2),endtmp:moment(end),totalhours:total_hours})
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
		//Make payment for extended payment
		extent_order_paymnet:function(req,res)
		{

			  /*console.log("ssssssssssssssssss" + req.body.token + )*/
			  var custId = req.body.customerId;
			  var payamount = req.body.chargeAmount;
			  var stripeEmail = req.body.stripeEmail;
			  var stripeToken = req.body.stripeToken;
			  var toKen = req.body.token;
			  var endtmp = moment(req.body.endtmp);
			  var totalhours = req.body.totalhours;
			  user.findOne({token:toKen},function(reqa,resa)
			  {

			    var userId = resa._id;
			    cardDtls.findOne({user_id:userId,"cardDetails.customerId":custId},function(err,info)
			    {
			      if(err || info== null)
			      {
			        var amounT = payamount * 100;
			        console.log(amounT)
			        stripe.customers.create(
			        {
			          email: stripeEmail,
			          card: stripeToken
			        })
			        .then(customer =>
			        stripe.charges.create(
			        {
			          amount:amounT,
			          description: "Sample Charge",
			          currency: "usd",
			          customer: customer.id
			        }))
			        .then(charge => {

			          console.log(charge.customer);
			          var cardobj = new cardDtls({user_id:userId,cardDetails:[{customerId:charge.customer,cardnumber:charge.source.last4,expMonth:charge.source.exp_month,expYear:charge.source.exp_year}]})
			          cardobj.save(function(errcard,cardinfo)
			          {
			            if (errcard)
			            {
			              res.send({status:false,message:"Card not saved"})
			            }
			            else
			            {
							order.findOne({'_id':req.body.OrderId},function(err8,origspace)
							{
								console.log("44444444444444444444444444444444444444")
								console.log(req.body)
								console.log(endtmp + " YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
								console.log("99999999999999999999999999999999999999")								
								if(err8)
								{
									res.send({status:false,message:"Got Some Error!!!!!!!!"});
									return false;
								}
								else
								{
									console.log("Old"+origspace);
									origspace.end_timestamp	 = endtmp;
									origspace.Amount = payamount;
									origspace.duration = totalhours;
									if(origspace.totalAmount)
									{
							    		origspace.totalAmount = origspace.totalAmount + payamount;
									}
									else
									{
										origspace.totalAmount = payamount;
									}
									origspace.save(function(err7){
										if(err7)
										{
											res.send({status:false,message:"Error Occured!!!!!!!"});
											return false;
										}
										else
										{					
							        		res.send({status:true,message:"Payment Successful Booking Extended",details:charge});			
		              						return false;
										}
									});
								}
							})		            	
			            }
			          });
			        })
			        .catch(err => {
			          console.log("Error:", err);
			          res.send({status:false,message: "Purchase Failed"});
			        });       
			      }
			      else
			      {
			        var amounT = payamount *100;
			        stripe.charges.create(
			        {
			          amount:amounT,
			          description: "Sample Charge",
			          currency: "usd",
			          customer: info.cardDetails[0].customerId
			        })
			        .then(charge => {
			          console.log(charge.customer);
			          cardDtls.findOne({user_id:userId,"cardDetails.cardnumber" : charge.source.last4},function(mmm,kkk)
			          {
			            if(mmm)
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
										order.findOne({'_id':req.body.OrderId},function(err8,origspace)
										{
											console.log("44444444444444444444444444444444444444")
											console.log(req.body)
											console.log(endtmp + "   JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ");
											console.log("99999999999999999999999999999999999999")
											if(err8)
											{
												res.send({status:false,message:"Got Some Error!!!!!!!!"});
												return false;
											}
											else
											{
												console.log("Old"+endtmp);
												origspace.end_timestamp = endtmp;
												origspace.Amount = payamount;
												origspace.duration = totalhours;
												if(origspace.totalAmount)
												{
										    		origspace.totalAmount = origspace.totalAmount + payamount;
												}
												else
												{
													origspace.totalAmount = payamount;
												}
												origspace.save(function(err7){
													if(err7)
													{
														res.send({status:false,message:"Error Occured!!!!!!!"});
														return false;
													}
													else
													{					
										        		res.send({status:true,message:"Payment Successful Booking Extended",details:charge});			
					              						return false;
													}
												});
											}
										})	
					                }
					              })              
			            }
			            else
			            {
							order.findOne({'_id':req.body.OrderId},function(err8,origspace)
							{
								if(err8)
								{
									res.send({status:false,message:"Got Some Error!!!!!!!!"});
									return false;
								}
								else
								{
									console.log("44444444444444444444444444444444444444")
									console.log(req.body)
									console.log(endtmp + " YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
									console.log("99999999999999999999999999999999999999")
									console.log("Old"+origspace);
									origspace.end_timestamp = new Date(endtmp);
									origspace.Amount = payamount;
									origspace.duration = totalhours;
									if(origspace.totalAmount)
									{
							    		origspace.totalAmount = origspace.totalAmount + payamount;
									}
									else
									{
										origspace.totalAmount = payamount;
									}
									origspace.save(function(err7){
										if(err7)
										{
											res.send({status:false,message:"Error Occured!!!!!!!"});
											return false;
										}
										else
										{					
							        		res.send({status:true,message:"Payment Successful Booking Extended",details:charge});			
		              						return false;
										}
									});
								}
							})            	
			            }
			          })
			        })
			        .catch(err => {
			          console.log("Error:", err);
			          res.send({status:false,message: "Payment Failed"});
			        });       
			      }
			    })

			  });
		},
		// sending the cancellation amount
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
					order.findOne({'user_id':user_details._id,'place_id':req.body.placeId,'_id':req.body.orderId,'extendedStatus':null,'orderStatus':{$ne:"cancelled"}},function(err1,docs){
						if(err1||!docs)
						{
							res.send({status:false, message:"No Entries Found!"});
						}
						else
						{
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
							var amount;
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
		//Confirm the cancellation
		confirmcancel:function(req,res)
		{
			var amount = req.body.amount;
			user.findOne({token:req.body.token},function(err,user_details){
				if(err)
				{
					res.send({status:false,message:"Some Error Occured"});
					return false;
				}
				else
				{
					user_details.wallet = user_details.wallet + Math.round(amount);
					user_details.save(function(error){
						if(error)
						{
							res.send({status:false,message:"error Occured"});
							return false;
						}	
						else
						{
							order.findOne({'user_id':user_details._id,'place_id':req.body.placeId,'_id':req.body.orderId,'extendedStatus':null,'orderStatus':{$ne:"cancelled"}},function(err1,docs)
							{
								if(err1||!docs)
								{
									res.send({status:false, message:"No Entries Found!"});
								}
								else
								{
									console.log("48 difference");
									docs.walletDiscountAmount = amount;
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
							})
						}
					})
				}
			});
		},
		// Get the unique user details
		ProfileGetService:function(req,res)
		{

			user.findOne({token:req.body.token},function(err,user_details)
			{
				console.log(user_details);
				if(err || user_details==null)
				{
					res.send({status:false,'message':"sorry not found any information"});
					return false;
				}
				/*res.send({'status':true,'message':"success",'email':user_details,'userName':user_details.firstname,'userPhoneNumber':user_details.phone_number,
				'walletBalance':'0','vehicleDetails':{'vehicle_list':user_vehicle}*/
				res.send({status:true,'message':"success",'email':user_details.email,'userName':user_details.firstname+" "+user_details.lastname,'userPhoneNumber':user_details.phone_number,'imageUrl':user_details.image_path,'walletBalance':'0'})
			});
		},
		// upcoming and past details
			getUpcomingPastDetails:function(req,res)
		{
      		var current_timestamp=moment();
		 	console.log('current_timestamp->'+current_timestamp);
		   //    var offset = 5+7; // 5 hours for IST and 7 hours for MST
		   //    current_timestamp.setHours(current_timestamp.getHours() + offset);
			  // current_timestamp.setMinutes(current_timestamp.getMinutes() + 30);
		      user.findOne({token:req.body.token},function(rez,resz){
		      	var myobj = {userName:resz.firstname +" "+resz.lastname,userPhoneNumber:resz.phone_number,userMailId:resz.email,HotlineMailId:resz.hotline_email_id,HotlinePhoneNumber:resz.hotline_phone_number,ProfileImageUrl:resz.image_path};
		      	order.find({'user_id':resz._id,'extendedStatus':null,'paymentStatus':"success"},function(err,info){
		      		if(err)
		      		{
		               return res.send({status:false,'message':'error'});
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
		                checkit(m);
		                function checkit(m)
		                {
		                	if(m==-1)
		                	{
		                		res.send({status:true,message:"success","bookingDetails":{"bookingListUpcoming":booking_list_upcoming,"bookingListPast":booking_list_past}});
		                	}
		                	else
		                	{
		                		add_space.findOne({'_id':info[m].place_id}).exec(function(err2,space){
		                			if(err2)
		                			{
		                				res.send({status:false,message:"Space not found"});
		                				return false;
		                			}
		                			//calculating date
		                			var start = moment(info[m].start_timestamp);
    								var end = moment(info[m].end_timestamp);
		                              var latlong = space.latlong[1] + ',' + space.latlong[0];
		                              console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		                              console.log(moment(info[m].end_timestamp)>current_timestamp && info[m].orderStatus!="cancelled");
		                              console.log("current time ---->" + current_timestamp + "end_timestamp ----->" +moment(info[m].end_timestamp) )
		                              console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		                              console.log("endddddddddddddd" + end);
			                		if(moment(info[m].end_timestamp) > current_timestamp && info[m].orderStatus!="cancelled")
			                		{
			                			console.log('end timestamp-->'+moment(info[m].end_timestamp))
			                			if(space.markerStatus==true)
				                		{
				                			var order =
			                                {
												'bookingId':info[m]._id,
												'bookingStatus':'Upcoming',
												'parkingPlaceName':space.location,
												'mySpaceName':space.title,
												'latLong':latlong,
												'placeId':info[m].place_id,
												'markerId': info[m].spotStickerId,
												'start':start,
												'end':end,
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
												'userdetails':myobj,
												'dimensionOfSpace':space.dimensionOfSpace,
												'surfaceMaterial':space.surfaceMaterial
			                                }
				                		}
				                		else  if(info[m].orderStatus!="cancelled")
				                		{
				                			var order =
			                                {
												'bookingId':info[m]._id,
												'bookingStatus':'Upcoming',
												'placeId':info[m].place_id,
												'parkingPlaceName':space.location,
												'mySpaceName':space.title,
												'latLong':latlong,
												'spotStickerId':info[m].spotStickerId,
												'start':start,
												'end':end,
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
												'userdetails':myobj,
												'dimensionOfSpace':space.dimensionOfSpace,
												'surfaceMaterial':space.surfaceMaterial
			                                }
				                        }
			                		}
			                		else
			                		{
			                			if(space.markerStatus==true)
				                		{
				                			var order =
			                                {
												'bookingId':info[m]._id,
												'bookingStatus':'Past',
												'parkingPlaceName':space.location,
												'mySpaceName':space.title,
												'latLong':latlong,
												'markerId': info[m].spotStickerId,
												'start':start,
												'end':end,
												'cancelledAmount':info[m].walletDiscountAmount,
												'orderStatus':info[m].orderStatus,
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
												'userdetails':myobj,
												'dimensionOfSpace':space.dimensionOfSpace,
												'surfaceMaterial':space.surfaceMaterial										
			                                }
				                		}
				                		else
				                		{
				                			var order =
			                                {
												'bookingId':info[m]._id,
												'bookingStatus':'Past',
												'parkingPlaceName':space.location,
												'mySpaceName':space.title,
												'latLong':latlong,
												'spotStickerId':info[m].spotStickerId,
												'start':start,
												'end':end,
												'cancelledAmount':info[m].walletDiscountAmount,
												'orderStatus':info[m].orderStatus,
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
												'userdetails':myobj,
												'dimensionOfSpace':space.dimensionOfSpace,
												'surfaceMaterial':space.surfaceMaterial										
			                                }
				                        }	
			                		}
			                		// console.log("end:"+info[m].end_timestamp);
			                		// console.log("current"+current_timestamp);
			                		// console.log("end:"+info[m].end_timestamp.getTime());
			                		// console.log("current"+current_timestamp.getTime());
			                		// console.log(info[m].end_timestamp>current_timestamp && info[m].orderStatus!="cancelled");
			                			var myDate2 = moment(info[m].end_timestamp);
			                		if(moment(info[m].end_timestamp)>current_timestamp && info[m].orderStatus!="cancelled")
			                		{
			                			booking_list_upcoming.push(order);
			                		}
			                		else
			                		{
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
		// Add the profile image
		profileAdd:function (req,res) 
		{

			upload(req,res,function(err)
			{
				console.log(req.file);
				console.log(req.body)
				user.findOne({token:req.headers['token']},function(rez,resz)
				{
					if(rez)
					{
						res.send({status:false,message:"User Not Found"})
					}
					user.findOneAndUpdate(
					{
						'_id':resz._id
					}, 
					{
						'image_path':"http://192.169.164.224:8111/"+req.file.path
					}, 
					{new:true},
					function(err, doc) 
					{
						if (err) 
						{
							res.json({status: false,message: 'Profile Not Updated'});
							return false;
						}
						else 
						{
							res.send({status:true,message:"Profile Successfully uploaded",imageUrl:doc.image_path});
							return false;
						}

					});
				});
			});
		},
		// Get all spaces for a user
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
					                         var parkingType = space[i].parking_type.split(',');
					                         var surfaceMaterial = space[i].surfaceMaterial.split(',');
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
				    						
					    					order.find({place_id:space[i]._id},function(err2,orders){
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
							                                          'duration':orders[j].duration,
							                                          'paidAmount':Math.round(orders[j].Amount),
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
							                                          'duration':orders[j].duration,
							                                          'paidAmount':Math.round(orders[j].Amount),
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
							                                          'duration':orders[j].duration,
							                                          'paidAmount':Math.round(orders[j].Amount),
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
							                                          'duration':orders[j].duration,
							                                          'paidAmount':Math.round(orders[j].Amount),
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
	  	// delete the particular vehicle
		deleteVehicle:function(req,res)
		{
		 	user.findOne({token:req.body.token},function(rez,resz)
		    {
		      vehicleDtls.find({'user_id':resz._id,'_id':req.body.vehicleId},function(err){
		      if(err)
		      {
		        res.send({status:false,"message":"Error Occured"});
		      }  
		      else
		      {
		        res.send({status:true,"message":"Vehicle details deleted successfully"});
		      }      
		      }).remove().exec();
		    });
		},
		// change the user password
		changepassword:function(req,res)
		{
			user.findOne({token:req.body.token}, function(err, guy) 
			{		
				if (!err && guy) 
				{
					if(req.body.oldpassword != encryptor.decrypt(guy.password)){
						res.send({status:false,message:"Old Password is not correct"})
						return false;	
					}
				        //console.log(guy)
				        user.findOneAndUpdate(
				        {
				          '_id':guy._id 
				        },
				        {
				          password: encryptor.encrypt(req.body.newpassword)
				        },
				        {new:true},
				        function(errr,info)
				        {
				          if(errr)
				          {
				            res.send({status:false,message:"Password Not Updated"});
				          }
				          else
				          {
				            
				            res.send({status:true,message:" New Password Updated"});
				          }
				        });     
			    } 
			    else 
			    {
			      res.json({status: false,message: 'User Not Found' });
				}
			});     
		},
		// Forgot password
		frgt_passwd:function(req,res)
		{
				function randomString(length, chars) {
					var result = '';
					for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
						return result;
				}
				var user_email = req.body.email;
				var user_phone;
				user.find({phone_number: req.body.phoneNumber},function(err,docs){
					if(err)
					{
						res.send({status:false,message:"Something went wrong Try Again"})
					}
					else
					{
						user_phone = req.body.phoneNumber;
						console.log(user_phone)
						var otp_gen =randomString(5, '0123456789'); 
						//console.log(otp_gen)
						user.findOneAndUpdate({
							phone_number: user_phone 
						}, 
						{
							otp :"12345"/* otp_gen*/,
							status:"0"
						}, 
						{
							new: true
						},
						function(errs, sdoc) 
						{
							console.log(sdoc)
							if (!sdoc){
								res.json({status:false,message:"Phonenumber is not available"});
							}
							else
							{
				            	client.sendMessage({
								  to:"+919944721544"/* user_phone*/,
								  from: '+16176525030',
								  body: 'One time Password for forgot password : '+otp_gen
								},
								function(erwr,data)
								{
								   if(erwr) 
									{
										res.json({status:false,message:"Otp Not Send"});
										return false;
									}
									res.json({status:true,message:"Otp Successfully Send"});									
								//   console.log(data);
								});

							}
						});
					}
				});
		},
		//Reset the password
		rst_pwd:function(req,res)
		{
				var new_passwd = req.body.newPassword;
				var new_passwd_encpt = encryptor.encrypt(new_passwd);
				user.findOne({token:req.body.token}, function(err, guy) 
				{
					if (!err && guy) 
					{
			                //console.log(guy)
			                user.findOneAndUpdate(
			                {
			                	token:req.body.token
			                },
			                {
			                	password: new_passwd_encpt
			                },
			                {new:true},
			                function(errr,info)
			                {
			                	console.log(info)
			                	if(errr)
			                	{
			                		res.send({status:false});
			                	}
			                	else
			                	{
			                		var myobj = {userName:info.firstname +" "+info.lastname,userPhoneNumber:info.phone_number,userMailId:info.email,HotlineMailId:info.hotline_email_id,HotlinePhoneNumber:info.hotline_phone_number,ProfileImageUrl:info.image_path};
			                		res.send({status:true,myobj});
			                	}
			                })     
			            } else {
			            	res.json({
			            		status: false,
			            		message: 'User Not Found'
			            	});
			            }
			        });    
		},
		// For violator ,cannot find my space
		cant_find_spot:function(req, res, next)
		{
		    add_space.findOne({_id: req.body.place_id}, function(err, docs){
		      var owner_id = docs.user_id;
		      user.findOne({_id: owner_id}, function(err, data){
		        if(err){
		          res.json({
		            status: false,
		            message: "Owner info not available!"
		          });
		        }else{
		          console.log(data);
		          res.send({status: true, message:"Contact Owner", Contact: data.phone_number, Email:data.email, Name: data.firstname});
		        }
		      });
		    });
		},
		// For violator ,user is in my space 
		User_In_Spot:function(req, res, next)
		{ 
			carUpload(req, res, function(err)
			{
		      	var current_timestamp = moment();
		     //  	var offset = 5+7; // 5 hours for IST and 7 hours for MST
		     //    current_timestamp.setHours(current_timestamp.getHours() + offset);
		    	// current_timestamp.setMinutes(current_timestamp.getMinutes() + 30);
				console.log('current_timestamp->'+current_timestamp.format());
		    	user.findOne({token:req.headers['token']},function(err,guy){
		    		if(err)
		    		{
		    			res.send({status:false,"message":"Error Occured"});
		    			return false;
		    		}
		    		else
		    		{

		    			order.findOne({"spotStickerId":req.body.spotStickerId,"place_id":req.body.placeId,"start_timestamp":{$lte: current_timestamp},"end_timestamp":{$gte: current_timestamp}, 'extendedStatus':null, 'orderStatus':{$ne:"cancelled"}},function(err2,current){
		    				if(err2)
		    				{
		    					res.send({status:false,"message":"Error Occured!!"});
		    					return false;
		    				}
		    				else if(current == null)
		    				{
									res.send({status:false,message:"Check the input details"});								
		    				}
		    				else
		    				{
		    					add_space.findOne({"place_id":req.body.placeId},function(erq,owner){
				    				if(erq)
				    				{
				    					res.send({status:false,message:"Error Occured"});
				    					return false;
				    				}
				    				else
				    				{
				    					
				    						if(owner && guy._id.toString()==owner.user_id.toString())
					    					{
					    						spot.findOne({'spotStickerId':req.body.spotStickerId,'place_id':req.body.placeId},function(era,spots){
					    							if(era)
					    							{
					    								res.send({status:false,message:"Error occured during finding spots"});
					    								return false;
					    							}
					    							else
					    							{
					    								if(spots)
					    								{
					    									here();
					    								}
					    							}
					    						});		
					    					}	
				    					
				    					else if(guy._id.toString() == current.user_id.toString())
				    					{
				    						if(current.spotStickerId == req.body.spotStickerId)
				    						{
				    							here();
				    						}
				    						else
				    						{
				    							res.send({status:false,message:"You can't add violations for this space"});
				    						}
				    					}
				    					else
				    					{
				    						res.send({status:false,message:"You're not allowed to add violations for this space"});
				    					}
				    				}
				    			});
		    					console.log("here");
			    				function here()
			    				{
				    				if(current.vehicleNumber == req.body.vehicleNumber)
				    				{
				    					res.send({status:false,"message":"Vehicle Number is booked for this place for the current time"});
				    				}
				    				else
				    				{
					    				order.findOne({"vehicleNumber":req.body.vehicleNumber},function(err1,data){
						    				if(err1)
						    				{
							    				res.send({status:false,"message":"Error Occured!"});
							    				return false;
						    				}
						    				else
						    				{
				    							if(data)
						    					{
						    						violator_dtls.findOne({"spotStickerId":req.body.spotStickerId,"place_id":req.body.placeId,"order_id":data._id},function(errrr,viol){
						    							if(errrr)
						    							{
						    								res.send({status:false,message:"Errrror"});
						    								return false;
						    							}
						    							else if(viol)
						    							{
						    								res.send({status:true,message:"Violation already registered"});
						    							}
						    							else
						    							{
							    							var report = new violator_dtls({user_id: guy._id,
															place_id:req.body.placeId,
															spotStickerId: req.body.spotStickerId, image_name:"http://192.169.164.224:8111/"+ req.file.originalname,
															carNumber: req.body.vehicleNumber, State:req.body.State,
															problem_type:req.body.ProblemType,
															not_listed_details:req.body.NotListedDetails,order_id:data._id});
															report.save(function(err)
															{
																if(err)
																{
																	res.json({status: false,message: "fail to Register your Report"});
																}
																else
																{
																	// console.log("end_time"+end_time);
																	res.send({status: true,'OrderId':report.order_id,message: "Your problem reported Successfully."});
																}
															});		
						    							}
						    						});
													
						    					}			    					
						    					else
						    					{
						    						res.send({status:false,"message":"Vehicle Not Found in the Database"})
						    					}
						    				}
					    				});	
				    				}
				    			}
		    				}
		    			});
		    		}
		    	});
			});			
		},
		// For violator problem is not listed
		problem_not_listed:function(req, res, next)
		{

			res.send({status: true, Email:"hello@hasty.com", CustomerCare: "555-666-888"});
		},
		// Lock and unloack tha space
		myspaceLock:function(req,res,next)
		{
			console.log(req.body)
			user.findOne({token:req.body.token},function(rez,resz)
			{			
				add_space.findOneAndUpdate(
				{
					'user_id':resz._id,
					'_id':req.body.SpaceId
				},
				{
					available_status:req.body.AvailableStatus
				},
				{
					new:true
				},
				function(err,docs)
				{
					if(docs)
					{
						res.send({status:true,"spaceId":docs._id,message:"status Successfully updated"});
					}
					else
					{
						res.send({status:false,message:"Space Not Updated"});
					}
				});
			});
		},
		//Add the space image 
		edit_upload:function(req,res,next)
		{  
			loc_upload(req,res,function(err){
				user.findOne({token:req.headers['token']},function(rez,resz)
				{
				   add_space.findOneAndUpdate({'user_id':resz._id,'_id':req.body.SpaceId}, {'spotimage':[{'image':"http://192.169.164.224:8111/"+req.file.path}]}, function(err, doc) 
				   {	
				         if (err || doc==null) {
				           res.send({
				             status: false,
				             message: 'Space not Found'
				           });
				         }
				         else {
				           res.send({
				             status: true,
				             'SpaceId':doc._id,
				             'message':'space Successfully updated'
				           });
				         }
				    });
				});
			})
		},
		//Get the space details and space image
		spaceimage:function(req,res)
		{
			add_space.findOne({_id:req.body.spaceId},function(err,info)
			{
				//console.log(info)
				if(err)
				{
					res.send({status:false,message:"No Space found for this ID"})
					return false;
				}				
				//console.log(myobj + "qqqqqqqqqqq")
				if(info == null || info == "" || info == undefined)
				{
					res.send({status:false,message:"No space image for this space"});
					return false;
				}
				else
				{
					var myobj = {parking_type:info.parking_type,numberOfAvailableSpaces:info.numberOfAvailableSpaces,numberOfSpace:info.numberOfSpace,description:info.description,available_status:info.available_status,hourly:info.hourly,weekly:info.weekly,daily:info.daily,monthly:info.monthly,dimensionOfSpace:info.dimensionOfSpace,surfaceMaterial:info.surfaceMaterial,placeHeight:info.placeHeight,space_delinated:info.space_delinated,spotimage:info.spotimage,amentities:info.amenties.split(','),surfaceMaterial:info.surfaceMaterial.split(',')};
					console.log(myobj + "aaaaaaaaaaaaaaaaaaaaaa")
					res.send({status:true,message:"success",spaceDetails:myobj})
				}
			})
		},
		// Create a new password
		createpassword:function(req,res)
		{
			user.findOne({ phone_number:req.body.phoneNumber }, function(err, guy) 
			{
				if (!err && guy) 
				{
		            //console.log(guy)
		            user.findOneAndUpdate(
		            {
		            	phone_number:req.body.phoneNumber
		            },
		            {
		            	password: encryptor.encrypt(req.body.password)
		            },
		            {new:true},
		            function(errr,info)
		            {
		            	console.log(info)
		            	if(errr)
		            	{
		            		res.send({status:false,message:"Password Not Updated"});
		            	}
		            	else
		            	{
		            		//var myobj = {userName:info.firstname +" "+info.lastname,userPhoneNumber:info.phone_number,userMailId:info.email,HotlineMailId:info.hotline_email_id,HotlinePhoneNumber:info.hotline_phone_number,ProfileImageUrl:info.image_path};
		            		res.send({status:true,message:"Password Updated"});
		            	}
		            });     
		        } 
		        else 
		        {
		        	res.json({
		        		status: false,
		        		message: 'User Not Found'
		        	});
				}
		    }); 		
		},
		// get vard details of a user
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
							console.log("++++++++++===============++++++++========+++++++++")
							var myobj = {cardId:info[i].cardDetails[0]._id,customerId:info[i].cardDetails[0].customerId,cardnumber:info[i].cardDetails[0].cardnumber,expMonth:info[i].cardDetails[0].expMonth,expYear:info[i].cardDetails[0].expYear}
							//var myobj = {carddetails:info[i].cardDetails[i]}
							cardDetails.push(myobj)
							console.log("Myobj"+myobj);
						}
					}
					if(cardDetails.length == 0 || cardDetails.length == null)
					{
						res.send({status:false,message:"No cards found"})	
						return false;
					}
					res.send({status:true,message:"ListOfSavedCards",cardDetails})
				})	
			});
		},
		// delete the particular card
		deletecard:function(req,res)
		{
			var cardId = req.body.cardId;
			user.findOne({token:req.body.token},function(reqa,resa)
			{
				var userid = resa._id;
				console.log(userid + "fffffffffffffffffffffffffffffffffff")
	            cardDtls.findOneAndUpdate({user_id:userid}, 
	            {
	                $pull: 
	                {
	                    cardDetails:
	                    {
	                        _id: cardId
	                    }
	                }
	            }, 
	            {
	                new: true
	            },
	            function(reqx,doc)
	            {
	            	console.log(reqx)
	            	console.log(doc)
	            	if (doc)
	            	{
	            		res.json({status:true,message:"Card Deleted Successfully"})	
	            	}
	                
	            });				
			});			
		},
		// making payment for booking
		payment:function(req,res)
		{

			/*console.log("ssssssssssssssssss" + req.body.token + )*/
			var custId = req.body.customerId;
			var payamount = parseFloat(req.body.chargeAmount);
			var stripeEmail = req.body.stripeEmail;
			var stripeToken = req.body.stripeToken;
			var toKen = req.body.token;
			var OrderID = req.body.orderId;
			user.findOne({token:toKen},function(reqa,resa)
			{
				var userId = resa._id;
				cardDtls.findOne({user_id:userId,"cardDetails.customerId":custId},function(err,info)
				{
					if(err || info== null)
					{
						var amounT = payamount*100;
						stripe.customers.create(
						{
							email: stripeEmail,
							card: stripeToken
						})
						.then(customer =>
						stripe.charges.create(
						{
							amount:amounT,
							description: "Sample Charge",
							currency: "usd",
							customer: customer.id
						}))
						.then(charge => {
							console.log(charge.customer);
							var cardobj=new cardDtls({user_id:userId,cardDetails:[{customerId:charge.customer,cardnumber:charge.source.last4,expMonth:charge.source.exp_month,expYear:charge.source.exp_year}]})
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
						console.log(info.cardDetails[0].customerId)
						stripe.charges.create(
						{
							amount:amounT,
							description: "Sample Charge",
							currency: "usd",
							customer: info.cardDetails[0].customerId
						})
						.then(charge => {
							console.log(charge.customer);
							cardDtls.findOne({user_id:userId,"cardDetails.cardnumber" : charge.source.last4},function(mmm,kkk)
							{
								if(mmm)
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
											res.send({status:true,message:"payment successful",details:charge})
											return false;
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
		//making payment for marker or spotsticker
		rentspacepayment:function(req,res)
		{

			/*console.log("ssssssssssssssssss" + req.body.token + )*/
			var custId = req.body.customerId;
			var payamount = parseFloat(req.body.chargeAmount);
			var stripeEmail = req.body.stripeEmail;
			var stripeToken = req.body.stripeToken;
			var toKen = req.body.token;
			var spaceId = req.body.MySpaceId;
			user.findOne({token:toKen},function(reqa,resa)
			{
				var userId = resa._id;
				cardDtls.findOne({user_id:userId,"cardDetails.customerId":custId},function(err,info)
				{
					if(err || info== null)
					{
						var amounT = payamount*100;
						stripe.customers.create(
						{
							email: stripeEmail,
							card: stripeToken
						})
						.then(customer =>
						stripe.charges.create(
						{
							amount:amounT,
							description: "Sample Charge",
							currency: "usd",
							customer: customer.id
						}))
						.then(charge => {
							console.log(charge.customer);
							var cardobj = new cardDtls({user_id:userId,cardDetails:[{customerId:charge.customer,cardnumber:charge.source.last4,expMonth:charge.source.exp_month,expYear:charge.source.exp_year}]})
						cardobj.save(function(errcard,cardinfo)
						{
							if (errcard)
							{
								res.send({status:false,message:"Card not saved"})
							}
							else
							{
								res.send({"status":true,"message":"payment successful","details":charge})
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
						console.log(info.cardDetails[0].customerId)
						stripe.charges.create(
						{
							amount:amounT,
							description: "Sample Charge",
							currency: "usd",
							customer: info.cardDetails[0].customerId
						})
						.then(charge => {
							console.log(charge.customer);
							cardDtls.findOne({user_id:userId,"cardDetails.cardnumber" : charge.source.last4},function(mmm,kkk)
							{
								if(mmm)
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
											res.send({status:true,message:"payment successful",details:charge})
											return false;
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
		// new space hardcorded values 
		rentspacedrpdwn:function(req,res)
		{
			var spacetype = ["Tandem","Driveway","Parking Lot","Garage","Others"];
			var surfacematerial = ["Asphalt","Brick","Concrete","Gravel","Dirt","Lawn","Other"];
			var amenties = ["Indoor","Outdoor","Covered","Cctv","Fenced"];
			var spotstickerprice = "4.95";
			var markerprice = "19.95";
			res.send({status:true,message:"rent space details",spotStickerPrice:spotstickerprice ,markerPrice:markerprice,spaceType:spacetype,amenties:amenties,surfaceMaterial:surfacematerial})
		},
		//for remove the space lock from the particular space
		removeSpaceLock:function(req,res)
		{
			var placeid = req.body.placeId;
			var toKen = req.body.token;
			add_space.findOneAndUpdate(
			{
				_id:placeid
			},
			{
				processingStatus:"no"
			},
			function(err,info)
			{
				if (err)
				{
					res.send({status:false,message:"Not updated"});
					return false;
				}
				res.send({status:true,message:"Status Updated"})
			})
		}
	}
	module.exports = ctrl;