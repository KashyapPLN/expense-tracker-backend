import express, { response } from "express";
import { MongoClient } from "mongodb";
import cors from 'cors';
import dotenv from "dotenv";
import bodyParser from 'body-parser';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { expenseRouter } from "./expenseRoutes.js";
const app = express();
const port = 4000;
app.use(cors());
dotenv.config();
app.use(bodyParser.json());
const MONGO_URL = process.env.MONGO_URL;


async function createConnection() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  console.log("Mongo is connected");
  return client;
}

export const client = await createConnection();


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/signup', async (req, res) => {
    console.log(req.body);
    const { emailId, password } = req.body;
    console.log(req.body);
    if (!emailId || !password) {
      return res.status(400).send({"msg":'Username and password are required!'});
    }
  
    try {
         const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const database = client.db('expense-tracker');
      const collection = database.collection('userData');
  
      const user = { _id: emailId, password: hashedPassword };
      await collection.insertOne(user);
  
      res.status(201).send({"msg":'User signed up successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.post('/login', async (req, res) => {
    const { emailId, password } = req.body;
    
    if (!emailId || !password) {
      return res.status(400).send('Email and password are required');
    }
  
    try {
      const database = client.db('expense-tracker');
      const collection = database.collection('userData');
  
      const user = await collection.findOne({ _id: emailId });
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).send('Invalid password');
      }
  
      const token = jwt.sign({ emailId: user._id }, 'your_secret_key', { expiresIn: '1h' });
  
      res.status(200).send({msg:"Login Successful",token:token,emailId});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  app.get('/user-data/:emailId', async (req, res) => {
    const emailId = req.params.emailId;
  console.log("emai lis",emailId);
    try {
      const database = client.db('expense-tracker');
      const collection = database.collection('userData');
  
      const user = await collection.findOne({ _id: emailId });
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      res.status(200).json({
        name: user.name || '',
        age: user.age || '',
        mobile: user.mobile || '',
        dob: user.dob || '',
        gender: user.gender || ''
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  app.put('/user-data/:emailId', async (req, res) => {
    const emailId = req.params.emailId;
       const { name, age, mobile, dob, gender} = req.body;
  
    try {
      const database = client.db('expense-tracker');
      const collection = database.collection('userData');
  
      const updateFields = {};
      if (name) updateFields.name = name;
      if (age) updateFields.age = age;
      if (mobile) updateFields.mobile = mobile;
      if (dob) updateFields.dob = dob;
      if (gender) updateFields.gender = gender;
  
      await collection.updateOne({ _id: emailId }, { $set: updateFields });
  
      res.status(200).send({msg:'User data updated successfully'});
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });

  app.use("/expense",expenseRouter);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
