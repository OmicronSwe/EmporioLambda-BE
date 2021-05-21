import Cart from "../../model/cart/cart";

const https = require("https");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  httpAgent: new https.Agent({ keepAlive: false }),
});

const Stripe = {
  createSession: (
    cart: Cart,
    customerId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> => {
    const params = {
      customer: customerId,
      payment_method_types: ["card"],
      mode: "payment",
      client_reference_id: cart.getUsername(),
      line_items: cart.getProductsInfoCheckout(),
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    return stripe.checkout.sessions
      .create(params)
      .then((data) => {
        return data.id;
      })
      .catch((err) => {
        throw Error(`Error in Stripe createSession: ${err}`);
      });
  },

  createCustomer: (
    nameCustomer: string,
    emailCustomer: string
  ): Promise<string> => {
    const params = {
      name: nameCustomer,
      email: emailCustomer,
    };

    return stripe.customers.create
      .create(params)
      .then((data) => {
        return data.id;
      })
      .catch((err) => {
        throw Error(`Error in Stripe createCustomer: ${err}`);
      });
  },
};

export default Stripe;
