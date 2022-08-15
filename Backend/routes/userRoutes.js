const router = require('express').Router();
const User = require('../models/User');

// Creating User
router.post('/', async(req, res)=> {
  try {
    const {name, email, password, picture} = req.body;
    const user = await User.create({name, email, password, picture});
    res.status(201).json(user);
  } 
  catch (err) {
    let msg;
     // 11000 = user already exist 
    if(err.code == 11000){
      msg = "User already exists"
    } else {
      msg = err.message;
    }
    console.log(err);
    res.status(400).json(msg)
  }
})

// login user

router.post('/login', async(req, res)=> {
  try {

    const {email, password} = req.body;
     //findByCredentials is already checking the right email and password and we are doing it in User Model
    const user = await User.findByCredentials(email, password);
    user.status = 'online';
    await user.save();
    res.status(200).json(user);
  } 
  catch (err) {
      res.status(400).json(err.message)
  }
})


module.exports = router
