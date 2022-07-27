const cors = require("cors");
const whitelist = [
  "http://localhost:8000",
  "http://localhost:8080",
  "http://localhost:3000",
  "https://money7-989.pages.dev",
  "http://money.internal",
];

module.exports = function (app) {
  app.use(
    cors({
      origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      optionsSuccessStatus: 200,
      methods: ["GET", "PUT", "DELETE", "POST"],
      credentials: true,
    })
  );
};
