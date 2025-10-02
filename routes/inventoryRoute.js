// Needed Resources 
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inv-validation");
const utilities = require("../utilities/");

// Task 1: Management view
router.get("/", invController.buildManagement);

// Task 2: Add Classification
router.get("/add-classification", invController.buildAddClassification);
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkInvData,
  invController.addClassification
);

// Task 3: Add Inventory
router.get("/add-inventory", invController.buildAddInventory);
router.post(
  "/add-inventory",
  invValidate.inventoryRules(),
  invValidate.checkInvData,
  invController.addInventory
);

// Update Inventory
router.post(
  "/update",
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  utilities.handleErrors(invController.updateInventory)
);

// JSON route for inventory
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
);

// Edit inventory view
router.get(
  "/edit/:inv_id",
  utilities.handleErrors(invController.editInventoryView)
);

// Existing routes
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.buildVehicleDetail);

module.exports = router;
