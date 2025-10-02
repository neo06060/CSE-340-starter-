const utilities = require("../utilities/")

const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData || {}
  const welcomeMessage = accountData.account_firstname ? `Welcome back, ${accountData.account_firstname}!` : null

  res.render("index", { title: "Home", nav, welcomeMessage })
}

module.exports = baseController
