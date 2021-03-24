import { v4 as uuid } from 'uuid';
import Product from './product';
import Cart from './cart';

class Order {
  id: string;
  username: string;
  email: string;
  products: Map<Product, number>;
  totalPrice: number;
  taxesApplied: number;
  date: Date;

  constructor(cart: Cart, email: string) {
    if (!cart.username) {
      throw Error('username value not found');
    }

    if (!email) {
      throw Error('email value not found');
    }

    if (cart.products.size <= 0) {
      throw Error('products list not found');
    }

    //console.log(body);

    this.products = cart.products;
    this.taxesApplied = cart.taxesApplied;
    this.totalPrice = cart.totalPrice;
    this.id = uuid();
    this.username = cart.username;
    this.date = new Date();
  }

  public getData(): object {
    let productsOrder = Array.from(this.products.keys());
    let productsOrderObject;
    let productOrderArray = [];

    productsOrder.forEach((element) => {
      productsOrderObject = element.getData();
      productsOrderObject.quantity = this.products.get(element);
      productOrderArray.push(productsOrderObject);
    });

    return {
      id: this.id,
      username: this.username,
      products: productOrderArray,
      totalPrice: this.totalPrice,
      taxesApplied: this.taxesApplied,
      date: this.date.toISOString(),
    };
  }
}

export default Order;
