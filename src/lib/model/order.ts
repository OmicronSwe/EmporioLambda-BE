import { v4 as uuid } from 'uuid';
import Product from './product';

class Order {
  id: string;
  email: string;
  products: Map<Product,number>;
  totalPrice: number;
  taxesApplied: number;
  date: Date;

  constructor(body) {
    if (!body.email) {
      throw Error('email value not found');
    }
    if (!body.products) {
      throw Error('products list not found');
    }

    console.log(body);

    
    this.products= new Map<Product,number>();
    this.taxesApplied=0;
    this.totalPrice=0;

    body.products.forEach(element => {
        const prod=new Product(element);
        this.products.set(prod,element.quantity);
        this.totalPrice+=prod.getPrice()*element.quantity;

        //manage taxes TO-DO
    });

    this.id = uuid();
    this.email = body.email;
    this.date=new Date();
  }

  public getData(): object {
    return {
      id: this.id,
      email: this.email,
      product: this.products,
      totalPrice: this.totalPrice,
      taxesApplied: this.taxesApplied,
      date: this.date,
    };
  }
}

export default Order;