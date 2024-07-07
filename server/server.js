import express from "express";
import mongoose from "mongoose";
import bodyParser from 'body-parser';
import 'dotenv/config'
import cors from "cors";

import admin from "firebase-admin";
import serviceAccountKey from "./blogging-website-using-mern-firebase-adminsdk-ugmk0-8d6639e6be.json" assert { type: "json" };

import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';


const server = express();
let PORT = 3000;

server.use(express.json());
server.use(cors());
server.use(bodyParser.json({ limit: '50mb' }));
server.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

admin.initializeApp({ // firstly generate new prviate key from firebase project settings and place the downloaded file in the server folder
    credential: admin.credential.cert(serviceAccountKey)
});

mongoose.connect(process.env.DB_LOCATION, {
    autoIndex: true
});


server.use('/', authRoutes);
server.use('/', blogRoutes);
server.use('/', commentRoutes);
server.use('/', notificationRoutes);
server.use('/', userRoutes);


server.listen(PORT, () => {
    console.log("listening on port: " + PORT);
});