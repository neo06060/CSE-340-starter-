/* *****************************
*   Register new account
* *************************** */
const pool = require("../database")

async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = `
      INSERT INTO account
        (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'client')
      RETURNING *
    `
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password
    ])
    return result
  } catch (error) {
    console.error("Database error in registerAccount:", error)
    throw error
  }
}
async function getAccountByEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])
    return result.rows[0] // returns undefined if no user found
  } catch (error) {
    console.error("Database error in getAccountByEmail:", error)
    throw error
  }
}

module.exports = { registerAccount, getAccountByEmail }

