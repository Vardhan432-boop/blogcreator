const mongoose=require("mongoose");
const blogSchema=mongoose.Schema({
    username:String,
    userid:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    content:String,
    date:{
        type:Date,
        default:Date.now(),
    },
});
module.exports=mongoose.model("blog",blogSchema);