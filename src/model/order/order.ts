import { v4 as uuid } from "uuid";
import Product from "../product/product";
import Cart from "../cart/cart";
import { OrderDB, ProductForOrderDB } from "./interface";

class Order {
  private id: string;

  private username: string;

  private email: string;

  private products: Map<Product, number>;

  private totalPrice: number;

  private taxesApplied: number;

  private date: Date;

  constructor(cart: Cart, email: string) {
    if (!email) {
      throw Error("email value not found");
    }

    if (cart.getProducts().size <= 0) {
      throw Error("products list not found");
    }

    this.products = cart.getProducts();
    this.taxesApplied = cart.getTaxesApplied();
    this.totalPrice = cart.getTotalPrice();
    this.id = uuid();
    this.email = email;
    this.username = cart.getUsername();
    this.date = new Date();
  }

  public toJSON(): OrderDB {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      products: this.getProductsInfoOrder(),
      totalPrice: this.totalPrice,
      taxesApplied: this.taxesApplied,
      date: this.date.toISOString(),
    };
  }

  public getProductsInfoOrder(): Array<ProductForOrderDB> {
    const productsOrder = Array.from(this.products.keys());
    let productsOrderObject;
    const productOrderArray = [];

    productsOrder.forEach((element) => {
      productsOrderObject = element.toJSON();
      productsOrderObject.quantity = this.products.get(element);
      productOrderArray.push(productsOrderObject);
    });

    return productOrderArray;
  }
}

export default Order;
