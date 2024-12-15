const express = require("express");
const { Queue, Worker } = require("bullmq");
const app = express();
const port = 3001;

app.use(express.json());

const userDB = [
  {
    id: 1,
    name: "pawan",
    password: "1234",
    email: "pawan@gmail.com",
  },
];

const verificationWorker = new Worker(
  "verifyUser-Queue",
  (job) => {
    const UserId = job.data.UserId;
    console.log(
      `job rec with userid: ${UserId} and job in bullmq is: ${job.id}`
    );

    const isvaliduser = userDB.some((user) => user.id === UserId);
    console.log(`user is: ${isvaliduser}`);
    return { isvaliduser, userData: userDB[0].email };
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  }
);

app.listen(port, () => {
  console.log(`user_Server http://localhost:${port}`);
});
