// SERVER CONFIG FILES

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// HANDLING UNCAUGHT EXCEPTION...
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

// DATABASE CONNECTION CONFIG...
const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);
mongoose
  .connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((con) => console.log('DB Connection Successful!'))
  .catch((err) => console.log('ERROR', err.message));

// SERVER LISTENER
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server started in PORT: ${PORT}`)
);

// HANDLING UNHANDLED PROMISE REJECTION...
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
