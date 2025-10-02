const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Middleware to check token validity
 ************************** */
Util.checkJWTToken = (req, res, next) => {
  res.locals.loggedin = 0 // default

  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
      if (err) {
        req.flash("notice", "Please log in")
        res.clearCookie("jwt")
        return res.redirect("/account/login")
      }

      res.locals.accountData = accountData
      res.locals.loggedin = 1
      next()
    })
  } else {
    next()
  }
}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification select list HTML
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications();
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`;
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected";
    }
    classificationList += `>${row.classification_name}</option>`;
  });

  classificationList += "</select>";
  return classificationList;
};


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the vehicle details view HTML
* ************************************ */
Util.buildVehicleDetail = async function (vehicle) {
  if (!vehicle) return ""

  let detail = `
    <div class="vehicle-detail">
      <h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>
      <div class="detail-wrapper">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
        <div class= "detail-info">
          <p><strong>Year:</strong> ${vehicle.inv_year}</p>
          <p><strong>Price:</strong> $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</p>
          <p><strong>Mileage:</strong> ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)} miles</p>
          <p><strong>Description:</strong> ${vehicle.inv_description}</p>
        </div>
      </div>
    </div>
  `
  return detail
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next() // user is logged in, continue
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login") // redirect to login if not
  }
}

/* **************************************
* Error handling wrapper
* ************************************ */
Util.handleErrors = function (fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = Util
