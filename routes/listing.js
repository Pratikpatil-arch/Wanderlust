const express = require("express");
const router = express.Router();

const Listing = require("../models/Listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");

const { isLoggedin, isOwner, validateListing } = require("../middleware.js");


const listingController = require("../controllers/listings.js");


const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });





router.route("/")
    .get(wrapAsync(listingController.index))  //index Route
    .post(
        isLoggedin,
        upload.single("listing[image][url]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );


//Search Route
router.get("/search", wrapAsync(listingController.searchListings));

//New Route
router.get("/new", isLoggedin, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))   //show route
    .put(                                                  //Update Route
        isLoggedin,
        isOwner,
        upload.single("listing[image][url]"),
        validateListing,
        wrapAsync(listingController.updateListing))
    .delete(isLoggedin, isOwner, wrapAsync(listingController.destroyListing));   //Delete Route





//Edit Route
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(listingController.renderEditForm));



module.exports = router;