const express = require("express");
const { Queue, QueueEvents, Job } = require("bullmq");
const app = express();
const port = 3000;

app.use(express.json());

const verifyUser = new Queue("verifyUser-Queue");
const sendmailQueue = new Queue("sendmail-Queue");
const verificationusereventsqueue = new QueueEvents("verifyUser-Queue");

const checkuserverification = (jobId) => {
  return new Promise((res, rej) => {
    verificationusereventsqueue.on(
      "completed",
      async ({ jobId: completedjobid, returnvalue }) => {
        if (jobId === completedjobid) {
          const job = await Job.fromId(verifyUser, jobId);
          if (job && job.returnvalue) {
            const { isvaliduser, userData } = job.returnvalue;
            res({ isvaliduser, userData });
          } else {
            rej(new Error("Job result not found"));
          }
        }
      }
    );
    verificationusereventsqueue.on(
      "failed",
      ({ jobId: failedjobid, failedReason }) => {
        if (jobId === failedjobid) {
          rej(new Error(failedReason));
        }
      }
    );
  });
};

app.post("/order", async (req, res) => {
  try {
    const { OrderId, OrderName, Price, UserId } = req.body;

    const checkuser = await verifyUser.add("verify_user", { UserId });

    let { isvaliduser, userData } = await checkuserverification(checkuser.id);
    if (!isvaliduser) {
      return res.status(400).send({
        message: "user verification failed",
      });
    }

    //  think order saved in db

    const mailjob = await sendmailQueue.add("send_mail", {
      from: "apnicompany@gmail.com",
      to: userData,
      subject: "order confirmation",
      body: "thank you for your order",
    });
    return res.status(200).send({
      message: "user verification successful",
      mailjob: mailjob.id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal server error",
    });
  }
});
app.listen(port, () => {
  console.log(`Order_Server http://localhost:${port}`);
});
