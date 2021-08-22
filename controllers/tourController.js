const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

exports.getAllTours = async (req, res) => {
    try {
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields();
        // .pageinate();

        //execute the query
        const tours = await features.query; //this will get the find method from the class above

        res.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours: tours,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id); //helper function for Tour.findOne({_id: req.params.id})

        res.status(200).json({
            status: 'success',
            data: {
                tours: tours,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'err',
        });
    }
};

exports.createTour = async (req, res) => {
    try {
        await Tour.create(req.body); //contains the id as well

        res.status(201).json({
            status: 'success',
            data: {
                // tour: newTour,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            err: err,
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null,
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            err: 'Invalid data sent',
        });
    }
};

exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // the new document is the one returned
            runValidators: true,
        });
        res.status(200).json({
            status: 'success',
            data: {
                tour, // ES6 property name will be the same name
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'err',
        });
    }
};

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                //Stage 1: match the document
                $match: {
                    ratingsAverage: { $gte: 4.5 },
                },
            },
            {
                //Stage 2: group by certain things, _id: null means all
                $group: {
                    _id: { $toUpper: '$difficulty' }, //group for different fields
                    numRatings: { $sum: '$ratingsQuantity' },
                    num: { $sum: 1 }, // loop through all doc, for each itll add 1 to the counter
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                },
            },
            {
                //Stage 3: sort, at this point, the fields are from above, they are different
                $sort: {
                    avgPrice: 1,
                },
            },
            // {
            //     // _id is now the difficulty
            //     //Stage 4: exclude the EASY
            //     $match: {
            //         _id: {
            //             $ne: 'EASY',
            //         },
            //     },
            // },
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: 'err',
        });
    }
};

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.years * 1;
        const plan = await Tour.aggregate([
            {
                // deconstruct an array field from the document and output one document for each element of the array
                $unwind: '$startDates',
            },
            {
                //select document
                $match: {
                    //date to be greater than 0101 of that year and less than last day of the year
                    startDates: {
                        $gte: new Date(`${year}=01-01`),
                        $lte: new Date(`${year}-12-31`),
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $month: '$startDates', //field we want to extrat the month from
                        numTourStarts: { $sum: 1 },
                        tours: {
                            $push: '$name', //to create arrays
                        },
                    },
                },
            },
            {
                $addFields: { month: '$_id' },
            },
            {
                //remove the id
                $project: {
                    _id: 0,
                },
            },
            {
                $sort: {
                    numtourStarts: 1,
                },
            },
            {
                $limit: 12,
            },
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                plan,
            },
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err,
        });
    }
};
