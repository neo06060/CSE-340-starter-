const regValidate = require("../utilities/account-validation");
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

// Account Management - require login
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Account edit (GET)
router.get(
  "/edit/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountEdit)
);

// Account update (POST)
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateAccountRules(), // new validation set (see below)
  regValidate.checkUpdateData,
  utilities.handleErrors(accountController.updateAccountInfo)
);

// Password change (POST)
router.post(
  "/password",
  utilities.checkLogin,
  regValidate.passwordRules(), // reuse or implement rules for password
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.changePassword)
);

// Logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

// Process the registration data
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// After
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccountManagement)
)


module.exports = router
