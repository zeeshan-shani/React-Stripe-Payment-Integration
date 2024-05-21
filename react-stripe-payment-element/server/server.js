const express = require("express");
const app = express();
const { resolve } = require("path");
const env = require("dotenv").config({ path: "./.env" }); // Ensure the path is correct

if (env.error) {
  throw env.error;
}

// Print all environment variables
console.log("Environment variables:", process.env);

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-08-01",
});

// Debug line to check if STATIC_DIR is set correctly
console.log("Static directory:", process.env.STATIC_DIR);

if (!process.env.STATIC_DIR) {
  throw new Error("STATIC_DIR is not defined in the environment variables");
}

app.use(express.static(resolve(__dirname, process.env.STATIC_DIR)));

app.get("/", (req, res) => {
  const path = resolve(__dirname, process.env.STATIC_DIR + "/index.html");
  res.sendFile(path);
});

app.get("/config", (req, res) => {
  res.send({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

app.post("/create-payment-intent", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "EUR",
      amount: 1999,
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (e) {
    return res.status(400).send({
      error: {
        message: e.message,
      },
    });
  }
});

app.listen(5252, () =>
  console.log(`Node server listening at http://localhost:5252`)
);
