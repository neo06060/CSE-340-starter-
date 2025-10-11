const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const utilities = require("../utilities/")
require("dotenv").config()

/* *******************************
 * Helper to prepare account fields for rendering
 ******************************* */
function prepareAccountData(accountData) {
  return {
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname || "",
    account_lastname: accountData.account_lastname || "",
    account_email: accountData.account_email || "",
    account_phone: accountData.account_phone || "",
    account_address: accountData.account_address || "",
    account_bio: accountData.account_bio || "",
  }
}

/* *******************************
 * Show the admin registration form
 ******************************* */
async function buildAdminRegister(req, res, next) {
  try {
    const nav = await utilities.getNav()
    res.render("account/register-admin", {
      title: "Register Admin",
      nav,
    })
  } catch (error) {
    next(error)
  }
}

/* *******************************
 * Process admin registration
 ******************************* */
async function registerAdmin(req, res, next) {
  try {
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    const emailExists = await accountModel.checkExistingEmail(account_email)
    if (emailExists) {
      req.flash("notice", "Email is already registered.")
      return res.redirect("/account/register-admin")
    }

    const hashedPassword = await bcrypt.hash(account_password, 10)

    await accountModel.registerAdminAccount({
      account_firstname,
      account_lastname,
      account_email,
      account_password: hashedPassword,
      account_type: "Admin",
    })

    res.redirect("/account/login")
  } catch (error) {
    next(error)
  }
}

/* *******************************
 * Deliver login view
 ******************************* */
async function buildLogin(req, res) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email: "",
  })
}

/* *******************************
 * Deliver registration view
 ******************************* */
async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  res.render("account/register", { title: "Register", nav, errors: null })
}

/* *******************************
 * Process registration
 ******************************* */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )

    if (regResult && regResult.rowCount > 0) {
      req.flash(
        "notice",
        `Congratulations ${account_firstname}, you are registered! Please log in.`
      )
      return res.redirect("/account/login")
    } else {
      req.flash("notice", "Registration failed, please try again.")
      res.status(501).render("account/register", { title: "Register", nav, errors: null })
    }
  } catch (err) {
    console.error("Registration error:", err)
    req.flash("notice", "An error occurred during registration. Please try again.")
    res.status(500).render("account/register", { title: "Register", nav, errors: null })
  }
}

/* *******************************
 * Process login
 ******************************* */
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Invalid email or password")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }

  try {
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (!passwordMatch) {
      req.flash("notice", "Invalid email or password")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }

    // Remove password before creating token
    delete accountData.account_password

    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
    const cookieOptions = { httpOnly: true, maxAge: 3600 * 1000 }
    if (process.env.NODE_ENV !== "development") cookieOptions.secure = true
    res.cookie("jwt", accessToken, cookieOptions)

    res.redirect("/")
  } catch (err) {
    console.error("Login error:", err)
    req.flash("notice", "An error occurred during login")
    res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}

/* *******************************
 * Account Management View
 ******************************* */
async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()

  res.render("account/management", {
    title: "Account Management",
    nav,
    classificationSelect,
    message: null,
    errors: null,
    accountData: res.locals.accountData,
  })
}

/* *******************************
 * Build Account Edit View (GET)
 ******************************* */
async function buildAccountEdit(req, res, next) {
  try {
    const account_id = parseInt(req.params.account_id)
    const nav = await utilities.getNav()

    const accountData = await accountModel.getAccountById(account_id)
    if (!accountData) {
      req.flash("notice", "Account not found.")
      return res.redirect("/account/")
    }

    res.render("account/edit-account", {
      title: "Update Account",
      nav,
      errors: null,
      message: null,
      ...prepareAccountData(accountData),
    })
  } catch (err) {
    next(err)
  }
}

/* *******************************
 * Build Profile Edit View (GET)
 ******************************* */
async function buildProfileEdit(req, res, next) {
  try {
    const account_id = res.locals.accountData.account_id
    const nav = await utilities.getNav()
    const accountData = await accountModel.getAccountById(account_id)

    res.render("account/edit-account", {
      title: "Edit Profile",
      nav,
      errors: null,
      message: null,
      ...prepareAccountData(accountData),
    })
  } catch (err) {
    next(err)
  }
}

/* *******************************
 * Update Profile (POST)
 ******************************* */
async function updateProfile(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { account_id, account_phone, account_address, account_bio } = req.body

    const updateResult = await accountModel.updateAccountProfile(
      account_id,
      account_phone,
      account_address,
      account_bio
    )

    if (updateResult) {
      req.flash("notice", "Profile updated successfully.")
      const updated = await accountModel.getAccountById(account_id)
      res.locals.accountData = updated

      res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        message: "Profile updated successfully.",
      })
    } else {
      req.flash("notice", "Profile update failed.")
      res.status(500).render("account/edit-profile", {
        title: "Edit Profile",
        nav,
        errors: null,
        message: req.flash("notice")[0],
        account_id,
        account_phone,
        account_address,
        account_bio,
      })
    }
  } catch (err) {
    next(err)
  }
}

/* *******************************
 * Update Account Info (POST)
 ******************************* */
async function updateAccountInfo(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { account_id, account_firstname, account_lastname, account_email } = req.body

    const updateResult = await accountModel.updateAccountInfo(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    )

    if (updateResult) {
      const updated = await accountModel.getAccountById(account_id)
      req.flash("notice", "Account information updated.")
      res.locals.accountData = updated
      res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        message: "Your account was updated.",
      })
    } else {
      req.flash("notice", "Update failed.")
      res.status(501).render("account/edit-account", {
        title: "Update Account",
        nav,
        errors: null,
        message: req.flash("notice")[0],
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      })
    }
  } catch (err) {
    next(err)
  }
}

/* *******************************
 * Change Password (POST)
 ******************************* */
async function changePassword(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const { account_id, newPassword } = req.body

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const result = await accountModel.updatePassword(account_id, hashedPassword)

    if (result) {
      const updated = await accountModel.getAccountById(account_id)
      req.flash("notice", "Password updated successfully.")
      res.locals.accountData = updated
      res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        message: "Password updated.",
      })
    } else {
      req.flash("notice", "Password update failed.")
      res.status(500).render("account/edit-account", {
        title: "Update Account",
        nav,
        errors: null,
        message: req.flash("notice")[0],
        account_id,
      })
    }
  } catch (err) {
    next(err)
  }
}

/* *******************************
 * Logout
 ******************************* */
async function accountLogout(req, res, next) {
  try {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    res.redirect("/")
  } catch (err) {
    next(err)
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  buildAccountEdit,
  updateAccountInfo,
  changePassword,
  accountLogout,
  buildAdminRegister,
  registerAdmin,
  buildProfileEdit,
  updateProfile,
}
