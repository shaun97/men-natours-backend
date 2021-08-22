const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'must have name'],
            unique: true,
            trim: true,
            maxLength: [40, 'A tour name cannot be longer than 40 characters'],
            minLength: [10, 'A tour name cannot be more than 10 characters'],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have difficulty'],
            enum: {
                //only for strings
                values: ['easy', 'medium', 'difficult'], //values that are allowed
                message: 'difficulty is easy, medium or difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'must have price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    //param is the value of the field
                    return val < this.price;
                },
                message:
                    'Discount price ({VALUE}) should be below the regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a cover image'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            //geoJson sub fields
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'], //longitude then latitude
            },
            coordinates: [Number], //array of numbers
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: Array,
    },
    {
        //object for the options
        toJSON: { virtuals: true }, //when the data is converted to json
        toObject: { virtuals: true }, //when data gets outputted as an object
    }
);

//real function instead of arrow function because arrow function does not get it's own this keyword
tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

//Document middleware: runs before .save() and .create() and not on .insertMany()
tourSchema.pre('save', function (next) {
    //this keyword will point to the document being saved
    // this is the currently modified document
    this.slug = slugify(this.name, { lower: true });
    next(); //for calling the next middleware in the stack
});

tourSchema.post('save', function (doc, next) {
    next();
});

tourSchema.pre('save', function(next) {
    // const guides = this.guides.map(id => { User})
    next();
})

// points to the query
//regex to account for find and findOne and anything with find
tourSchema.pre(/^find/, function (next) {
    // use for secret tours? and private?
    // only query for fields that are not secret
    this.start = Date.now();
    this.find({
        secretTour: {
            $ne: true,
        },
    });
    next();
});

//can have access to the documents from the query cuz this is after
tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next();
});

//Aggregation middleware points to the aggregation object
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } }); //add at the beginning of an array
    console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
