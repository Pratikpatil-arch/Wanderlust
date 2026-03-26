require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");
dns.setServers([
    '1.1.1.1',
    '8.8.8.8',
]);
const Listing = require("./models/Listing");
const Review = require("./models/review.js");
// const data = require("./init/data");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const url = process.env.MONGO_URL;
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema ,reviewSchema } = require("./schema.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const port = 8080;


const userRouter = require("./routes/user.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/reviews.js");



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



app.use(cookieParser());
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


const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized :true,
    cookie:{
        expires: Date.now()+7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,  
        httpOnly:true, 
    }
};

app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// app.get("/", (req, res) => {
//     res.send("I am root");
// });

// app.get("/insertOwner", async (req, res) => {
//     await Listing.deleteMany({});
//     data.data = data.data.map((obj)=>({
//         ...obj,
//         owner: "69bb0483247bca8e7a55a454"
//     }));
//     await Listing.insertMany(data.data);

//     console.log("data was initialized");
//     res.send("Database initialized successfully"); // ✅ response added
// });

// app.get("/demoUser",async(req,res)=>{
//   let fakeuser = new User({
//         email : "student@gmail.com",
//         username:"delta-student",
//   });

//   let registeredUser = await User.register(fakeuser,"helloWorld");
//   res.send(registeredUser);
// });


// const validateListing = async (req, res,next) => {
//     let { error } = await listingSchema.validate(req.body);
//     // console.log(result);
//     if (error) {
//         let errMsg = error.details.map((el)=> el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     } else {
//         next();
//     }
// }


// const validateReview = async (req, res,next) => {
//     let { error } = await reviewSchema.validate(req.body);
//     // console.log(result);
//     if (error) {
//         let errMsg = error.details.map((el)=> el.message).join(",");
//         throw new ExpressError(400,errMsg);
//     } else {
//         next();
//     }
// }




app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);





// app.get("/listings", wrapAsync(async (req, res) => {
//     let listings = await Listing.find({});
//     res.render("listings/index.ejs", { listings });
// }));

// app.get("/listings/new", (req, res) => {
//     res.render("listings/new.ejs");
// });


// //show route
// app.get("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs", { listing });
// }));


// //Create route
// app.post("/listings",
//     validateListing,
//     wrapAsync(async (req, res, next) => {
//         const newListing = new Listing(req.body.listing);
//         await newListing.save();
//         console.log(req.body.listing);
//         res.redirect("/listings");
//     }));


// //Edit Route
// app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", { listing });
// }));

// //Update Route
// app.put("/listings/:id", 
//     validateListing,
//     wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     res.redirect(`/listings/${id}`);
// }));


// //Delete Route
// app.delete("/listings/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let deletedListing = await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");
// }));




// //Reviews 
// //POST Route

// app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
//       let { id } = req.params;
//       let listing  = await Listing.findById(id);
//       let newReview = new Review(req.body.review);

//       listing.reviews.push(newReview._id);
//       await newReview.save();
//       await listing.save();

//       res.redirect(`/listings/${listing._id}`);

//       }));

//  //DELETE Review route
 
// app.delete("/listings/:id/reviews/:reviewId",wrapAsync(async(req,res)=>{
//     let { id , reviewId } = req.params;
//     await Listing.findByIdAndUpdate(id, {$pull:{reviews :reviewId}});
//     await Review.findByIdAndDelete(reviewId);

//     res.redirect(`/listings/${id}`);
// })); 
 



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

