// utilities/inv-validation.js
const { body, validationResult } = require("express-validator");
const utilities = require("./index"); // to build nav and classificationList

const validate = {};

// Classification validation
validate.classificationRules = () => [
  body("classification_name")
    .trim()
    .notEmpty()
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Classification name must not contain spaces or special characters"),
];

// Inventory validation
validate.inventoryRules = () => [
  body("classification_id").notEmpty().withMessage("Classification is required"),
  body("inv_make").trim().notEmpty().withMessage("Make is required"),
  body("inv_model").trim().notEmpty().withMessage("Model is required"),
  body("inv_year").isInt({ min: 1886 }).withMessage("Year is required and must be a valid integer"),
  body("inv_description").trim().notEmpty().withMessage("Description is required"),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a non-negative number"),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a non-negative integer"),
  body("inv_color").trim().notEmpty().withMessage("Color is required"),
  body("inv_image").trim().notEmpty().withMessage("Image path is required"),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required"),
];

/* ***************************
 *  Error handler for Add forms
 * ************************** */
validate.checkInvData = async (req, res, next) => {
  const errorsResult = validationResult(req);
  if (!errorsResult.isEmpty()) {
    const errors = errorsResult.array();
    const nav = await utilities.getNav();

    if (req.originalUrl.includes("classification")) {
      // Add Classification form
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors,
        classification_name: req.body.classification_name || "",
      });
    } else {
      // Add Inventory form
      const classificationList = await utilities.buildClassificationList(req.body.classification_id || null);
      return res.status(400).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        errors,
        classificationList,
        inv_make: req.body.inv_make || "",
        inv_model: req.body.inv_model || "",
        inv_year: req.body.inv_year || "",
        inv_description: req.body.inv_description || "",
        inv_price: req.body.inv_price || "",
        inv_miles: req.body.inv_miles || "",
        inv_color: req.body.inv_color || "",
        inv_image: req.body.inv_image || "",
        inv_thumbnail: req.body.inv_thumbnail || "",
        classification_id: req.body.classification_id || "",
      });
    }
  }
  next();
};

/* ***************************
 *  Error handler for Update forms
 * ************************** */
validate.checkUpdateData = async (req, res, next) => {
  const errorsResult = validationResult(req);
  if (!errorsResult.isEmpty()) {
    const errors = errorsResult.array();
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(req.body.classification_id || null);

    return res.status(400).render("inventory/edit-inventory", {
      title: `Edit ${req.body.inv_make} ${req.body.inv_model}`,
      nav,
      errors,
      classificationSelect: classificationList,
      inv_id: req.body.inv_id,
      inv_make: req.body.inv_make || "",
      inv_model: req.body.inv_model || "",
      inv_year: req.body.inv_year || "",
      inv_description: req.body.inv_description || "",
      inv_price: req.body.inv_price || "",
      inv_miles: req.body.inv_miles || "",
      inv_color: req.body.inv_color || "",
      inv_image: req.body.inv_image || "",
      inv_thumbnail: req.body.inv_thumbnail || "",
      classification_id: req.body.classification_id || "",
    });
  }
  next();
};

module.exports = validate;
