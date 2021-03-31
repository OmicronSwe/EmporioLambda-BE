import Cart from "../../model/cart/cart";

const https = require("https");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  httpAgent: new https.Agent({ keepAlive: false }),
});

const Stripe = {
  createSession: async (
    cart: Cart,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> => {
    try {
      const params = {
        payment_method_types: ["card"],
        mode: "payment",
        client_reference_id: cart.username,
        line_items: cart.getProductsInfoCheckout(),
        success_url: successUrl,
        cancel_url: cancelUrl,
      };

      const session = await stripe.checkout.sessions.create(params);

      return session.id;
    } catch (err) {
      throw Error(`Error in Stripe createSession: ${err}`);
    }
  },
};

export default Stripe;
