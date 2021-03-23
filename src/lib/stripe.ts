'use strict';
const https = require('https');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  httpAgent: new https.Agent({ keepAlive: false }),
});

const Stripe = {
  charge: async (token: string, amount: number, currency: string = 'EUR') => {
    return stripe.charges
      .create({
        // Create Stripe charge with token
        amount,
        currency,
        description: 'Serverless Stripe Test charge',
        source: token,
      })
      .then((charge) => {
        // Success response
        return charge;
      })
      .catch((err) => {
        // Error response
        throw Error('Error in Stripe service' + err);
      });
  },
};

export default Stripe;
