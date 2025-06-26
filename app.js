const express=require('express');
const app=express();
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const path=require('path');
const multer=require('multer');
const session=require('express-session');
const flash=require('connect-flash');
const MongoStore=require('connect-mongo');
require('dotenv').config();
const upload=require("./configs/multerconfig")
const userModel=require('./models/usermodel');
const blogModel=require('./models/blogmodel');
const secret=process.env.SECRET_KEY;
app.use(express.json());
app.use(cookieParser());
app.use(flash());
app.use(session({secret:"secret",resave:false,saveUninitialized:true,store:MongoStore.create({mongouri:process.env.MONGO_URI})}));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.get("/",function(req,res){
    res.render("create");
})
app.post("/create",function(req,res){
    let {username,email,password}=req.body;
    bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(password,salt,async function(err,hash){
            const user=await userModel.create({
                username,
                email,
                password:hash,
            });
               res.redirect("/login");
        })
    })
});
app.get("/profile/:id",isLogged,async function(req,res){
      const user=await userModel.findOne({_id:req.params.id}).populate('blogs');
      res.render("profile",{user});
});
app.get("/login",async function(req,res){
    res.render("login");
})
app.post("/login",async function(req,res){
    const user=await userModel.findOne({email:req.body.email});
    if(!user) res.status(404).send("user does not exist");
    bcrypt.compare(req.body.password,user.password,function(err,result){
        if(result){
            let token1=jwt.sign({email:req.body.email},secret);
             res.cookie("token1",token1);
            res.redirect(`/profile/${user._id}`);
        }
        else{
            res.status(500).send("password is incorrect");
        }
        
    })
})
app.get("/logout",isLogged,function(req,res){
    res.cookie("token1","");
    res.redirect("/login");
})
app.get("/cblog",isLogged,async function(req,res){
    const user=await userModel.findOne({email:req.email});
     res.render("createblog",{user});
})
app.post("/cblog",isLogged,async function(req,res){
    const user=await userModel.findOne({email:req.email});
    const blog=await blogModel.create({
        username:user.username,
        userid:user._id,
        content:req.body.content,
    });
    user.blogs.push(blog._id);
    await user.save();
    res.redirect(`/profile/${user._id}`);
})
app.get("/deleteblog/:id",isLogged,async function(req,res){
    const blog=await blogModel.findOneAndDelete({_id:req.params.id});
    const user=await userModel.findOne({email:req.email});
    user.blogs.pull(blog._id);
    await user.save();
    res.redirect(`/profile/${user._id}`);
})
app.get("/editblog/:id",isLogged,async function(req,res){
      const blog=await blogModel.findOne({_id:req.params.id});
      res.render("editblog",{blog});
})
app.post("/editblog/:id",isLogged,async function(req,res){
    const blog=await blogModel.findOneAndUpdate({_id:req.params.id},{content:req.body.newcontent});
    const user=await userModel.findOne({email:req.email});
    res.redirect(`/profile/${user._id}`);
})
app.get("/username/:id",isLogged,async function(req,res){
    const user=await userModel.findOne({email:req.email});
    res.render("updateusername",{user});
})
app.post("/username/:id",isLogged,async function(req,res){
    const user=await userModel.findOneAndUpdate({email:req.email},{username:req.body.newusername});
     res.redirect(`/profile/${user._id}`);
})
app.get("/profilepic/:id",isLogged,async function(req,res){
    res.render("updateprofilepic");
})
app.post("/profilepic",isLogged,upload.single('image'),async function(req,res){
    const user=await userModel.findOne({email:req.email});
    user.profile=req.file.filename;
    await user.save();
    res.redirect(`/profile/${user._id}`);
})
function isLogged(req,res,next) {
    if(req.cookies.token1==="") return res.redirect("login");
    else {
        let data=jwt.verify(req.cookies.token1,"ssshhh");
        req.email=data.email;
        next();
    }
}

app.listen(3000);

