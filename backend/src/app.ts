import express from 'express';
import mongoose from 'mongoose';
import routes from './routes';
import cors from 'cors';
const PORT = process.env.PORT || 3000;

console.clear();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);

async function start() {
  try {
    await mongoose.connect('mongodb+srv://maksee1337:sjsfG8NCm0DnyrcC@cluster0.s6csa3y.mongodb.net/byte_cloud');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (e) {
    console.log(e);
  }
}

start();
