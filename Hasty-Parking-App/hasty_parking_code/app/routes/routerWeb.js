var express = require('express');
var app = new express.Router();
var fs = require('fs');
//var ctrl = require('../controller/renderingpages.js');
var ctrl = require('../controller/web_controller.js');
var ctrl_main = require('../controller/hasty_controller.js');
var renderingpages = require('../controller/websiterenderingpages.js');
app.use(express.static('public'));

//For Login
app.get('/login', renderingpages.login);
app.get('/signup',renderingpages.signup);
app.get('/mybooking',renderingpages.mybooking);
app.get('/freeparking',renderingpages.freeparking);
app.get('/index',renderingpages.index);
app.get('/paymentsuccessful',renderingpages.paymentsuccessful);
app.get('/rentspace',renderingpages.rentspace);
app.get('/spacebooking',renderingpages.spacebooking);
app.get('/spacedetails',renderingpages.spacedetails);
//app.get('/spacelist',renderingpages.spacelist);
app.get('/underconstruction',renderingpages.underconstruction);
app.get('/forgetpassword',renderingpages.forgetpassword);
app.get('/otp',renderingpages.otp);
app.get('/otp_signup',renderingpages.otp_signup);
app.get('/myspacedetails',renderingpages.myspacedetails);
app.get('/myspacelist',renderingpages.myspacelist);
app.get('/profile',renderingpages.profile);
app.get('/receivedbookingdetails',renderingpages.receivedbookingdetails);
app.get('/searchresult',renderingpages.searchresult);
app.get('/resetpassword',renderingpages.resetpassword);
app.get('/resetpassword_signup',renderingpages.resetpassword_signup);
app.get('/bookingdetails',renderingpages.bookingdetails);
app.get('/bookingdetails_past',renderingpages.bookingdetails_past);
app.get('/receivedbookings',renderingpages.receivedbookings);
app.get('/extend_booking_payment',renderingpages.extend_booking_payment);
app.get('/rentspace_payment',renderingpages.rentspace_payment);
//For calling APIS

//Login Api 
app.post('/login', ctrl.webLogin);
//Sign Up API
app.post('/signup', ctrl.webSign);
app.post('/findSpace',ctrl.findSpace);
app.post('/getspacedetails',ctrl.getspacedetails);
app.post('/getparkingdetails',ctrl.getparkingdetails);
app.post('/getparkingId',ctrl.getparkingId);
app.post('/getbookingdetails',ctrl.getbookingdetails);
app.post('/addvehicle',ctrl.addvehicle);
app.post('/addcard',ctrl.addcard);
app.post('/otp_confirm',ctrl.cnfrmotp);
app.post('/otp_confirm_signup',ctrl.cnfrmotp_signup);
app.post('/forgot_password',ctrl.frgt_passwd);
app.post('/resetpassword',ctrl.rst_pwd1);
app.post('/resetpassword_signup',ctrl.rst_pwd_signup);
app.post('/rentspaces',ctrl.rentaSpace);
app.post('/getinfo',ctrl.getInfo);
app.post('/user_logout',ctrl.log_out);
app.post("/getUpcomingPastDetails",ctrl.getUpcomingPastDetails);
app.post('/bookedhistory',ctrl.bookedhistory);
app.post('/spacehistorydetails',ctrl.spacehistorydetails);
app.post("/getAllSpaces",ctrl.getallSpaces);
app.post('/cancelBooking',ctrl.cancelBooking);
app.post('/confirmcancel',ctrl.confirmcancel);
app.post('/extendBooking',ctrl.extend_booking);
app.post('/getOrderId',ctrl.getOrderId);
app.post('/booking',ctrl.Booking);
app.post('/getallVehicleDetails',ctrl.getallVehicleDetails);
app.post('/payment',ctrl.payment);
app.post('/payment_with_card',ctrl.payment_with_card);
app.post('/cardDetails',ctrl.cardDetails);
app.post('/extend_order_payment',ctrl.extend_order_payment);
app.post('/rentspacepayment',ctrl.rentspacepayment);
app.post('/rentspacepayment_card',ctrl.rentspacepayment_card);
module.exports = app;
