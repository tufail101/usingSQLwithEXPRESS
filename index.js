require("dotenv").config();
const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 3000

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
});
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let count = result[0]["count(*)"];
      res.render("home", { count });
    });
  } catch (err) {
    console.log(err);
  }
});
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let users = result;
      res.render("users", { users });
    });
  } catch (err) {
    console.log(err);
  }
});
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("edit", { user });
    });
  } catch (err) {
    console.log(err);
  }
});
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { name, password } = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      if (password != user.password) {
        res.send("wrong password");
      } else {
        let q2 = `UPDATE user SET name = ? WHERE id = '${id}' `;
        try {
          connection.query(q2, name, (err, result) => {
            if (err) throw err;

            res.redirect("/user");
          });
        } catch (err) {
          console.log(err);
        }
      }
    });
  } catch (err) {
    console.log(err);
  }
});
app.get("/user/:add", (req, res) => {
  res.render("add");
});
app.post("/user/:add", (req, res) => {
  let id = uuidv4();
  let { name, password, email } = req.body;
  let q = `INSERT INTO user(id,name,password,email)  VALUES (?,?,?,?)`;
  try {
    if (!name || !password || !email) {
      res.send("ALL FIELD ARE REQUIRED");
    }
    connection.query(q, [id, name, password, email], (err, result) => {
      if (err) throw err;
      console.log(result);
      res.redirect("/user");
    });
  } catch (err) {
    console.log(err);
  }
});
app.get("/user/:id/remove", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("remove", { user });
    });
  } catch (err) {
    console.log(err);
  }
});
app.delete("/user/:id",(req,res)=>{
  let {id} = req.params;
  let {password} = req.body;
  let q = `SELECT * FROM user WHERE id = '${id}'`;
  try{
    connection.query(q,(err,result)=>{
      if(err) throw err;
      let user = result[0];
      if(user.password != password){
        res.send("Password Is Worng");
      }else{
        let q2 = `DELETE FROM user WHERE id = '${id}'`;
        try{
          connection.query(q2,(err,result)=>{
            if(err) throw err;
            res.redirect("/user");
          })
        }catch(err){
          console.log(err);
          
        }
       
      }
    })
  }catch(err){
    console.log(err);
    
  }
})
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
