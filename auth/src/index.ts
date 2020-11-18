import mongoose, { mongo } from 'mongoose';
import { app } from './app';
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT value not found');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined');
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to db');
  } catch (err) {
    console.error(err.message);
  }
};

start();

app.listen(3000, () => {
  console.log(`auth listening on port 3000 🌞 🌞 🌞`);
});
