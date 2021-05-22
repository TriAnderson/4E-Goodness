const express = require("express");
const mysql = require("mysql");
const session = require('express-session');

const app = express();
const pool = dbConnection();

app.set("view engine", "ejs");
app.use(express.static("public"));
// to be able to get params using POST method
app.use(express.urlencoded({extended:true}));

// ========== Session Stuff ==========
app.set('trust proxy', 1)

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

// ========== ROUTES ==========

// ==== HOME ROUTE ==== 
app.get("/", async (req, res) => {
  let sql = "SELECT * FROM ";

  let rows = executeSQL(sql);


  res.render("index", {"test":rows});
});



/*To access PHPMyAdmin: https://remotemysql.com/phpmyadmin/index.php  
  Username/Password are listed in dbConnection as user, password*/

// ===== FUNCTIONS =====
async function executeSQL(sql, params){
  return new Promise (function (resolve, reject) {
    pool.query(sql, params, function (err, rows, fields) {
    if (err) throw err;
      resolve(rows);
    });
  });
}// executeSQL

function dbConnection(){
   const pool  = mysql.createPool({
      connectionLimit: 10,
      host: "remotemysql.com",
      user: "IXF4gsmU6e",
      password: "vl2QfF3wLW",
      database: "IXF4gsmU6e"
   }); 
   return pool;
}; // dbConnection

//middleware function
function isAuthenticated(req, res, next){
    if(!req.session.authenticated){
      res.redirect("/userSubmit/login");
    }
    else{
      next()
    }
}

function isAdmin(req, res, next){
    if(!req.session.admin){
      res.redirect("/userSubmit/login");
    }
    else{
      next()
    }
}

//start server
app.listen(3000, () => {
  console.log("Expresss server running...")
});