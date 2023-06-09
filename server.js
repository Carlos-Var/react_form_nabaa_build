const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const path = require('path');

const dbConfig = require("./app/config/db.config");

const app = express();

// var corsOptions = {
//   origin: "http://localhost:8081"
// };
app.use(express.static(path.join(__dirname, 'build')))
console.log(path.join(__dirname, 'build'))

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(
  cookieSession({
    name: "bezkoder-session",
    secret: "COOKIE_SECRET", // should use as secret environment variable
    httpOnly: true
  })
);

const db = require("./app/models");
const Role = db.role;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});



// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/employee.routes")(app);
require("./app/routes/main_dep.routes")(app);
require("./app/routes/sub_dep.routes")(app);

app.get("*", async (req, res) => {
  res.sendFile(path.join(__dirname, 'build'))
})

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "evaluator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'evaluator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
