const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        price: Joi.number().required().min(0),
        country: Joi.string().required(),
        image: Joi.object({
            url: Joi.string().allow("", null)
        }).allow("", null) // Allow the whole image object to be empty if needed
    }).required(),
});

