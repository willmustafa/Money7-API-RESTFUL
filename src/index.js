require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
const cookieParser = require("cookie-parser");

const app = express();

// ENVIRONMENT
const port = process.env.PORT || 3030;

// MIDDLEWARES
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
require("./middlewares/cors")(app);
app.use(cookieParser());
app.use(require("sanitize").middleware);

// INIT
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => console.log(`Listening on port ${port}`));
}
require("./database/sync");

// ROUTES
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));
require("./routes/index")(app);

module.exports = app;
