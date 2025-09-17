const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}




// single detail vehicle view


invCont.buildVehicleDetail = async function (req, res, next) {
    try {
        const inv_id = req.params.invId;
        const data = await invModel.getVehicleById(inv_id);

        if (!data){
            return res.status(404).render("errors/error",{
                title: "Vehicle Not Found",
                message: "Sorry, the requested vehicle does not exist.",
            });
        }

        const detail = await utilities.buildVehicleDetail(data);
        const nav = await utilities.getNav();

        res.render("./inventory/detail",{
            title: `${data.inv_make} ${data.inv_model}`,
            nav,
            detail,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = invCont