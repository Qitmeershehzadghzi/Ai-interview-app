const mongoose = require("mongoose");

const userSchema =mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:[true,'user already exists']
    },
    email:{
        type:String,
        unique:[true,'account already exist with this email address'],
        required:true
    },
    password:{
        type:String,
        required:true
    }
})
const userModel =mongoose.model('user',userSchema)
module.exports = userModel;