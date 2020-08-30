const express = require("express");
const { resolve } = require("path");
const router = express.Router()


// This is your real test secret API key.
const stripe = require("stripe")("sk_test_51HJbtACi0BSLj9s10pnUJXcWKEHQMLUdWKfTct3mc9sI3w0sCXgmEJC0RAdhX4PMioSg6EIH5wFuLLeWXZ4mgwo200suKKS9qY");
router.use(express.static("."));
router.use(express.json());

const calculateOrderAmount = items => {
  // It is always without . so this is 14 dollars! Get amount always from the database!!! Not from client. 

  let total = items.reduce((acc, elem) => {
    return acc += elem.quantity * elem.price;
  }, 0)
  let newTotal = total * 100;
  return newTotal;
};

router.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "eur"
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  });
});

module.exports = router;
