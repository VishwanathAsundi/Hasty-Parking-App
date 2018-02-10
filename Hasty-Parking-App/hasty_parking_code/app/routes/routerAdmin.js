var express = require('express');
var app = new express.Router();
var fs = require('fs');
//var ctrl = require('../controller/renderingpages.js');
var ctrl = require('../controller/admin_controller.js');
var renderingpages = require('../controller/renderingpages.js');
app.use(express.static('public'));

//For Login
app.get('/login', renderingpages.loGin);
app.get('/userdetails',renderingpages.userDetails);
app.get('/userList',renderingpages.userList);
app.get('/verifyApprove',renderingpages.verifyApprove);
app.get('/verifyList',renderingpages.verifyList);
app.get('/verifyNew',renderingpages.verifyNew);
app.get('/verifyNewDetails',renderingpages.verifyNewDetails);
app.get('/onProgress',renderingpages.onProgress);
app.get('/onProgressDetails',renderingpages.onProgressDetails);
app.get('/rejectedDetails',renderingpages.rejectedDetails);
app.get('/rejectedList',renderingpages.rejectedList);
app.get('/violationList',renderingpages.violationList);
app.get('/admin_signup',ctrl.save_admin_details);


//Functionalities api

app.post('/login',ctrl.adminlogin);
app.post('/getUserDtls',ctrl.UserList);
app.post('/parseId',ctrl.ParseId);
app.post('/getUniqueUserDtls',ctrl.getuniqueUserDtls);
app.post('/getvehicledtls',ctrl.getallVehicleDetails);
app.post('/verifyNewUser',ctrl.verifyNew);
app.post('/getviolators',ctrl.getAllViolator);
app.post('/getSpaceUserDetails',ctrl.spaceUserDetails);
app.post('/getNewUserSpace',ctrl.getnewuserspace);
app.post('/changeprogessto2',ctrl.changeProgessTo2);
app.post('/changeprogessto3',ctrl.changeProgessTo3);
app.post('/changeprogessto4',ctrl.changeProgessTo4);

module.exports = app;
