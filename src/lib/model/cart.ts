import Product from './product';

class Cart {
  email: string;
  products: Map<Product, number>;
  totalPrice: number;
  taxesApplied: number;

  constructor(body) {
    if (!body.email) {
      throw Error('email value not found');
    }
    if (!body.products) {
      throw Error('products list not found');
    }

    //console.log(body);

    this.products = new Map<Product, number>();
    this.taxesApplied = 0;
    this.totalPrice = 0;

    body.products.forEach((element) => {
      const prod = new Product(element);
      this.products.set(prod, element.quantity);
      this.totalPrice += prod.getPrice() * element.quantity;

      //manage taxes TO-DO
    });

    this.email = body.email;
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
      email: this.email,
      products: productOrderArray,
      totalPrice: this.totalPrice,
      taxesApplied: this.taxesApplied,
    };
  }
}

export default Cart;
