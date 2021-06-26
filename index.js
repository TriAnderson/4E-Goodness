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
  res.render("index");
});

// ===== LOGIN ROUTES =====
// DISPLAY login screen
app.get("/login", (req, res) => {
  res.render('login', {"msg":""});
})

// CHECK login info
// actually logs the person in and makes a session
app.post("/login", async (req, res) => {
  let sql = "SELECT Username, admin FROM Account WHERE Username=? AND Password=?";
  let params = [req.body.loginUsername, req.body.loginPassword];
  let rows = await executeSQL(sql, params);

  if (rows.length == 0) {
    // failed
    let status = "0";
    // console.log("login binary: ", status)
    // redirect check later
    // , {"msg":status} --> that in redirect gives an error! not http error_status_code
    // https://recipedb.cst336groupnbds.repl.co/userSubmit/userSubmit/login
    res.render('login', {"auth":false});
  } else {
    // success

    console.log("rows/data: ", rows);

    // sessions
    req.session.authenticated = true;
    req.session.name = rows[0]['Username'];
    let status = "1"
    console.log("login binary: ", status);
        
    let isAdmin = rows[0]['admin'];
    console.log("isAdmin: ", isAdmin);

    console.log("req.session.admin: ", req.session.admin);
    if (isAdmin == 1) {
      req.session.admin = true;
    }
    console.log("req.session.name: ", req.session.name);
    res.render('index', {"msg":status, "name":req.session.name, "admin":req.session.admin});
  }
});

app.get("/logout", isAuthenticated, function(req,res) {
  req.session.destroy();
  res.redirect("/");
});

// ===== SIGNUP ROUTES =====
// DISPLAY signup screen
app.get("/signup", (req, res) => {
  res.render('signup');
});

// INSERT new user info
app.post("/signup", async (req, res) => {
  // use api route to check username availability in signup page!
  console.log("signup req: ", req);

  let sql = "INSERT INTO Account (Username, email, Password) VALUES (?,?,?)";
  let params = [req.body.signupUsername, req.body.signupEmail, req.body.signupPassword];
  let rows = await executeSQL(sql, params);

  let status = "1";

  req.session.authenticated = true;
  req.session.name = req.body.signupUsername;
  req.session.admin = false;

  res.redirect('/');
  // res.redirect('user/uindex', {"msg":status, "name":req.session.name, "admin":req.session.admin});
});


// ===== Admin Routes =======


// == Admin Index Routes ===

app.get("/aindex", isAdmin, (req, res) => {

  console.log("Entering Admin index");

  res.render('admin/aindex.ejs');
});



// ==== User Routes =====

// == User Index Routes ===

app.get("/uindex", isAuthenticated, (req, res) => {
  
  console.log("Entering User index");

  res.render('user/uindex.ejs')
});






// UPDATE USER INFO ROUTES
app.post("/partials/login", isAuthenticated, async (req, res) => {
  let userId = req.body.userId;
  console.log(userId)
  let sql = `SELECT * FROM r_users WHERE userId = ${userId}`;
  let rows = await executeSQL(sql);
  console.log(rows)


  res.render("userSubmit/update-account", {"user":rows[0], "name":req.session.name, "userId":req.session.userId, "admin":req.session.admin});
});

app.post("/userSubmit/update", async (req, res) => {
  // use api route to check username availability in signup page!
  //console.log("signup req: ", req);
  let userId = req.session.userId;

  let sql = `UPDATE r_users
             SET name = ?,
                 password = ?, 
                 email = ?,
                 accMoney = ?
              WHERE userId = ${userId}`;
  let params = [req.body.UpdateUsername, req.body.UpdatePassword, req.body.UpdateEmail, req.body.UpdateAccMoney];
  let rows = await executeSQL(sql, params);

  req.session.name = req.body.UpdateUsername;

  res.redirect("/");
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
      res.redirect("/login");
    }
    else{
      next()
    }
}

function isAdmin(req, res, next){
    if(!req.session.admin){
      res.redirect("/login");
    }
    else{
      next()
    }
}

//start server
app.listen(3000, () => {
  console.log("Expresss server running...")
});