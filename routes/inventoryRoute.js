// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inv-validation");
const utilities = require("../utilities/");

// Task 1: Management view
router.get("/", utilities.handleErrors(invController.buildManagement));

// Task 2: Add Classification (only for Employee/Admin)
router.get("/add-classification", utilities.checkEmployee, utilities.handleErrors(invController.buildAddClassification));
router.post(
  "/add-classification",
  utilities.checkEmployee,
  invValidate.classificationRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addClassification)
);

// Task 3: Add Inventory (only for Employee/Admin)
router.get("/add-inventory", utilities.checkEmployee, utilities.handleErrors(invController.buildAddInventory));
router.post(
  "/add-inventory",
  utilities.checkEmployee,
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.addInventory)
);

// AJAX: get inventory JSON (public, no auth)
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Edit inventory view (only Employee/Admin)
router.get(
  "/edit/:inv_id",
  utilities.checkEmployee,
  utilities.handleErrors(invController.editInventoryView)
);

// Add POST route for update (only Employee/Admin)
// Note: you'll implement invController.updateInventory
router.post(
  "/update",
  utilities.checkEmployee,
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  utilities.handleErrors(invController.updateInventory)
);

// Delete (route example - only Employee/Admin)
// router.post("/delete", utilities.checkEmployee, utilities.handleErrors(invController.deleteInventory));

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.buildVehicleDetail);

module.exports = router;
