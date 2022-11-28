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
        const categoriesCollection = client.db("mobileMart").collection("categories");
        const productCollection = client.db("mobileMart").collection("product");
        const bookingsCollection = client.db("mobileMart").collection("bookingProduct");

        app.get('/categories', async (req, res) => {
            const query = {};
            const users = await categoriesCollection.find(query).toArray();
            res.send(users);
        });

        app.get("/categories/:id", async(req, res) => {
            const id = req.params.id
            const query = {category_id: id}
            const service = await productCollection.find(query).toArray()
            res.send(service)
          });


        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const query = {
                user_email: booking.user_email,
                Product_name: booking.Product_name 
            }
    
            const alreadyBooked = await bookingsCollection.find(query).toArray();
    
            if (alreadyBooked.length){
                const message = `You already have a booking on ${booking.appointmentDate}`
                return res.send({acknowledged: false, message})
            }
    
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(err => console.error(err))













app.get('/', async(req, res) => {
    res.send('Mobile Mart server is running')
})
app.listen(port, () => console.log(`Doctors Portal Running on Port ${port}`))