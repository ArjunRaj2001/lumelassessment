const route = require("express").Router()
const salesController = require("../controller/salesController")

route.get("/revenue_calculation", salesController.totalRevenueCalculations)
route.get("/top_prodcuts", salesController.topProducts)
route.get("/customer_analizies", salesController.customerAnalizies)
route.get("/other_calculation", salesController.otherCalulation)



module.exports = route