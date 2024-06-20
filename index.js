const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_username}:${process.env.DB_passkey}@cluster0.wvuyzyg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("Bloodhub").collection("users");
    const blogsCollection = client.db("Bloodhub").collection("blog");
    const donationRequestsCollection = client
      .db("Bloodhub")
      .collection("donation-requests");

    // users related api
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "User already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(user);
      // const allUsers =  await usersCollection.find().toArray()
      res.send(result);
    });

    app.get("/loggedinuser", async (req, res) => {
      const email = req.query.email;
      const query = {email: email}
      const result = await usersCollection.findOne(query)
      res.send(result)
    })


    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.patch("/users/makeadmin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/users/makevolunteer/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { role: "volunteer" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/users/block/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { status: "block" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/users/unblock/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { status: "active" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // update user profile
    app.patch("/updateuserprofile/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body
      console.log(data)
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          name: data.name,
          photourl: data.image,
          bloodGroup: data.bloodgroup,
          district: data.district,
          upazilla: data.upazila
        }
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // donatiion requests api
    app.post("/donationrequests", async (req, res) => {
      const donationRequest = req.body;
      const result = await donationRequestsCollection.insertOne(
        donationRequest
      );
      res.send(result);
    });

    app.get("/donationrequests", async (req, res) => {
      const result = await donationRequestsCollection.find().toArray();
      res.send(result);
    });

    app.delete("/donationrequests/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await donationRequestsCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/donationrequestbyemail", async (req, res) => {
      // console.log("locha elelee siam")
      const email = req.query.email;
      const sort = req.query.sort;
      // console.log("second", email)
      // console.log(sort)
      let query = { userEmail: email };
      if (sort !== "default") {
        query = { status: sort, userEmail: email };
      }
      const result = await donationRequestsCollection.find(query).toArray();
      res.send(result);
      // console.log(result);
    });

    // admin
    app.get("/totalrequesteddonations", async (req, res) => {
      const sort = req.query.sort;
      let query = {};
      if (sort !== "default") {
        query = { status: sort };
      }
      const result = await donationRequestsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/donationdetails/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await donationRequestsCollection.findOne(filter);
      res.send(result);
    });

    app.patch("/changetoinprogress/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { status: "inProgress" },
      };
      const result = await donationRequestsCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });
    app.patch("/donationCancel/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { status: "cancel" },
      };
      const result = await donationRequestsCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });
    app.patch("/donationDone/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { status: "done" },
      };
      const result = await donationRequestsCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    app.patch("/updatedonation/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: req.body,
      };
      const result = await donationRequestsCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    // Donor Home Page
    app.get("/recentdonationrequests", async (req, res) => {
      const email = req.query.email;
      // console.log("first",email)
      const query = { userEmail: email };
      const options = {
        sort: { serialNo: 1 },
        projection: {
          userEmail: 1,
          donationDate: 1,
          donationTime: 1,
          status: 1,
          recipientName: 1,
        },
      };
      // const result = await donationRequestsCollection.find(query).toArray()
      const result = await donationRequestsCollection
        .find(query, options)
        .toArray();
      // console.log(result)
      res.send(result);
    });

    // Public blood donations
    app.get("/publicdonations", async (req, res) => {
      const query = {status: "pending"}
      const result = await donationRequestsCollection.find(query).toArray();
      // console.log(result)
      res.send(result);
    })

    // public searched blood donations
    app.post("/getsearcheddonations" , async (req, res) => {
      let bloG  = req.body.bloodGroup
      let dist = req.body.district
      let upa = req.body.upazilla
      // const details = req.body
      console.log( bloG, dist, upa)
      const query = {
        district: dist,
        upazilla: upa,
        bloodGroup: bloG
       }
       const result = await usersCollection.find(query).toArray();
       console.log(result)
      res.send(result);
    })

// blog related api
    app.post("/blog", async (req, res) => {
      const blog = req.body;
      const result = await blogsCollection.insertOne(blog);
      res.send(result);
    })

    app.get("/blogs", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    })

    app.delete("/deleteablog/:id", async (req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const result = await blogsCollection.deleteOne(filter)
      res.send(result);
    })

    app.patch("/unpublishablog/:id",  async (req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const updateDoc = {
        $set: { status: "draft" },
      };
      const result = await blogsCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.patch("/publishablog/:id",  async (req, res) => {
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const updateDoc = {
        $set: { status: "publish" },
      };
      const result = await blogsCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.get("/sortedblogs", async (req, res) => {
      const sort = req.query.sort;
      console.log(sort)
      let query = {};
      if (sort !== "default") {
        query = { status: sort };
      }
      const result = await blogsCollection.find(query).toArray();
      res.send(result);
      console.log(result)
    });

    app.get("/getblogdetailsbyid/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await blogsCollection.findOne(filter);
      res.send(result);
    });


    // Send a ping to confirm a successful connection
    //   await client.db("admin").command({ ping: 1 });
    //   console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("blood hub is running...");
});
app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

// const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const express = require("express");
// const cors = require("cors");
// const jwt = require('jsonwebtoken');
// require('dotenv').config()
// const app = express();
// const port = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());
