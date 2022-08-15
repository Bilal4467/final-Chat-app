const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes')
const User = require('./models/User');
const Message = require('./models/Message')
const rooms = ['general'];
const cors = require('cors');

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

app.use('/users', userRoutes)

//Database connection data
require('./connection')

const server = require('http').createServer(app);
const PORT = 8000;
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
})

// Get messages of that room from DB by date(Aggregate is a function in mongo db) 
async function getLastMessagesFromRoom(room){
  let roomMessages = await Message.aggregate([
    {$match: {to: room}},
    {$group: {_id: '$date', messagesByDate: {$push: '$$ROOT'}}}
  ])
  return roomMessages;
}

// Date is like this 02/11/2022
// 20220211  so first we do it by year then month then date 
// This function will sort all messages by Date from earliest messages to latest a = earliest / b = latest

function sortRoomMessagesByDate(messages){
  return messages.sort(function(a, b){
    let date1 = a._id.split('/');
    let date2 = b._id.split('/');

    date1 = date1[2] + date1[0] + date1[1]
    date2 =  date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1
  })
}

// socket connection
// this will go in frontend Sidebar

io.on('connection', (socket)=> {

  socket.on('new-user', async ()=> {
    const members = await User.find();
     // io.emit means we will emit to all the users whereas if we use socket.io it will emit to that specific user
    io.emit('new-user', members)
  })

  // Join room by Default (join-room is an event)
  // previousRoom parameter is used when we have more than one room but in our case we only have 1 room so it does not matter much
  socket.on('join-room', async(newRoom, previousRoom)=> {
    socket.join(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom);
    roomMessages = sortRoomMessagesByDate(roomMessages);
      // room-messages is event and in frontend we listen for this event
    socket.emit('room-messages', roomMessages)
  })

    // Things on frontend will happen in MessageForm  
  socket.on('message-room', async(room, content, sender, time, date) => {
     // console.log('new-messages', content );  We'll receive the message from the user
    const newMessage = await Message.create({content, from: sender, time, date, to: room});
    
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    // sending message to room
    io.to(room).emit('room-messages', roomMessages);
     // User that are not in the room get notification
    socket.broadcast.emit('notifications', room)
  })

  //Still using socket 
  //Logout will happen in Navigation in Frontend
  // Once we logout in we can see in featurs/userSlice we return null in frontend 
  app.delete('/logout', async(req, res)=> {
    try {
      
      const {_id, newMessages} = req.body;
      const user = await User.findById(_id);
      user.status = "offline";
       // This coming from frontend so we need to save that state
      user.newMessages = newMessages;
      await user.save();
      const members = await User.find();
      // So we emit it to other users the updated members (after logging out)  
      socket.broadcast.emit('new-user', members);
      res.status(200).send();

    } 
    catch (err) {
      console.log(err);
      res.status(400).send()
    }
  })

})


app.get('/rooms', (req, res)=> {
  res.json(rooms)
})


server.listen(PORT, ()=> {
  console.log('listening to port', PORT)
})
