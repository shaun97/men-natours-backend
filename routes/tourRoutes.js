const express = require('express');
const router = express.Router();

const {
    getAllTours,
    getTour,
    deleteTour,
    createTour,
    updateTour,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
} = require('./../controllers/tourController');

// router.param('id', checkID);

router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
//prefill some of the query strings
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
router.route('/').get(getAllTours).post(createTour);

module.exports = router;
