class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        //loop thorugh array and delete each from queryObj
        excludedFields.forEach((el) => delete queryObj[el]);

        // 2) advanced filtering
        let queryStr = JSON.stringify(queryObj);
        // Regex that searcheds \b means isolate /g means first instance
        // queryStr returns the matched object
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );
        console.log(queryStr);
        this.query = this.query.find(JSON.parse(queryStr));
        // //build the query

        //return the query object so that it can be chained with other queries
        return this;
    }

    sort() {
        // 3) Sorting
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v'); //- is excluding
        }

        return this;
    }

    paginate() {
        // 5) Pagination
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit); //skip 10 results before querying

        return this;
    }
}

module.exports = APIFeatures;
