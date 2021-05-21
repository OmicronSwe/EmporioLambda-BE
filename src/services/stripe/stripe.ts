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
    emailCustomer: string,
    username: string
  ): Promise<string> => {
    const params = {
      name: nameCustomer,
      email: emailCustomer,
      description: username,
    };

    return stripe.customers
      .create(params)
      .then((data) => {
        return data.id;
      })
      .catch((err) => {
        throw Error(`Error in Stripe createCustomer: ${err}`);
      });
  },

  getCustomerByEmail: (emailCustomer: string): Promise<string> => {
    const params = {
      email: emailCustomer,
    };

    return stripe.customers
      .list(params)
      .then((data) => {
        console.log(data); // eslint-disable-line no-console
        if (data.length > 0) return data[0].id;
        return "";
      })
      .catch((err) => {
        throw Error(`Error in Stripe getCustomerByEmail: ${err}`);
      });
  },
};

export default Stripe;
