// models/inventory-model.js
const pool = require("../database");

// Get all classification data
async function getClassifications() {
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

// Get inventory items by classification id
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name
       FROM public.inventory AS i
       JOIN public.classification AS c
         ON i.classification_id = c.classification_id
       WHERE i.classification_id = $1
       ORDER BY i.inv_make, i.inv_model`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: ", error);
    return [];
  }
}

// Get a single vehicle by inventory id
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT i.*, c.classification_name
       FROM public.inventory AS i
       JOIN public.classification AS c
         ON i.classification_id = c.classification_id
       WHERE i.inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  } catch (error) {
    console.error("getVehicleById error: ", error);
    return null;
  }
}

// Insert new classification
async function insertClassification(classification_name) {
  try {
    const result = await pool.query(
      `INSERT INTO public.classification (classification_name)
       VALUES ($1)
       RETURNING classification_id, classification_name`,
      [classification_name]
    );
    return result.rows[0];
  } catch (error) {
    console.error("insertClassification error: ", error);
    return null;
  }
}

// Insert new inventory item
async function insertInventory(invData) {
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
  } = invData;

  try {
    const result = await pool.query(
      `INSERT INTO public.inventory
       (inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, inv_image, inv_thumbnail, classification_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING inv_id`,
      [
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
      ]
    );
    return result.rows[0];
  } catch (error) {
    console.error("insertInventory error: ", error);
    return null;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  insertClassification,
  insertInventory,
};
