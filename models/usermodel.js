const mongoose=require("mongoose");
require('dotenv').config();
console.log("MONGO_URI",process.env.MONGO_URI);
mongoose.connect(process.env.MONGO_URI);
const userSchema=mongoose.Schema({
    username:String,
    email:String,
    password:String,
    profile:{
        type:String,
        default:"default.png",
    },
    blogs:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'blog'
    }],
})
module.exports=mongoose.model("user",userSchema);