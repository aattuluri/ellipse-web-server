Colleges = require('../Models/CollegeModel');



//get all the colleges
exports.index = (req, res) => {
    Colleges.get((err, college) => {
        if (err) {
            res.json({
                status: 'error',
                code: 500,
                message: err
            });
        }

        res.json(college)
    })
}