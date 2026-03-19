const express = require("express");
const router = express.Router({ mergeParams: true });


const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const { validateReview , isLoggedin , isReviewAuthor } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");






//Reviews 
//POST Route

router.post("/",isLoggedin, validateReview, wrapAsync(reviewController.createReview));

//DELETE Review route

router.delete("/:reviewId",isLoggedin,isReviewAuthor, wrapAsync(reviewController.destroyReview));


module.exports = router;