const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000

// middlewares
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_username}:${process.env.DB_passkey}@cluster0.wvuyzyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });


async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();

        const usersCollection = client.db("Bloodhub").collection("users");
        const donationRequestsCollection = client.db("Bloodhub").collection("donation-requests");



        // users related api
        app.post('/users', async(req, res) => {
            const user = req.body;
            const query = {email : user.email}
            const existingUser = await usersCollection.findOne(query);
            if(existingUser) {
              return res.send({message: "User already exists", insertedId: null})
            }
            const result = await usersCollection.insertOne(user)
            // const allUsers =  await usersCollection.find().toArray()
            res.send(result);
        })

        app.get('/users', async(req, res) => {
          const result =  await usersCollection.find().toArray()
          res.send(result);
        })

        app.patch("/users/makeadmin/:id", async(req, res) => {
          const id = req.params.id;
          const filter = {_id : new ObjectId(id)}
          const updateDoc = {
            $set : {role : "admin"}
          }
          const result = await usersCollection.updateOne(filter, updateDoc)
          res.send(result);
        })
        app.patch("/users/makevolunteer/:id", async(req, res) => {
          const id = req.params.id;
          const filter = {_id : new ObjectId(id)}
          const updateDoc = {
            $set : {role : "volunteer"}
          }
          const result = await usersCollection.updateOne(filter, updateDoc)
          res.send(result);
        })
        app.patch("/users/block/:id", async(req, res) => {
          const id = req.params.id;
          const filter = {_id : new ObjectId(id)}
          const updateDoc = {
            $set : {status : "block"}
          }
          const result = await usersCollection.updateOne(filter, updateDoc)
          res.send(result);
        })
        app.patch("/users/unblock/:id", async(req, res) => {
          const id = req.params.id;
          const filter = {_id : new ObjectId(id)}
          const updateDoc = {
            $set : {status : "active"}
          }
          const result = await usersCollection.updateOne(filter, updateDoc)
          res.send(result);
        })

        // donatiion requests api 
        app.post("/donationrequests", async(req, res) => {
          const donationRequest = req.body;
          const result = await donationRequestsCollection.insertOne(donationRequest)
          res.send(result);
        })

        app.get("/donationrequests", async(req, res) => {
          const result =  await donationRequestsCollection.find().toArray()
          res.send(result);
        })

        app.delete("/donationrequests/:id", async(req, res) => {
          const id = req.params.id;
          const filter = {_id : new ObjectId(id)}
          const result = await donationRequestsCollection.deleteOne(filter)
          res.send(result);
        })

       

        // Profile related api
        // app.get('/users/hi/:email', async(req, res) => {
        //   const email = req.params.email;
        //   const query = {email: email}
        //   const users = await usersCollection.find(query).toArray()
        //   // console.log(users)
        //   res.send(users);
        // })




      // Send a ping to confirm a successful connection
    //   await client.db("admin").command({ ping: 1 });
    //   console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send("blood hub is running...")
})
app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})






// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const express = require("express");
// const cors = require("cors");
// const jwt = require('jsonwebtoken');
// require('dotenv').config()
// const app = express();
// const port = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());