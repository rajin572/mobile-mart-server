const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require('cheerio')
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 5000;
require("dotenv").config();
const state = []

const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nl9uncn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const usersCollection = client.db("mobileMart").collection("users");
    const categoriesCollection = client
      .db("mobileMart")
      .collection("categories");
    const productCollection = client.db("mobileMart").collection("product");
    const bookingsCollection = client
      .db("mobileMart")
      .collection("bookingProduct");
    const advertiseCollection = client
      .db("mobileMart")
      .collection("advertiseProduct");

    app.get("/categories", async (req, res) => {
      const query = {};
      const categories = await categoriesCollection.find(query).toArray();
      res.send(categories);
    });

    app.get("/categories/:id", async (req, res) => {
      const id = req.params.id;
      const query = { category_id: id };
      const service = await productCollection.find(query).toArray();
      res.send(service);
    });

    app.get("/products", async (req, res) => {
      const email = req.query.email;
      const query = { seller_email: email };
      const bookings = await productCollection.find(query).toArray();
      res.send(bookings);
    });

    app.post("/products", async (req, res) => {
      const product = req.body;

      const result = await productCollection.insertOne(product);
      res.send(result);
    });

    app.get("/advertise", async (req, res) => {
      const query = {};
      const advertise = await advertiseCollection.find(query).toArray();
      res.send(advertise);
    });

    app.post("/advertise", async (req, res) => {
      const advertise = req.body;
      const query = {
        name: advertise.name,
        resalePrice: advertise.resalePrice,
      };

      const alreadyadded = await advertiseCollection.find(query).toArray();

      if (alreadyadded.length) {
        const message = `You already have a booking on`;
        return res.send({ acknowledged: false, message });
      }
      const result = await advertiseCollection.insertOne(advertise);
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const query = {
        user_email: booking.user_email,
        Product_name: booking.Product_name,
      };

      const alreadyBooked = await bookingsCollection.find(query).toArray();

      if (alreadyBooked.length) {
        const message = `You already have a booking on ${booking.appointmentDate}`;
        return res.send({ acknowledged: false, message });
      }

      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      const email = req.query.email;
      const query = { user_email: email };
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    });

    app.get("/users", async (req, res) => {
      const role = req.query.role;
      const query = { role: role };
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    app.get("/user", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const allUsers = await usersCollection.findOne(query);
      res.send(allUsers);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const email = user.email;
      const filter = { email: email };
      const options = { upsert: true };
      const obj = {
        email: user.email,
        name: user.name,
        role: user.role || "buyer",
      };
      const updateDoc = { $set: obj };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    // app.get("/scrapingData", async (req, res) => {
    //   const url = 'https://en.wikipedia.org/wiki/U.S._state' 
    //   let data = await axios.get(url)
    //    let $ = await cheerio.load(data.data)
    //    $(
    //     "#mw-content-text > div.mw-parser-output > div.div-col"
    //   ).each((i, e) => {
    //     state.push($(e).text().trim());
    //   });
    //    console.log($);
    //    res.send(state)
    // })

  app.get("/scrapingData", async (req, res) => {
  const URL = 'https://www.amazon.com/s?k=gaming+apparel&pd_rd_r=20c3970d-ed11-4449-84a6-93aa027cc572&pd_rd_w=r7aie&pd_rd_wg=6KWcf&pf_rd_p=09483392-9ac6-434a-a3d7-39d83662f54a&pf_rd_r=Y48JWRX17EH9C9GRWDDC&ref=pd_gw_unk'
  let product = []

  axios(URL)
    .then(response => {
      const htmlData = response.data
      const $ = cheerio.load(htmlData)

      // $(
      //   "#root > div > div.ant-row.main--pIV2h > div:nth-child(1) > div > div.ant-col-20.ant-col-push-4.side-right--Tyehf > div.box--ujueT > div:nth-child(1) > div > div > div.info--ifj7U > div.title--wFj93"
      // ).each((i, e) => {
      //   product.push($(e).text().trim());
      // });


      $('.s-widget-container>div>div', htmlData).each((index, element) => {
        const title = $(element).find('.title--wFj93').text()
        console.log(title);
        const titleURL = $(element).find('.title--wFj93').attr('href')
        product.push({
          title: title.trim(),
          titleURL
        })
      })
      res.send(product) // Move res.send() inside the .then() block
    })
    .catch(error => {
      console.error(error)
      res.status(500).send('Internal server error') // handle errors
    })
})



  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", async (req, res) => {
  res.send("Mobile Mart server is running");
});
app.listen(port, () => console.log(`Mobile Mart Running on Port ${port}`));
