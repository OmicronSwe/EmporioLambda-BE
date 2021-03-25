'use strict';

import Cart from '../lib/model/cart';

const https = require('https');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY, {
  httpAgent: new https.Agent({ keepAlive: false }),
});

const Stripe = {
  createSession: async (cart: Cart, successUrl: string, cancelUrl: string): Promise<string> => {
    try {
      const params = {
        payment_method_types: ['card'],
        mode: 'payment',
        client_reference_id: cart.username,
        line_items: cart.getProductsInfoCheckout(),
        success_url: successUrl,
        cancel_url: cancelUrl,
      };

      const session = await stripe.checkout.sessions.create(params);

      return session.id;
    } catch (err) {
      throw Error('Error in Stripe createSession: ' + err);
    }
  },

  retrieveDataCheckout: async (idSessionStripe: string) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(idSessionStripe, {
        expand: ['line_items'],
      });

      return session;
    } catch (err) {
      throw Error('Error in Stripe retrieveDataCheckout: ' + err);
    }
  },

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
