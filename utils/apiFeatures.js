// AGGREGATING ALL THE API FEATURES IN A CLASS AND CREATING A METHOD FOR EACH FEATURE

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1A) SIMPLE FILTERING METHOD
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields']; // EXCLUDES THESE FIELDS...

    // DELETES THE EXCLUDED FIELDDS FROM THE QUERY ARRAY

    excludedFields.forEach((el) => delete queryObj[el]);

    // 1B) ADVANCED FILTERING METHOD

    let queryStr = JSON.stringify(queryObj);

    // REPLACING NORMAL PROPERTIES WITH MODIFIED PROPERTY

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // SORTING METHOD
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);

      // DEFAULT SORTING BY NEWEST TOUR FIRST
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // LIMITTING FIELDS METHOD

  // LIMITING NUMBER OF VISIBLE FIELDS IN THE API RESPONSE
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // PAGINATION METHOD

  // SHOWING CERTAIN NUMBER OF RESPONSES PER PAGE
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
