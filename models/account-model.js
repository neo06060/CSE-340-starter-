const pool = require("../database")

/* *****************************
 *   Register new client account
 * *************************** */
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

/* *****************************
 *   Register new admin account
 * *************************** */
async function registerAdminAccount({ account_firstname, account_lastname, account_email, account_password }) {
  try {
    const sql = `
      INSERT INTO account
        (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'admin')
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
    console.error("Database error in registerAdminAccount:", error)
    throw error
  }
}

/* *****************************
 *   Get account by email
 * *************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const result = await pool.query(sql, [account_email])
    return result.rows[0]
  } catch (error) {
    console.error("Database error in getAccountByEmail:", error)
    throw error
  }
}

/* *****************************
 *   Get account by ID
 * *************************** */
async function getAccountById(account_id) {
  try {
    const sql = "SELECT * FROM account WHERE account_id = $1";
    const result = await pool.query(sql, [account_id]);
    return result.rows[0];
  } catch (error) {
    console.error("getAccountById error: ", error);
    return null;
  }
}

/* *****************************
 *   Update account info
 * *************************** */
async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql =
      `UPDATE account
       SET account_firstname = $1, account_lastname = $2, account_email = $3
       WHERE account_id = $4
       RETURNING account_id, account_firstname, account_lastname, account_email, account_type`;
    const data = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return data.rows[0];
  } catch (error) {
    console.error("updateAccountInfo error: ", error);
    return null;
  }
}

/* *****************************
 *   Update password
 * *************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING account_id";
    const data = await pool.query(sql, [hashedPassword, account_id]);
    return data.rows[0];
  } catch (error) {
    console.error("updatePassword error: ", error);
    return null;
  }
}

/* *******************************
 * Check if an email already exists
 ******************************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT account_email FROM public.account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking existing email:", error);
    throw error;
  }
}

module.exports = {
  registerAccount,
  registerAdminAccount,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updatePassword,
  checkExistingEmail
}
