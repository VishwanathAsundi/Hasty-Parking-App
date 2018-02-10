// Author ElamParithi 
// Rendering all pages
var renderpages = 
{
	loGin:function(req,res)
	{
		
		res.render('admin/index.ejs');
	},
	userDetails:function(req,res)
	{
		res.render('admin/users-details.ejs');
	},
	userList:function(req,res)
	{
		res.render('admin/users-list.ejs');
	},
	verifyApprove:function(req,res)
	{
		res.render('admin/verify_approved_details.ejs');
	},
	verifyList:function(req,res)
	{
		res.render('admin/verify_approved_list.ejs');
	},
	verifyNew:function(req,res)
	{
		res.render('admin/verify_new.ejs');
	},
	verifyNewDetails:function(req,res)
	{
		res.render('admin/verify_new_details.ejs');
	},
	onProgress:function(req,res)
	{
		res.render('admin/verify_onprogress.ejs');
	},
	onProgressDetails:function(req,res)
	{
		res.render('admin/verify_onprogress_details.ejs');
	},
	rejectedDetails:function(req,res)
	{
		res.render('admin/verify_rejected_details.ejs');
	},
	rejectedList:function(req,res)
	{
		res.render('admin/verify_rejected_list.ejs');
	},
	violationList:function(req,res)
	{
		res.render('admin/violation_list.ejs');
	},
	payment:function(req,res)
	{
		res.render('admin/payment.ejs');
	}

}
module.exports = renderpages;
