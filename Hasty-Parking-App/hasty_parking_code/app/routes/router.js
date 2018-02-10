var express = require('express');
var app = new express.Router();
var fs = require('fs')
var ctrl = require('../controller/hasty_controller.js');
var renderingpages = require('../controller/renderingpages.js');
app.use(express.static('public'));

// For signup 
app.post("/user_signup",ctrl.save_user_details);

//For Login
app.post("/user_login",ctrl.userlogin);

//For Vehicle Details
app.post("/vehicleDtls",ctrl.authMiddleware,ctrl.savevehicleDtls);

//For Get all vehicle Details
app.post("/getAllVehicles",ctrl.authMiddleware,ctrl.getallVehicleDetails);
//For Confirm otp is correct or wrong
app.post("/otp_confirm",ctrl.cnfrmotp);

//For add a page
app.post('/rent_space',ctrl.authMiddleware, ctrl.rentSpace);

//For Get near by Geo location 
app.post("/find_space",ctrl.authMiddleware,ctrl.findSpace);
//Order 
app.post('/spaceBooking',ctrl.authMiddleware,ctrl.Booking);

// To extend booking
app.post('/extend_booking',ctrl.authMiddleware,ctrl.extend_booking);

//for getting user information
app.post('/profile_get',ctrl.authMiddleware,ctrl.ProfileGetService);

//For Get all upcoming Past Booking Details
app.post("/getUpcomingPastDetails",ctrl.authMiddleware,ctrl.getUpcomingPastDetails);

// For Profile Image uploading
app.post('/profile_upload',ctrl.authMiddleware,ctrl.profileAdd);

//For Get all Spaces Details
app.post("/getAllSpaces",ctrl.authMiddleware,ctrl.getallSpaces);

//To Delete Vechicle
app.post("/deleteVehicleDetails",ctrl.authMiddleware,ctrl.deleteVehicle);

//For change password
app.post('/changepassword',ctrl.authMiddleware,ctrl.changepassword);

//For Forgot Password
app.post("/forgot_password",ctrl.frgt_passwd);

//My space edit service , location photo upload
app.post('/myedit_upload',ctrl.authMiddleware,ctrl.edit_upload);

//Violator  Car is Already Parked
app.post('/carIsInSpot',ctrl.authMiddleware,ctrl.User_In_Spot);

//For getting space image URL
app.post('/getSpaceImage',ctrl.authMiddleware,ctrl.spaceimage);

//For cannot find my spot
app.post('/cantfindSpot',ctrl.authMiddleware,ctrl.cant_find_spot);

//For cancel booking
app.post('/cancelBooking',ctrl.authMiddleware,ctrl.cancelBooking);

//for create a new password
app.post('/createPassword',ctrl.createpassword);

//For unlock and lock the space
app.post('/myspace_lock',ctrl.authMiddleware,ctrl.myspaceLock);

//For payment 
app.post('/payment',ctrl.authMiddleware,ctrl.payment);

app.post('/cardDetails',ctrl.authMiddleware,ctrl.cardDetails)
module.exports = app;



