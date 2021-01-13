var express = require('express');
var router = express.Router();
var empModel=require('../modules/employee');
var imgModel=require('../modules/upload');
var multer  = require('multer');
var path=require('path');
var jwt=require('jsonwebtoken');

//using node-localstorage
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}


//find all the inserted documents which are in collection
var employee=empModel.find({});
//for all the images to be shown
var imgData=imgModel.find({});

router.use(express.static(__dirname+"./public/"));

//for upload middleware
var Storage=multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname))

  }
});
//middleware for upload
var upload=multer({
  storage:Storage
}).single('file');


//middleware for checking login

function checkLogin(req,res,next){
  var myToken= localStorage.getItem('myToken');
  try {
   jwt.verify(myToken, 'loginToken');
  } catch(err) {
    res.send ("you need login to access this page");
  }
  next();
}   




//login page
router.get('/login',function(req, res, next) {

  var token = jwt.sign({ foo: 'bar' }, 'loginToken');
  localStorage.setItem('myToken', token);
  res.send("Login Successfully");
});
//logout route
router.get('/logout',function(req, res, next) {

  localStorage.removeItem('myToken');
  res.send("Logout Successfully");
  
});


/* GET home page. */
router.get('/',checkLogin, function(req, res, next) {
  employee.exec(function(err,data){
    if (err) throw err;
    res.render('index', { title: 'Employee Records',records:data ,success:''});

  });
 

});


//for inserting
router.post("/",upload,function(req, res, next) {
  var empDetails = new empModel({
    name: req.body.uname,
    age: req.body.age,
    contact: req.body.contact,
    email: req.body.email,
    image:req.file.filename,
    
  });

 
  empDetails.save(function(err,req1){
    if(err) throw err;
    employee.exec(function(err,data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records', records:data ,success:'Record inserted successfully'});
        });
  })
  
  
});

//for filter
router.post("/search",function(req, res, next) {
  var fname=req.body.fname;
  var femail=req.body.femail;

  if(fname!='' && femail!='')
  {
    var fpara={ $and:
      [
      { name:fname},
      {$and:[{email:femail}]}
      ]
       }
  }

  else if(fname !='' && femail =='' ){
    var fpara={ $and:[{ name:fname}]
       }}

       else if(fname =='' && femail !='' ){

        var fpara={ $and:[{ email:femail}]
           }}
           else{
            var fpara={}
          }
          var employeeFilter =empModel.find(fpara);

 
  
    employeeFilter.exec(function(err,data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records', records:data ,success:''});
        });

  
  
});

//delete route
router.get("/delete/:id",function(req, res, next) 
{
  var id=req.params.id;
  var del=empModel.findByIdAndDelete(id);

  
 
 
 
    del.exec(function(err){

      if(err) throw err;
      
      employee.exec(function(err,data){
        if (err) throw err;
        res.render('index', { title: 'Employee Records',records:data ,success:'Deleted Successfully'});
    
      });
     
        });
  

});

//for updating

router.get("/edit/:id",function(req,res,next){
  var edit=empModel.findById(req.params.id);
  edit.exec(function(err,data){
    if (err) throw err;
    res.render('edit',{title: 'Edit Employee Records', records:data })
  })
});
router.post('/update/',upload,function(req, res, next) {
  if(req.file){
 var update={
    name: req.body.name,
    
    age: req.body.age,
    contact: req.body.contact,
    email: req.body.email,
    image:req.file.filename
    
}
  }
  else{
    var update={
      name: req.body.name,
      
      age: req.body.age,
      contact: req.body.contact,
      email: req.body.email,
      
      
  }

  }
  var data=empModel.findByIdAndUpdate(req.body.id,update);
data.exec(function(err,data){
if(err) throw err;
employee.exec(function(err,data){
  if (err) throw err;
  res.redirect("/");

});

  
});
});

//get route for upload
router.get('/upload',function(req, res, next) {
  imgData.exec(function(err,data){
    if(err) throw err;
    res.render('upload', { title: 'Upload File', records:data,   success:'' });
});
});

//post route for upload
router.post('/upload',upload, function(req, res, next) {
  var imageFile=req.file.filename;

  var success=req.file.filename + " uploaded successfully"
  
    
  var imageDetails= new imgModel({
    imagename:imageFile
   });
    imageDetails.save(function(err,doc){
      if(err) throw err;
      imgData.exec(function(err,data){
        if(err) throw err;
        res.render('upload', { title: 'Upload File', records:data,   success:success });
        });
      
     });
  
 
});
router.get('/autocomplete/', function(req, res, next) {

  var regex= new RegExp(req.query["term"],'i');
 
  var employeeFilter =empModel.find({name:regex},{'name':1}).sort({"updated_at":-1}).sort({"created_at":-1}).limit(20);
  employee.exec(function(err,data){


var result=[];
if(!err){
   if(data && data.length && data.length>0){
     data.forEach(user=>{
       let obj={
         id:user._id,
         label: user.name
       };
       result.push(obj);
     });

   }
 
   res.jsonp(result);
}

  });

})
module.exports = router;
