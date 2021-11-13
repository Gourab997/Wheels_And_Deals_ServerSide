const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jepw0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const database = client.db("wheelsAndDeals");
    const carsCollection = database.collection("cars");
    const bookingCollection = database.collection("booking");
    const reviewCollection = database.collection("review");
    const usersCollection = database.collection("users");

    app.get("/homeCars", async (req, res) => {
      const cursor = await carsCollection.find({}).limit(6);
      const cars = await cursor.toArray();
      res.send(cars);
    });
    app.get("/cars", async (req, res) => {
      const cursor = await carsCollection.find({});
      const allCars = await cursor.toArray();
      res.send(allCars);
    });
    app.get("/reviews", async (req, res) => {
      const cursor = await reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    app.get("/allBooking", async (req, res) => {
      const cursor = await bookingCollection.find({});
      const booking = await cursor.toArray();
      res.send(booking);
    });

    app.get("/myBooking", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = bookingCollection.find(query);
      const bookings = await cursor.toArray();
      res.json(bookings);
    });

    //setAdmin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin=false;
      if (user?.role === "admin") {
        isAdmin = true;
      } else {
        res.send("Your are not valid ");
      }
      res.json({ admin: isAdmin });
    });

    //users
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const requester = req.decodedEmail;
      console.log(requester);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //delete
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await bookingCollection.deleteOne(query);
      res.send(booking);
    });
    //delete
    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cars = await carsCollection.deleteOne(query);
      res.send(cars);
    });

    //add new car
    app.post("/addNewCar", async (req, res) => {
      const car = req.body;
      const result = await carsCollection.insertOne(car);

      console.log(`cars created with id: ${result.insertedId}`);
      res.json(result);
    });

    //add new booking
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      console.log(`Booking created with id: ${result.insertedId}`);
      res.json(result);
    });

    app.put("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const updateBooking = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "shipped",
        },
      };
      const result = await bookingCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //add new user

    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(`user created with id: ${result.insertedId}`);
      res.json(result);
    });

    //add new review
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      console.log(`Review created with id: ${result.insertedId}`);
      res.json(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
