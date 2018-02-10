var mongoose = require('mongoose');


//DB credentials
mongoose.createConnection('mongodb://localhost:27017/hasty_parking');

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

var ctrl = {

    webSign: function(req, res, next) {
        // if (req.session.mysess)
        // {
        //   res.send({status:false,message:"Already logged in"})
        // }
        // else
        // {
        user.findOne({
            email: req.body.email
        }, 'email password usertype', function(err, guy) {
            if (!err && guy) {
                res.send({
                    status: false,
                    message: "Email Already Registered"
                })
            } else {
                var objToken = {
                    password: "sdq2312398qzkj^$%^$%^$bda@@$%%%skjd12312akjsd12321kasd1!@#!@12!^&$^%^@#$@$%",
                    email: "pmelamparithi@gmail.com",
                    _id: "asda12312342345654645645"
                }
                var token = jwt.sign(objToken, key, {
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
                var otp_gen = randomString(5, '0123456789');
                var ref_code = req.body.fname + randomString(5, '012AVkiskfkfbwkfsdflkjhasdfj3456789');
                var save_dtls = new user({
                    "firstname": req.body.fname,
                    "ref_code": ref_code,
                    "lastname": req.body.lname,
                    "phone_number": req.body.phone_number,
                    "email": req.body.email,
                    "password": ency_passwd,
                    "token": token,
                    "wallet": wallet,
                    "status": "0",
                    "otp": otp_gen /*otp_gen*/ ,
                    "device_token": req.body.deviceToken,
                    "device_type": req.body.deviceType,
                    "f_id": req.body.facebookId,
                    "g_id": req.body.googleId,
                    "violations": 0
                });
                console.log(save_dtls)

                client.sendMessage({
                    to: "+919530167167",
                    from: '+16176525030',
                    body: 'One Time Password is : ' + otp_gen
                }, function(errsms, data) {
                    if (data) {
                        save_dtls.save(function(errs, savedData) {
                            req.session.phoneNumber = savedData.phone_number;
                            console.log("lllllllllll" + req.session.phoneNumber)
                            var my_sessionEmail = encryptor.encrypt(savedData.email);
                            req.session.mysess = my_sessionEmail;
                            req.session.userid = savedData._id;
                            console.error(errs)
                            console.log("_____________________________")
                            //var myobj = {userName:savedData.firstname +" "+savedData.lastname,userPhoneNumber:savedData.phone_number,userMailId:savedData.email,HotlineMailId:savedData.hotline_email_id,HotlinePhoneNumber:savedData.hotline_phone_number};
                            console.log(savedData)
                            if (!errs) {

                                res.send({
                                    status: true,
                                    message: "Signup Successful",
                                    token: token,
                                    email: savedData.email
                                });
                            } else {
                                res.send({
                                    status: false,
                                    message: "Signup Not Successful"
                                });
                            }
                        });
                    } else {

                        res.send({
                            status: false,
                            message: "Try Again"
                        });
                    }
                });
            }
        });
       
    },

    webLogin: function(req, res, next) {
        console.log(req.body)
        user.findOne({
                email: req.body.email
            },
            function(err, guy) {
                if (!err && guy) {
                    console.log(encryptor.decrypt(guy.password));
                    if (encryptor.decrypt(guy.password) == req.body.password) {
                        if (guy.status == "1") {
                            res.send({
                                status: false,
                                "message": "Not a Verified User"
                            });
                        } else {
                            console.log("-------------------------------------------")

                            console.log("+++++++++++++++++++++++++++++++++++++++++++")
                            var toKen = jwt.sign(guy._id, key, {
                                expiresIn: 1440 // expires in 24 hours
                            });

                            req.session.token = toKen;


                            user.findOneAndUpdate({
                                email: req.body.email
                            }, {
                                token: toKen,
                                device_token: req.body.deviceToken,
                                device_type: req.body.deviceType
                            }, {
                                new: true
                            }, function(reqa, resa) {
                                if (reqa) {
                                    res.send({
                                        status: false,
                                        "message": "Check DeviceToken and Type"
                                    })
                                }
                                var myobj = {
                                    userName: resa.firstname + " " + resa.lastname,
                                    userPhoneNumber: resa.phone_number,
                                    userMailId: resa.email,
                                    HotlineMailId: resa.hotline_email_id,
                                    HotlinePhoneNumber: resa.hotline_phone_number,
                                    ProfileImageUrl: resa.image_path,
                                    token: resa.token
                                };
                                req.session.phoneNumber = resa.phone_number;
                                req.session.userid = resa._id;
                                var my_sessionEmail = encryptor.encrypt(resa.email);
                                req.session.mysess = my_sessionEmail;
                                console.log("kkkkkkkk" + req.session.mysess);
                                res.json({
                                    status: true,
                                    message: 'Login Successful',
                                    userdetails: myobj

                                });

                            });
                        }
                    } else {
                        res.send({
                            status: false,
                            "message": "Password is Incorrect"
                        })
                    }
                } else {
                    res.json({
                        status: false,
                        message: 'User Not Found'
                    });
                }
            });
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
            console.log(req.body);
            req.session.lat = req.body.lat;
            req.session.lng = req.body.lng;
            req.session.startdate = req.body.startdate;
            req.session.enddate = req.body.enddate;
            res.send({
                status: true,
                'message': "Success"
            });
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
            console.log('----------------------------------------------------------------------------')
            var myDate1 = new Date(req.session.startdate);
            var dd = myDate1.getDate();
            var mm = myDate1.getMonth() + 1; //January is 0!
            var yyyy = myDate1.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            var hh = myDate1.getHours();
            var Mm = myDate1.getMinutes();
            if (hh < 10) {
                dd = '0' + dd;
            }
            if (Mm < 10) {
                Mm = '0' + Mm;
            }
            var startTime = hh + ':' + Mm;
            var startDate = dd + '/' + mm + '/' + yyyy;
            console.log(startTime);
            console.log(startDate);


            var myDate2 = new Date(req.session.enddate);
            var dd = myDate2.getDate();
            var mm = myDate2.getMonth() + 1; //January is 0!
            var yyyy = myDate2.getFullYear();
            if (dd < 10) {
                dd = '0' + dd;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            var hh = myDate2.getHours();
            var Mm = myDate2.getMinutes();
            if (hh < 10) {
                dd = '0' + dd;
            }
            if (Mm < 10) {
                Mm = '0' + Mm;
            }
            var endTime = hh + ':' + Mm;
            var endDate = dd + '/' + mm + '/' + yyyy;
            console.log(endTime);
            console.log(endDate);


            var h = (Math.abs(myDate1 - myDate2) / 3.6e6);
            console.log('hours' + h);
            var amount = 0;

            var total_hours = h + "hours";
            console.log(total_hours)
            // counting total number of months
            var months = 0,
                weeks = 0,
                days = 0;

            // total hours for a day,week,month
            var wh = 168,
                dh = 24,
                mh = 720;


            // calculating total number of months
            if (h >= mh) {
                months = parseInt(h / mh);
                h = parseInt(h % mh);

                //calculating total number of weeks
                if (h >= wh) {
                    weeks = parseInt(h / wh);
                    h = parseInt(h % wh);
                }

                //calculating total number of days
                if (h >= dh) {
                    days = parseInt(h / dh);
                    h = parseInt(h % dh);
                }
            } else {

                //calculating total number of weeks
                if (h >= wh) {
                    weeks = parseInt(h / wh);
                    h = parseInt(h % wh);
                }

                //calculating total number of weeks
                if (h >= dh) {
                    days = parseInt(h / dh);
                    h = parseInt(h % dh);
                }
            }

            console.log('hours:' + h + ' days:' + days + ' weeks:' + weeks + ' months:' + months);
            var Searched_list = [];
            var latlong = [req.session.lat, req.session.lng];
            console.log(latlong);
            add_space.find({
                latlong: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: latlong
                        },
                        $maxDistance: 1609.340000
                    }
                },
                available_status: "yes"
            }).limit(20).exec(function(err, docs) {
                if (err) {
                    console.log(err);
                    return res.json(500, err);
                } else {

                    if (docs.length == 0) {
                        res.send({
                            status: false,
                            message: "Error:No Entry Found"
                        });
                    } else if (docs.length >= 1) {
                        console.log('docs length' + docs.length);
                        for (var i = 0; i < docs.length; i++) {

                            console.log("TEST1:" + docs[0].numberOfAvailableSpaces);
                            if (docs[i].numberOfAvailableSpaces > 0) {
                                var ph = docs[i].hourly;
                                var pw = docs[i].weekly;
                                var pd = docs[i].daily;
                                var pm = docs[i].monthly;
                                // location
                                var location = docs[i].location;
                                console.log(location);
                                // calculating amount
                                amount = (ph * h) + (pd * days) + (pw * weeks) + (pm * months);
                                console.log(amount);
                                var latlong = docs[i].latlong[0] + ',';
                                latlong += docs[i].latlong[1];
                                console.log(latlong + ' ' + docs[i].latlong);

                                var result = [req.session.lat, req.session.lng];
                                console.log('result' + result + '  ' + docs[i].latlong);
                                if (result[0] == docs[i].latlong[0] && result[1] == docs[i].latlong[1]) {
                                    //creating object for each location
                                    var temp = {
                                        'LatLong': latlong,
                                        'PlaceId': docs[i]._id,
                                        'FromToDate': req.body.startdate + ' to ' + req.body.enddate,
                                        'Duration': total_hours,
                                        'TotalAmount': amount,
                                        'PlaceName': docs[i].title,
                                        'LocationName': docs[i].location,
                                        'ParkingType': docs[i].parking_type,
                                        'SpaceType': docs[i].space_type,
                                        'Amenties': docs[i].amenties,
                                        'Description': docs[i].description,
                                        'Searched_status': 'yes',
                                        'Amentities': docs[i].amenties,
                                        'is this space delinated': docs[i].space_delinated,
                                        'Price': docs[i].hourly + '/hrs'
                                    }
                                    Searched_list[i] = temp;
                                } else {
                                    var temp = {
                                        'LatLong': latlong,
                                        'PlaceId': docs[i]._id,
                                        'FromToDate': req.session.startdate + ' to ' + req.session.enddate,
                                        'Duration': total_hours,
                                        'TotalAmount': amount,
                                        'PlaceName': docs[i].title,
                                        'LocationName': docs[i].location,
                                        'ParkingType': docs[i].parking_type,
                                        'SpaceType': docs[i].space_type,
                                        'Amenties': docs[i].amenties,
                                        'Description': docs[i].description,
                                        'Searched_status': 'no',
                                        'Price': docs[i].hourly + '/hrs'
                                    }
                                    Searched_list[i] = temp;


                                }
                            }
                        }
                        console.log(Searched_list);
                        res.json({  
                            'status': true,
                            'message': "List of Available Spaces",
                            'Searched_details': {
                                'Searched_List': Searched_list
                            }
                        });
                    }
                }
            });
        //}
    },
    rentaSpace: function(req, res) {
        //ZIP CODE IMPORTANT
        // if (!req.session.mysess) {
        //     console.log(req.session.mysess);
        //     res.send({
        //         status: false,
        //         message: "Login First..!!"
        //     });
        // } else {
            console.log(req.body);

            var Location = req.body.data.addrl1 + ',' + req.body.data.addrl2 + ',' + req.body.data.zipcode;
            // var LatLong = req.body.data.lat + ',' + req.body.data.lng;
            //var LatLong = "20.15428,55.5248";
            var arr = [];
            arr.push(req.body.data.lat);
            arr.push(req.body.data.lng);
            //var str = LatLong.split(',');
           // arr[0] = req.body.data.lat;
            //arr[1] = req.body.data.lng;
            console.log('kkkkkkk'+arr[0]);
            user.findOne({
                token: req.body.token
            }, function(rez, resz) {
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
                    if (guy.length == 0 && (!err)) {
                        var noas;
                        var nos;
                       // console.log(req.body.data.SpaceType);
                        if (req.body.data.SpaceType == "single") {
                            console.log("single");
                            noas = 1;
                            nos = 1;
                        } else if (req.body.data.SpaceType == "multiple") {
                            console.log("multiplespace");
                            noas = req.body.numberOfSpaceace;
                            nos = req.body.NumberOfSpace;
                        }
                        var arr = [];
                        var str = LatLong.split(',');
                        arr[0] = str[0];
                        arr[1] = str[1];
                        var markerId;

                        function mark() {
                            markerId = req.body.data.zipcode + randomString(5, '012AVkiskfkfbwkfsdflkjhasdfj3456789');
                        }
                        mark();
                        var markerStatus;
                        if (req.body.data.markerType == "1") {
                            markerStatus = true;
                        } else {
                            markerStatus = false;
                        }
                        var person = new add_space({
                            'user_id': resz._id,
                            'title': req.body.data.Title,
                            'location': Location,
                            'parking_type': req.body.data.ParkingType,
                            'space': req.body.data.spaceType,
                            "numberOfAvailableSpaces": noas,
                            'numberOfSpace': nos,
                            "description": req.body.data.Description,
                            "type": req.body.data.Type,
                            "space_delimited": req.body.data.sd,
                            "available_status": req.body.data.AvailableStatus,
                            "latlong": arr,
                            'hourly': req.body.data.Hourly,
                            'weekly': req.body.data.Weekly,
                            'daily': req.body.data.Daily,
                            'monthly': req.body.data.Monthly,
                            'rent_prev_violator': req.body.data.rpv,
                            'placeHeight': req.body.data.HeightRestriction,
                            'paymentDetails': req.body.data.PaymentDetails,
                            'owner_type': req.body.data.OwnerType,
                            'zipcode': req.body.data.zipcode,
                            'cityState': req.body.data.cityState,
                            'address': req.body.data.address,
                            'space_type': req.body.data.SpaceType,
                            'space_delinated': req.body.data.SpaceDelinated,
                            'markerId': markerId,
                            'markerStatus': markerStatus,
                            'amenties': req.body.data.Amentities,
                            'parkingAreaType': req.body.data.parkingAreaType,
                            "flag": "1"
                        });
                        // type will be individual owner or business
                     
                        person.save(function(err, doc) {
                            if (err || doc === 'null') return res.send({
                                status: false,
                                'message': 'sorry not stored:error'
                            });

                            else {

                                var spotIdGeneration;

                                function xyz() {
                                    spotIdGeneration = randomString(4, '0123456789') + req.body.zipcode;
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
        //}
    },
    getInfo: function(req, res) {
        // if (!req.session.mysess) {
        //     console.log(req.session.mysess);
        //     res.send({
        //         status: false,
        //         message: "Login First..!!"
        //     });
        // } else {
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
                            email: user_email
                        });

                    });

                }
            });
       // }
    },
    getparkingId: function(req, res) {
        // if (!req.session.mysess) {
        //     console.log(req.session.mysess);
        //     res.send({
        //         status: false,
        //         message: "Login First..!!"
        //     });
        // } else {
            req.session.placeId = req.body.placeid;

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
    addvehicle: function(req, res) {
        // if (!req.session.mysess) {
        //     console.log(req.session.mysess);
        //     res.send({
        //         status: false,
        //         message: "Login First..!!"
        //     });
        // } else {
            var vehicleNo = req.body.vNo;
            var insuranceNo = req.body.iNo;
            var ModelNo = req.body.mNo;

            vehicleDtls.find({
                vehicleNumber: vehicleNo
            }, function(err, guy) {
                if (guy == null) {
                    var vehicleInputs = new vehicleDtls({
                        vehicleModel: ModelNo,
                        vehicleNumber: vehicleNo,
                        vehicleInsuranceNumber: insuranceNo
                    });
                    vehicleInputs.save(function(err, info) {
                        if (!err) {
                            res.send({
                                status: true,
                                message: "Vehicle Added Successfully",
                                vehicleId: info._id
                            });
                        } else {
                            res.send({
                                status: false,
                                message: "Error Occured!"
                            });
                        }
                    });
                } else if (guy.length == 0) {
                    var vehicleInputs = new vehicleDtls({
                        vehicleModel: ModelNo,
                        vehicleNumber: vehicleNo,
                        vehicleInsuranceNumber: insuranceNo
                    });
                    vehicleInputs.save(function(err, info) {
                        if (!err) {
                            res.send({
                                status: true,
                                message: "Vehicle Added Successfully",
                                vehicleId: info._id,
                                vehicleN: info.vehicleNumber,
                                insuranceN: info.vehicleInsuranceNumber,
                                modelN: info.vehicleModel
                            });
                        } else {
                            res.send({
                                status: false,
                                message: "Error Occured"
                            });
                        }
                    });
                } else if (vehicleNo == guy[0].vehicleNumber) {
                    res.send({
                        status: false,
                        message: "Vehicle Already Saved"
                    })
                }

            });
        //}




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
        if (!req.session.mysess) {
            console.log(req.session.mysess);
            res.send({
                status: false,
                message: "Login First..!!"
            });
        } else {
            var otp = req.body.otpnumber;
            console.log("kkkkkkkkkkkkkkkk" + otp);
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
        }
    },
    frgt_passwd: function(req, res) {
        if (!req.session.mysess) {
            console.log(req.session.mysess);
            res.send({
                status: false,
                message: "Login First..!!"
            });
        } else {
            function randomString(length, chars) {
                var result = '';
                for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
                return result;
            }
            var user_email = req.session.mysess;
            var user_phone;
            console.log("phone_number" + req.session.phone)
            user.find({
                phone_number: req.session.phoneNumber
            }, function(err, docs) {
                if (err) {
                    res.send({
                        status: false,
                        message: "Something went wrong Try Again"
                    })
                } else {
                    user_phone = req.session.phoneNumber;
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
                                    message: "Phonenumber is not available"
                                });
                            } else {
                                client.sendMessage({
                                        to: "+919530167167" /* user_phone*/ ,
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
                                        //   console.log(data);
                                    });

                            }
                        });
                }

            });
        }
    },
    rst_pwd: function(req, res) {
        if (!req.session.mysess) {
            console.log(req.session.mysess);
            res.send({
                status: false,
                message: "Login First..!!"
            });
        } else {
            var new_passwd = req.body.new_pass;
            var new_passwd_encpt = encryptor.encrypt(new_passwd);
            console.log("mmmmmmmmmmmmmmmmmmm" + new_passwd_encpt)
            console.log(req.session.token)
            user.findOne({
                token: req.session.token
            }, function(err, guy) {
                if (!err && guy) {
                    user.findOneAndUpdate({
                            token: req.session.token
                        }, {
                            password: new_passwd_encpt
                        }, {
                            new: true
                        },
                        function(errr, info) {
                            console.log(info)
                            if (errr) {
                                res.send({
                                    status: false
                                });
                            } else {
                                
                                res.send({
                                    status: true
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
    console.log('aaaaaaaaaaaaa');
    var current = new Date();
    var offset = 5+7; // 5 hours for IST and 7 hours for MST
    current.setHours(current.getHours() + offset);
    current.setMinutes(current.getMinutes() + 30);
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
                        else
                        {
                            res.send({status:true,message:"success",mySpaceDetails:mySpaceDetails,spaceListReceivedBooking:{"bookingListUpcoming":upcoming_booking,"bookingListPast":past_booking}});
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
                                     console.log(t_latlong)
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
                                        'parkingType':space[i].parking_type,
                                        'parkingSpaceType':space[i].space_type,
                                        'parkingAreaType':space[i].parkingAreaType,
                                        'amentities':space[i].amenties,
                                        'isThisSpaceDelinated':space[i].space_delinated,
                                        'description':space[i].description,
                                        'imageLink':space[i].spotimage
                                        

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
                                        'parkingType':space[i].parking_type,
                                        'parkingSpaceType':space[i].space_type,
                                        'parkingAreaType':space[i].parkingAreaType,
                                        'amentities':space[i].amenties,
                                        'isThisSpaceDelinated':space[i].space_delinated,
                                        'description':space[i].description,
                                        'imageLink':space[i].spotimage
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
                                                var myDate = new Date(orders[j].start_timestamp);
                                                    var dd = myDate.getDate();
                                                    var mm = myDate.getMonth()+1; //January is 0!
                                                    var yyyy = myDate.getFullYear();
                                                    if(dd<10)
                                                    {
                                                        dd='0'+dd;
                                                    } 
                                                    if(mm<10)
                                                    {
                                                        mm='0'+mm;
                                                    } 
                                                    var hh = myDate.getHours();
                                                    var Mm = myDate.getMinutes();
                                                    if(hh<10)
                                                    {
                                                        hh='0'+hh;
                                                    } 
                                                    if(Mm<10)
                                                    {
                                                        Mm='0'+Mm;
                                                    }
                                                    var startTime = hh+':'+Mm;
                                                    var myDate = new Date(orders[j].end_timestamp);
                                                    var dd = myDate.getDate();
                                                    var mm = myDate.getMonth()+1; //January is 0!
                                                    var yyyy = myDate.getFullYear();
                                                    if(dd<10)
                                                    {
                                                        dd='0'+dd;
                                                    } 
                                                    if(mm<10)
                                                    {
                                                        mm='0'+mm;
                                                    } 
                                                    var hh = myDate.getHours();
                                                    var Mm = myDate.getMinutes();
                                                    if(hh<10)
                                                    {
                                                        hh='0'+hh;
                                                    } 
                                                    if(Mm<10)
                                                    {
                                                        Mm='0'+Mm;
                                                    }
                                                    var endTime = hh+':'+Mm;
                                                    var startDate = dd+'/'+mm+'/'+yyyy;
                                                    // var endDate = "asd";
                                                    var myDate = new Date(orders[j].end_timestamp);
                                                    var dd = myDate.getDate();
                                                    var mm = myDate.getMonth()+1; //January is 0!
                                                    var yyyy = myDate.getFullYear();
                                                    if(dd<10)
                                                    {
                                                      dd='0'+dd;
                                                    }   
                                                    if(mm<10)
                                                    {
                                                        mm='0'+mm;
                                                    } 
                                                    endDate = dd+'/'+mm+'/'+yyyy;
                                                if(orders[j].end_timestamp>current && orders[j].paymentStatus!='cancelled')
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
                                                              'startDate':startDate,
                                                              'endDate':endDate,
                                                              'startTime':startTime,
                                                              'endTime':endTime,
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
                                                              'startDate':startDate,
                                                              'endDate':endDate,
                                                              'startTime':startTime,
                                                              'endTime':endTime,
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
                                                              'startDate':startDate,
                                                              'endDate':endDate,
                                                              'startTime':startTime,
                                                              'endTime':endTime,
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
                                                              'startDate':startDate,
                                                              'endDate':endDate,
                                                              'startTime':startTime,
                                                              'endTime':endTime,
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
            add_space.find({
                '_id': placeId
            }, function(err, docs) {
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


                    res.send({
                        'status': true,
                        'message': "space details",
                        'startdate': req.session.startdate,
                        'enddate': req.session.enddate,
                        'userid': req.session.userid,
                        'Searched_details': docs
                    });
                }


            });
       // }
    },
    getUpcomingPastDetails:function(req,res)
{
      var current_timestamp=new Date();
      var offset = 5+7; // 5 hours for IST and 7 hours for MST
      current_timestamp.setHours(current_timestamp.getHours() + offset);
      current_timestamp.setMinutes(current_timestamp.getMinutes() + 30);
      console.log('current_timestamp->'+current_timestamp);
      console.log(req.session.userid);
      user.findOne({_id:req.session.userid},function(rez,resz){
        console.log(resz._id);
        var myobj = {userName:resz.firstname +" "+resz.lastname,userPhoneNumber:resz.phone_number,userMailId:resz.email,HotlineMailId:resz.hotline_email_id,HotlinePhoneNumber:resz.hotline_phone_number,ProfileImageUrl:resz.image_path};
        order.find({'user_id':resz._id,'extendedStatus':null},function(err,info){
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
                console.log(m);
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
                              console.log(new Date(info[m].end_timestamp)>current_timestamp && info[m].paymentStatus!="cancelled");
                            if(new Date(info[m].end_timestamp)>current_timestamp && info[m].paymentStatus!="cancelled")
                            {
                                if(space.markerStatus==true)
                                {
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
                                        'amount':Math.round(info[m].Amount),
                                        'parkingType':space.parking_type,
                                        'parkingSpaceType':space.space_type,
                                        'amentities':space.amenties,
                                        'parkingAreaType':space.parkingAreaType,
                                        'isThisSpaceDelinated':space.space_delinated,
                                        'description':space.description,
                                        'userdetails':myobj
                                    }
                                }
                                else  if(info[m].paymentStatus!="cancelled")
                                {
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
                                        'amount':Math.round(info[m].Amount),
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
                                        'amount':Math.round(info[m].Amount),
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
                                        'amount':Math.round(info[m].Amount),
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
                            if(new Date(info[m].end_timestamp)>current_timestamp && info[m].paymentStatus!="cancelled")
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
    
    req.session.placeid = req.body.placeid;
    console.log(req.session.placeid);
    res.send({
                status: true,
                'message': "Success"
    });

},
spacehistorydetails:function(req,res){
    var placeId = req.session.placeid;
    console.log('k'+placeId);
            add_space.find({
                '_id': placeId
            }, function(err, docs) {
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
                        'startdate': req.session.startdate,
                        'enddate': req.session.enddate,
                        'userid': req.session.userid,
                        'Searched_details': docs
                    });
                }


            });

},


}
module.exports = ctrl;