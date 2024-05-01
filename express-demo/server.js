const express = require("express");
let server = express();
server.set("view engine","ejs");
server.use(express.static("public"));

server.get("/contact", function(req,res){    
    res.render("contact");
})
server.get("/", function(req,res){
   
    res.render("homepage");
})

server.listen(4000);