/*jshint esversion: 8 */

const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const  cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(require('body-parser').urlencoded({ extended: false }));

const reviews_data = JSON.parse(fs.readFileSync("reviews.json", 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync("dealerships.json", 'utf8'));

mongoose.connect("mongodb://mongo_db:27017/",{'dbName':'dealershipsDB'});


const Reviews = require('./review');

const Dealerships = require('./dealership');

try {
  Reviews.deleteMany({}).then(()=>{
    Reviews.insertMany(reviews_data.reviews);
  });
  Dealerships.deleteMany({}).then(()=>{
    Dealerships.insertMany(dealerships_data.dealerships);
  });
  
} catch (error) {
  res.status(500).json({ error: 'Error fetching documents' });
}


// Express route to home
app.get('/', async (req, res) => {
    res.send("Welcome to the Mongoose API");
});

// Express route to fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch reviews by a particular dealer
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({dealership: req.params.id});
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching documents' });
  }
});

// Express route to fetch all dealerships
app.get('/fetchDealers', async (req, res) => {
//Write your code here
try {
    const dealerships = await Dealerships.find();
    res.json(dealerships);
} catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({ message: 'Internal server error' });
}
});

// Express route to fetch Dealers by a particular state
app.get('/fetchDealers/:state', async (req, res) => {
//Write your code here
const state = req.params.state;
try {
    const dealers = await Dealerships.find({ state: state });

    if (dealers.length > 0) {
        res.status(200).json(dealers);
    } else {
        res.status(404).json({ message: 'No dealers found for the specified state.' });
    }
} catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
}
});

// Express route to fetch dealer by a particular id
app.get('/fetchDealer/:id', async (req, res) => {
//Write your code here
const dealerId = req.params.id;
try {
    const dealer = await Dealerships.find({ id: dealerId });
    if (!dealer) {
        return res.status(404).send({ message: 'Dealer not found' });
    }
    return res.status(200).json(dealer);
} catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Server error' });
}
});

//Express route to insert review
app.post('/insert_review', express.raw({ type: '*/*' }), async (req, res) => {
  data = JSON.parse(req.body);
  const documents = await Reviews.find().sort( { id: -1 } );
  let new_id = documents[0].id + 1;

  const review = new Reviews();
	review.id = new_id;
	review.name = data['name'];
	review.dealership = data['dealership'];
	review.review = data['review'];
	review.purchase = data['purchase'];
	review.purchase_date = data['purchase_date'];
	review.car_make = data['car_make'];
	review.car_model = data['car_model'];
	review.car_year = data['car_year'];

  try {
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
		console.log(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
