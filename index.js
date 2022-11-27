const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()

const app = express()

// middleware
app.use(cors());
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nl9uncn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


async function run() {
    try{
        const usersCollection = client.db("mobileMart").collection("users");
    }
    finally{

    }
}
run().catch(err => console.error(err))













app.get('/', async(req, res) => {
    res.send('Mobile Mart server is running')
})
app.listen(port, () => console.log(`Doctors Portal Running on Port ${port}`))