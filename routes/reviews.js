const express = require("express");
const router = express.Router({ mergeParams: true });

const Listing = require("../models/Listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const { validateReview , isLoggedin , isReviewAuthor } = require("../middleware.js");







//Reviews 
//POST Route

router.post("/",isLoggedin, validateReview, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);

    listing.reviews.push(newReview._id);
    await newReview.save();
    await listing.save();
    req.flash("success","New review Created");
    res.redirect(`/listings/${listing._id}`);

}));

//DELETE Review route

router.delete("/:reviewId",isLoggedin,isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
     req.flash("success","Review Deleted");
    res.redirect(`/listings/${id}`);
}));


module.exports = router;