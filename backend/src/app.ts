import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import routes from './routes';
import cors from 'cors';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);

async function start() {
  try {
    const mongo_uri: string | any = process.env.MONGO_URI;
    await mongoose.connect(mongo_uri);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
}
start();
