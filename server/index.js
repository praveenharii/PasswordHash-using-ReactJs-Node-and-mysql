const express = require('express')
const mysql = require('mysql')
const app = express()
const cors = require('cors')
const PORT = 3001
const bcrypt = require("bcryptjs");
var nodemailer = require("nodemailer");
const crypto = require("crypto");

app.use(cors())
app.use(express.json());



const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "",
  database: "nodemysql",
});

//connect to mysql
db.connect(err => {
    if(err){
        throw err
    }
    console.log("Mysql Connected")
})


// app.get('/createdb', (req,res) => {
//     let sql = "CREATE DATABASE nodemysql";
//     db.query(sql, (err) => {
//         if(err){
//             throw err;
//         }
//         res.send("Database Created");
//     });
// });



app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
   const encryptedPassword = await bcrypt.hash(password, 10);
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    
    if (err) {
      console.log(err);
      res.send("Error creating account");
    } else if (results.length > 0) {
      console.log("User already exists");
      res.send("User already exists");
    } else {
      // Insert new user
      db.query(
        "INSERT INTO users (email, password) VALUES (?,?)",
        [email, encryptedPassword],
        (err, results) => {
          if (err) {
            console.log(err);
            res.send("Error creating account");
          } else {
            console.log("Account created successfully");
            res.send("Success");
          }
        }
      );
    }
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.log(err);
        res.send("Error fetching user");
      } else if (results.length === 0) {
        // User not found
        res.send("User not found");
      } else {
        // User found, check password
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          res.send("Login successful");
        } else {
          res.send("Incorrect password");
        }
      }
    }
  );
});

// Send email function
async function sendEmail(message) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "linux2156@gmail.com",
      pass: "wuzecfhttfwnysvu",
    },
  });

  try {
    await transporter.sendMail(message);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

// app.post("/forgotPassword", async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await db.query("SELECT * FROM users WHERE email = ?", [email]);

//     if (user.length === 0) {
//       res.send("User not found");
//     } else {
//       // Generate temporary password
//       const tempPassword = crypto.randomBytes(4).toString("hex");

//       // Update user's password with the temporary password
//       await db.query("UPDATE users SET password = ? WHERE email = ?", [
//         tempPassword,
//         email,
//       ]);

//       // Send temporary password to user's email
//       const message = {
//         to: email,
//         from: "linux2156@gmail.com",
//         subject: "Temporary Password",
//         text: `Your temporary password is: ${tempPassword}`,
//       };
//       await sendEmail(message);

//       res.send("New temporary password sent");
//     }
//   } catch (error) {
//     console.error("Error fetching user: ", error);
//     res.send("Error fetching user");
//   }
// });

app.post("/forgotPassword", async (req, res) => {
  const { email } =req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        console.log(err);
        res.send("Error fetching user");
      } else if (results.length === 0) {
        res.send("User not found");
      } else {
        const tempPassword = crypto.randomBytes(4).toString("hex");
        const encryptedPassword = await bcrypt.hash(tempPassword, 10);
        db.query("UPDATE users SET password = ? WHERE email = ?", [
        encryptedPassword,
        email,
      ]);
      const msg = {
        to: email,
        from: "praveenhari1900@gmail.com",
        subject: "Forgot Password Link To new Password",
        text: `Your temporary password is: ${tempPassword}.`,
      };

      try {
        sendEmail(msg);
        console.log(`Email sent to ${email}`);
         res.send("New Temporary password sent");
      } catch (error) {
        `Error sending email to ${email}: ${error.message}`;
        throw err;
      }
       
           
      }
    }
  );
  
});







app.listen(PORT, ()=> {
    console.log('Server Is connected');
})