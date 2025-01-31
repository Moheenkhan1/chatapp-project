const { createServer } = require("http");const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/user.routes');
const homeRoutes = require('./routes/home.routes');
const messagesRoutes = require('./routes/messages.routes');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');

dotenv.config();  

const app = express();

const server = createServer(app);
const io = new Server(server,{
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// socket connection

io.on('connection', (socket) => {
  
  console.log('what is socket', socket);
  console.log('Connected to socket');

  socket.on('chat', (payload) => {
    console.log('what is payload', payload);
    io.emit('chat', payload);
  });

});


app.use(express.json());
app.use(cookieParser());
app.options('*', cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));


app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));


app.use('/user', userRoutes);
app.use('/home', homeRoutes);
app.use('/messages', messagesRoutes);


app.get('/protected', (req, res) => {
  res.status(200).json({ message: 'This is a protected route' });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
