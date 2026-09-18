const express= require('express');
const path = require('path')
const app=express();
app.set("view engine","ejs")
app.use(express.json());
app.listen(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")))
app.get("/",function(req,res){
    res.send("welcome");
})
app.listen(3000);