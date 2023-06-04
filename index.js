require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@action-hero.htbsjzx.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   },
});

async function run() {
   const database = client.db("productsDB");
   const products = database.collection("products");
   try {
      app.get("/all-toys", async (req, res) => {
         const limit = parseInt(req.query.limit);
         const currentPage = parseInt(req.query.currentPage);
         const skip = (currentPage - 1) * limit;
         const toys = products.find().limit(limit).skip(skip);
         const data = await toys.toArray();
         res.send(data);
      });

      app.get("/toy/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const data = await products.findOne(query);
         res.send(data);
      });
      app.get("/update-toy/:id", async (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const data = await products.findOne(query);
         res.send(data);
      });

      app.get("/category-marvel", async (req, res) => {
         const query = { subCategory: "Marvel Universe" };
         const data = await products.find(query).limit(3).toArray();
         res.send(data);
      });

      app.get("/category-dcu", async (req, res) => {
         const query = { subCategory: "DC Universe" };
         const data = await products.find(query).limit(3).toArray();
         res.send(data);
      });

      app.get("/category-disney", async (req, res) => {
         const query = { subCategory: "Disney Universe" };
         const data = await products.find(query).limit(3).toArray();
         res.send(data);
      });

      app.put("/update-toy/:id", async (req, res) => {
         const id = req.params.id;
         const newData = req.body;
         const findToy = { _id: new ObjectId(id) };
         const query = await products.findOne(findToy);
         const options = { upsert: true };

         const updateData = {
            $set: {
               price: newData.price,
               quantity: newData.quantity,
               description: newData.description,
            },
         };

         const data = await products.updateOne(query, updateData, options);
         res.send(data);
      });

      app.get("/my-toys/low-to-high/:id", async (req, res) => {
         const id = req.params.id;
         const query = { userID: id };
         const data = products.find(query).sort({ price: 1 });
         const mytoys = await data.toArray();
         res.send(mytoys);
      });

      app.get("/my-toys/high-to-low/:id", async (req, res) => {
         const id = req.params.id;
         const query = { userID: id };
         const data = products.find(query).sort({ price: -1 });
         const mytoys = await data.toArray();
         res.send(mytoys);
      });

      app.post("/add-product", (req, res) => {
         const data = req.body;
         const createProduct = products.insertOne(data);
         res.send(createProduct);
      });

      app.delete("/my-toys/delete/:id", (req, res) => {
         const id = req.params.id;
         const query = { _id: new ObjectId(id) };
         const data = products.deleteOne(query);
         res.send(data);
      });
   } catch (error) {
      console.log(error);
   }
}
run().catch(console.dir);

app.get("/", (req, res) => {
   res.send("Server Running");
});

app.listen(port);
