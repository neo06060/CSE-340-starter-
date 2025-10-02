const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const invCont = {};

/* Task 1: Management View */
invCont.buildManagement = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const message = req.flash("message");
    res.render("inventory/manage", {
      title: "Inventory Management",
      nav,
      message,
    });
  } catch (error) {
    next(error);
  }
};

/* Task 2: Add Classification View */
invCont.buildAddClassification = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const message = req.flash("message"); // <-- add this

    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message, // <-- send it to EJS
      errors: null,
      classification_name: "",
    });
  } catch (error) {
    next(error);
  }
};


/* Task 2: Add Classification POST */
invCont.addClassification = async function (req, res, next) {
  try {
    const { classification_name } = req.body;
    const result = await invModel.insertClassification(classification_name);

    if (result) {
      req.flash("message", `Classification "${classification_name}" added successfully.`);
      res.redirect("/inv");
    } else {
      const nav = await utilities.getNav();
      res.render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: [{ msg: "Failed to add classification." }],
        classification_name,
      });
    }
  } catch (error) {
    next(error);
  }
};

/* Task 3: Add Inventory View */
invCont.buildAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    const message = req.flash("message"); // <-- add this

    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      message, // <-- pass it here
      errors: null,
      classificationList,
      inv_make: "",
      inv_model: "",
      inv_year: "",
      inv_description: "",
      inv_price: "",
      inv_miles: "",
      inv_color: "",
      inv_image: "",
      inv_thumbnail: "",
      classification_id: "",
    });
  } catch (error) {
    next(error);
  }
};

/* Task 3: Add Inventory POST */
invCont.addInventory = async function (req, res, next) {
  try {
    const {
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
      classification_id,
    } = req.body;

    const result = await invModel.insertInventory({
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      inv_image,
      inv_thumbnail,
      classification_id,
    });

    if (result) {
      req.flash("message", `Inventory "${inv_make} ${inv_model}" added successfully.`);
      res.redirect("/inv");
    } else {
      const nav = await utilities.getNav();
      const classificationList = await utilities.buildClassificationList(classification_id);

      res.render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        errors: [{ msg: "Failed to add inventory." }],
        classificationList,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_price,
        inv_miles,
        inv_color,
        inv_image,
        inv_thumbnail,
        classification_id,
      });
    }
  } catch (error) {
    next(error);
  }
};

/* Existing: Inventory by Classification */
invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(classification_id);
    const nav = await utilities.getNav();

    if (!data || data.length === 0) {
      return res.render("inventory/classification", {
        title: "No vehicles found",
        nav,
        grid: '<p class="notice">Sorry, no matching vehicles could be found.</p>',
      });
    }

    const grid = await utilities.buildClassificationGrid(data);
    const className = data[0].classification_name || "Vehicles";

    res.render("inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* Existing: Vehicle Detail */
invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.invId;
    const data = await invModel.getVehicleById(inv_id);

    if (!data) {
      return res.status(404).render("errors/error", {
        title: "Vehicle Not Found",
        message: "Sorry, the requested vehicle does not exist.",
      });
    }

    const detail = await utilities.buildVehicleDetail(data);
    const nav = await utilities.getNav();

    res.render("inventory/detail", {
      title: `${data.inv_make} ${data.inv_model}`,
      nav,
      detail,
    });
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  try {
    const classification_id = parseInt(req.params.classification_id);
    const invData = await invModel.getInventoryByClassificationId(classification_id);


    if (invData.length > 0) {
      return res.json(invData);
    } else {
      next(new Error("No data returned"));
    }
  } catch (error) {
    next(error);
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id) 
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
  const message = req.flash("message");

  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    message,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}


module.exports = invCont;
