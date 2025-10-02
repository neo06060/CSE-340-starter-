const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const utilities = require("../utilities/")
require("dotenv").config()

// Deliver login view
async function buildLogin(req, res) {
  let nav = await utilities.getNav()
  res.render("account/login", { title: "Login", nav, errors: null, account_email: "" })
}

// Deliver registration view
async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  res.render("account/register", { title: "Register", nav, errors: null })
}

// Process registration
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const regResult = await accountModel.registerAccount(account_firstname, account_lastname, account_email, hashedPassword)

    if (regResult && regResult.rowCount > 0) {
      req.flash("notice", `Congratulations ${account_firstname}, you are registered! Please log in.`)
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

// Process login
async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Invalid email or password")
    return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
  }

  try {
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (!passwordMatch) {
      req.flash("notice", "Invalid email or password")
      return res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
    }

    // Remove password before creating token
    delete accountData.account_password

    // Create JWT
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })

    // Set cookie
    const cookieOptions = { httpOnly: true, maxAge: 3600 * 1000 }
    if (process.env.NODE_ENV !== "development") cookieOptions.secure = true
    res.cookie("jwt", accessToken, cookieOptions)

    // Redirect to home with welcome message
    res.redirect("/")
  } catch (err) {
    console.error("Login error:", err)
    req.flash("notice", "An error occurred during login")
    res.status(500).render("account/login", { title: "Login", nav, errors: null, account_email })
  }
}

// Account management view


async function buildAccountManagement(req, res) {
  const nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()

  res.render("account/management", {
    title: "Account Management",
    nav,
    classificationSelect,
    message: null,   // <-- define message so EJS won’t crash
    errors: null,
    accountData: res.locals.accountData
  })
}



module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement }
