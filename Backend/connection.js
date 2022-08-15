const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(`mongodb+srv://Ahmad:mongodb15@cluster0.tf6bj.mongodb.net/testing-app?retryWrites=true&w=majority`, ()=> {
  console.log('Connection to MongoDB successful')
})
