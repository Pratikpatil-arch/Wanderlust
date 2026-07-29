const Listing = require("../models/Listing");
const { geocodePlace } = require("../utils/GeoCoding");




module.exports.index = async (req, res) => {
    let { category } = req.query;
    let filter = {};
    if (category) {
        filter.category = category;
    }
    let listings = await Listing.find(filter);
    // res.render("listings/index.ejs", { listings });
    res.render("listings/index.ejs", { listings, category: category || null });
};

module.exports.renderNewForm = async (req, res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing ,currentUser: req.user});
};

module.exports.createListing = async (req, res, next) => {
    
    const geometry = await geocodePlace(req.body.listing.location);

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { filename, url };
    newListing.geometry = geometry;
    let savedListings = await newListing.save();
    console.log(savedListings);
    req.flash("success", "New Listing Created");
    console.log(req.body.listing);
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs", { listing , originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
     if(typeof req.file !=="undefined"){
     let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url , filename};
    await listing.save();
     }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    console.log(deletedListing);
    res.redirect("/listings");
};

module.exports.searchListings = async (req, res) => {
    let { q } = req.query;
    if (!q || q.trim() === "") {
        req.flash("error", "Please enter a location or country to search");
        return res.redirect("/listings");
    }
    let listings = await Listing.find({
        $or: [
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } },
        ],
    });
    if (listings.length === 0) {
        req.flash("error", `No listings found for "${q}"`);
        return res.redirect("/listings");
    }
    res.render("listings/index.ejs", { listings, searchQuery: q.trim() });
};