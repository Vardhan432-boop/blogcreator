const mongoose=require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/notes");
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