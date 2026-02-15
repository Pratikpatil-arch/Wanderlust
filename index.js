require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/Listing");
const data = require("./init/data");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-Mate");
const url = process.env.MONGO_URL;
const port = 8080;


async function connectDB(){
    await mongoose.connect(url);
}

connectDB()
        .then(()=>{
            console.log("Database connected successfully");
        })
        .catch((err)=>{
           console.log(err);
        });


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//app.use(methodOverride("_method"));
//app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));
app.use(methodOverride("_method"));
app.engine("ejs",ejsMate);
app.use(express.static(path.join(__dirname,"/public")));



app.get("/",(req,res)=>{
    res.send("I am root");
});

app.get("/listings",async(req,res)=>{
   let listings = await Listing.find({});
   res.render("listings/index.ejs",{listings});
});

app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

app.get("/listings/:id",async(req,res)=>{
    let {id}=req.params;
    let listing= await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
});

app.post("/listings",async(req,res)=>{
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    console.log(req.body.listing);
    res.redirect("/listings");
});

app.get("/listings/:id/edit",async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
});

app.put("/listings/:id",async(req,res)=>{
     let {id} = req.params;
     await Listing.findByIdAndUpdate(id,{...req.body.listing});
     res.redirect(`/listings/${id}`);
});

app.delete("/listing/:id",async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})

app.listen(port,(req,res)=>{
    console.log(`Server is running on port ${port}`);
});


// app.get("/data",async(req,res)=>{
//     await Listing.insertMany(data.data);
//     res.send("data was initialized");
// })

