const express = require("express")
const bodyParser = require("body-parser")
require('dotenv').config()
const salesRoute = require("./route/salesRoutes")
const app = express()

app.use("/sales", salesRoute)
app.listen(process.env.PORT, () => {
    console.log("server running on port: " + process.env.PORT)
})  