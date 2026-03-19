const express = require("express");
const router = express.Router();

const Listing = require("../models/Listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

const { isLoggedin, isOwner, validateListing } = require("../middleware.js");


const listingController = require("../controllers/listings.js");

const multer= require("multer");
const upload = multer({dest:"uploads/"});





router.route("/")
    .get(wrapAsync(listingController.index))  //index Route
    // .post(                                    //Create Route
    //     isLoggedin,
    //     validateListing,
    //     wrapAsync(listingController.createListing));
    .post((req,res)=>{
        res.send(req.body);
    })
    // .post(upload.single("listing[image][url]"),(req,res)=>{
    //     res.send(req.file);
    // })


//New Route
router.get("/new", isLoggedin, listingController.renderNewForm);

router.route("/:id")
    .get( wrapAsync(listingController.showListing))   //show route
    .put(                                                  //Update Route
        isLoggedin,
        isOwner,
        validateListing,
        wrapAsync(listingController.updateListing))
    .delete( isLoggedin, isOwner, wrapAsync(listingController.destroyListing));   //Delete Route





//Edit Route
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(listingController.renderEditForm));



module.exports = router;