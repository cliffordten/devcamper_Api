                
const advancedResults = (model, populate) => async (req, res, next) => {
    let query;

    //copy req.query
    const reqQuery = { ...req.query };
  
    //fields to exclude
    const removeFields = ["select, sort, page, limit"];
  
    //loop over removed fields and delete them from reqQuery
    removeFields.forEach(param => {
      delete reqQuery[param];
    });
  
    removeFields.forEach(param => {
      Object.keys(reqQuery).forEach(key => {
        param.split(", ").forEach(val => {
          if (key == val) {
            delete reqQuery[key];
          }
        });
      });
    });
  
    //create query string
    let queryString = JSON.stringify(reqQuery);
  
    //creating operator in form $gt, $gte
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      match => `$${match}`
    );
  
    //finding resource
    query = model.find(JSON.parse(queryString));
  
    //select fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }
  
    //sortby fields
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-name");
    }
  
    //pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();
  
    query = query.skip(startIndex).limit(limit);

    if(populate){
      query = query.populate(populate);
    }
  
    // const results = await model.find();
    const results = await query;
  
    //pagination result
    const pagination = {};
  
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
  
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.advancedResults = {
      success: true,
      count: results.length,
      pagination,
      data: results
    }

    next();
};


module.exports = advancedResults;