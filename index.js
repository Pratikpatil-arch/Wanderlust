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
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const port = 8080;


async function connectDB() {
    await mongoose.connect(url);
}

connectDB()
    .then(() => {
        console.log("Database connected successfully");
    })
    .catch((err) => {
        console.log(err);
    });


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//app.use(methodOverride("_method"));
//app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
//app.use(express.static(path.join(__dirname, "/public")));



app.get("/", (req, res) => {
    res.send("I am root");
});




const validateListing = async (req, res,next) => {
    let { error } = await listingSchema.validate(req.body);
    // console.log(result);
    if (error) {
        let errMsg = error.details.map((el)=>{ el.message}).join(",");
        throw new ExpressError(400,errMsg);
    } else {
        next();
    }
}










app.get("/listings", wrapAsync(async (req, res) => {
    let listings = await Listing.find({});
    res.render("listings/index.ejs", { listings });
}));

app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});


//show route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing });
}));


//Create route
app.post("/listings",
    validateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        console.log(req.body.listing);
        res.redirect("/listings");
    }));


//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", 
    validateListing,
    wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
}));


//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));



app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});



app.use((err, req, res, next) => {
    if (err.name === "CastError") {
        err.statusCode = 400;
        err.message = "Invalid ID format";
    }

    let { statusCode = 500, message = "Something went wrong!" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { statusCode, message });
});








app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`);
});


// app.get("/data",async(req,res)=>{
//     await Listing.insertMany(data.data);
//     res.send("data was initialized");
// })

