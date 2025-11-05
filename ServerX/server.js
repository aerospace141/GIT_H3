const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose');
const app = express();


// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // ✅ Increased limit for large submissions
// app.use(cors({
//   origin: ['https://avacus.vercel.app', 'https://abacusz.web.app'],
//   credentials: true
// }));

app.use(cors({
  origin: ['https://avacus.vercel.app', 'https://abacusz.web.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Id']
}));

const signup = require('./Routes/user_auth/signup');
const login = require('./Routes/user_auth/login');
const index = require("./Routes/SetUp_State/index");
const verify = require('./Routes/user_auth/verify');
const setting = require('./Routes/user_auth/setting');
const settingState = require('./Routes/SetUp_State/setting');
const adminRouter  = require('./Routes/admin/admin');
const studentRouter  = require('./Routes/admin/student');

app.use('/api', signup);
app.use('/api', login);  
app.use('/api', index);  
app.use('/api', verify); 
app.use('/api', setting);
app.use('/api', settingState);

app.use('/api/admin', adminRouter);
app.use('/api/student', studentRouter);
app.use('/api', require('./Routes/SetUp_State/studentAnnouncements'));
app.use('/api/admin', require('./Routes/admin/createSTU'));


const mongoURI = process.env.MONGODB_URI || "mongodb+srv://ayush1777:agr11@cluster0.0128p.mongodb.net/abecus";

mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB using Mongoose 8.2.1'))
  .catch((err) => console.error('Connection error:', err));
  
  const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());

// Sample GET API
app.get("/",(req,res) => {
    res.status(200).send("hi, Its working.");
  })

  
// Test generation utility
app.post('/api/generate-test-questions', (req, res) => {
  const { testType, difficulty, count } = req.body;
  
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    let question, answer;
    
    switch (testType) {
      case 'multiplication':
        const a = Math.floor(Math.random() * 12) + 1;
        const b = Math.floor(Math.random() * 12) + 1;
        question = `${a} × ${b} = ?`;
        answer = (a * b).toString();
        break;
        
      case 'addition':
        const c = Math.floor(Math.random() * 100) + 1;
        const d = Math.floor(Math.random() * 100) + 1;
        question = `${c} + ${d} = ?`;
        answer = (c + d).toString();
        break;
        
      case 'mixed':
        const operations = ['addition', 'subtraction', 'multiplication'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        // Generate based on selected operation
        break;
    }
    
    questions.push({
      question,
      type: testType,
      correctAnswer: answer
    });
  }
  
  res.json({ questions });
});

// Export as a serverless function
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
