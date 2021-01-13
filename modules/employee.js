
var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost:27017/employee', {useNewUrlParser: true, useUnifiedTopology: true});
const { urlencoded } = require('body-parser');
const db=mongoose.connection;
var userSchema=new mongoose.Schema({
    name:String,
    age:Number,
    contact:Number,
    email:String,
    image:String,
});
var userModel=mongoose.model('users',userSchema);
module.exports=userModel;
