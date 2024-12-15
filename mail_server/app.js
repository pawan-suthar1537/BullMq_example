const express = require("express");
const { Worker } = require("bullmq");
const app = express();
const port = 3002;

app.use(express.json());

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendmail = async (from, to, subject, body) => {
  await delay(1000);
  console.log(
    `Mail sent to ${to} from ${from} with subject "${subject}" and body "${body}"`
  );
};

const sendemailWorker = new Worker(
  "sendmail-Queue",
  async (job) => {
    const { from, to, subject, body } = job.data;
    console.log(`Job received with ID: ${job.id}`);
    await sendmail(from, to, subject, body);
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  }
);

app.listen(port, () => {
  console.log(`Mail server running at http://localhost:${port}`);
});
