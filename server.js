const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const axios = require("axios");

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));

// Basic route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const plans = [
  {
    plan_id: "P-19P88753VT527613TM3JS2EQ",
    plan_name: "standard",
    duration: "month",
  },
  {
    plan_id: "P-2UF97281J31860733M3JS6VY",
    plan_name: "standard",
    duration: "year",
  },
];

const generateAcceesToken = async () => {
  try {
    const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
    const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
    console.log({ PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET });

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw "Paypal credentials not found";
    }

    const auth = Buffer.from(
      PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET
    ).toString("base64");
    console.log({ auth });

    const url = `https://api-m.sandbox.paypal.com/v1/oauth2/token`;

    const response = await fetch(url, {
      method: "post",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

app.post("/create-subscription", async (req, res) => {
  const { plan_name, duration } = req.body;
  const plan = plans.find(
    (_plan) => _plan.duration === duration && _plan.plan_name === plan_name
  );
  if (!plan) {
    return res.status(400).json({
      message: "Plan not found",
    });
  }

  const accessToken = await generateAcceesToken();
  console.log({ accessToken });

  const url = `https://api-m.sandbox.paypal.com/v1/billing/subscriptions`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      plan_id: plan.plan_id,
      application_context: {
        user_action: "SUBSCRIBE_NOW",
      },
    }),
  });

  const data = await response.json();
  return res
    .status(200)
    .json({ paypalSubscription: data, status: data.status });
});

app.post("/save-payment", async (req, res) => {
  const { orderID, subscriptionID } = req.body;
  if (!orderID || !subscriptionID) {
    return res.status(400).json({
      message: "Order id or subscription id not found",
    });
  }
  const url = `https://api-m.sandbox.paypal.com/v1/billing/subscriptions/${subscriptionID}`;
  const accessToken = await generateAcceesToken();
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const paypalData = await response.json();
  console.log({ paypalData });
  return res.status(200).json({
    message: "Success",
    data: paypalData,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
