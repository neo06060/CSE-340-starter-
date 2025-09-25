/* ****************************************
*  Account Controller
* *************************************** */
const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  try {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
    })
  } catch (err) {
    console.error(err)
    next(err)
  }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  try {
    const nav = await utilities.getNav();
    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
  try {
    console.log("POST /account/register received:", req.body)

    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before saving
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
        `Congratulations, you're registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  } catch (err) {
    console.error("Registration error:", err)
    req.flash("notice", "An error occurred during registration. Please try again.")
    let nav = await utilities.getNav()
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res, next) {
  try {
    const { account_email, account_password } = req.body
    let nav = await utilities.getNav()

    // Fetch user by email
    const user = await accountModel.getUserByEmail(account_email)

    if (user) {
      // Compare submitted password with hashed password in DB
      const passwordMatch = await bcrypt.compare(account_password, user.account_password)

      if (passwordMatch) {
        // Password correct, log in
        req.session.user = {
          id: user.account_id,
          firstname: user.account_firstname,
          email: user.account_email,
          type: user.account_type
        }
        req.flash("notice", `Welcome back, ${user.account_firstname}!`)
        return res.redirect("/") // redirect after login
      }
    }

    // If we reach here, either email not found or password wrong
    req.flash("notice", "Invalid email or password")
    res.status(401).render("account/login", {
      title: "Login",
      nav
    })

  } catch (err) {
    console.error("Login error:", err)
    next(err)
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, loginAccount }
