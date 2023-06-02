const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const cors = require("cors");
var admin = require("firebase-admin");
const { initializeApp } = require('firebase-admin/app');
require('dotenv').config()

console.log(process.env.DB_PASS)

const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pqxh9tp.mongodb.net/burjAlArab?retryWrites=true&w=majority`


var serviceAccount = require("./configs/burj-al-arab-bf010-firebase-adminsdk-1w72x-0cc9a6be4e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(bodyParser.json());



const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  await client.connect();
  const booking = client.db("burjAlArab").collection("booking");

  app.post("/addBooking", (req, res) => {
    try {
      booking.insertOne(req.body).then((result) => {
        // res.send(insertedId > 0);
        // console.log(result.body);
        console.log(req.body);
      });
    } catch (error) {
      console.log(error);
    }
  });
  
  app.get("/booking",  (req, res) => {
    try {
      const bearer = req.headers.authorization
      if(bearer && bearer.startsWith('Bearer ')){
        const idToken=bearer.split(' ')[1]
        // console.log({idToken})
      admin
    .auth() 
    .verifyIdToken(idToken)
    .then( async (decodedToken)  =>  {
        const tokenEmail = decodedToken.email;
        console.log(tokenEmail,req.query.email)
        if(tokenEmail==req.query.email){
         const data = await booking.find({email:req.query.email}).toArray();
          res.status(200).send(data);
               } else {
          res.status(401).send('unothorised user')
               }

        // console.log(uid,decodedToken)
      })
    .catch(error=>{
             res.status(401).send('unothorised user')
          })

    }
        else {
          res.status(401).send('unothorised user')
               }
      // const data = await booking.find({email:req.query.email}).toArray();
      // res.send(data);
    } catch (error) {
      console.log(error);
    }
  });
  console.log("connected");
}

run();

app.get("/", (req, res) => {
  res.send("hello world");
});
app.listen(4200);
