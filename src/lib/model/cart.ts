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

    //console.log(body);

    this.products = new Map<Product, number>();
    this.taxesApplied = 0;
    this.totalPrice = 0;

    if (body.products) {
      body.products.forEach((element) => {
        const prod = new Product(element);
        const quantity = element.quantity ? element.quantity : 1;

        this.products.set(prod, quantity);
        this.totalPrice += prod.getPrice() * quantity;

        //manage taxes TO-DO
      });
    }

    this.email = body.email;
  }

  public getData(): object {
    let productsCart = Array.from(this.products.keys());
    let productsCartObject;
    let productCartArray = [];

    productsCart.forEach((element) => {
      productsCartObject = element.getData();
      productsCartObject.quantity = this.products.get(element);
      productCartArray.push(productsCartObject);
    });

    return {
      email: this.email,
      products: productCartArray,
      totalPrice: this.totalPrice,
      taxesApplied: this.taxesApplied,
    };
  }

  public getProducts(): Array<Product> {
    return Array.from(this.products.keys());
  }

  public getProductFromId(id: string): Product {
    for (const element of Array.from(this.products.keys())) {
      if (element.id == id) {
        return element;
      }
    }

    return null;
  }

  public updateProduct(oldProduct: Product, newProduct: Product) {
    let quantity: number = this.products.get(oldProduct);
    this.products.delete(oldProduct);
    this.products.set(newProduct, quantity);

    let productsCart = Array.from(this.products.keys());

    this.taxesApplied = 0;
    this.totalPrice = 0;
    productsCart.forEach((element) => {
      const prod = new Product(element);
      this.totalPrice += prod.getPrice() * this.products.get(element);
      //manage taxes TO-DO
    });
  }

  public removeProductTotally(product: Product) {
    this.products.delete(product);
  }

  public removeProductByQuantity(product: Product, quantity: number = 1) {
    if (this.products.get(product) - quantity > 0)
      this.products.set(product, this.products.get(product) - quantity);
    else {
      this.removeProductTotally(product);
    }
  }

  public addProduct(product: Product, quantity: number = 1) {
    if (this.products.has(product)) {
      this.products.set(product, quantity + this.products.get(product));
    } else {
      this.products.set(product, quantity);
    }
  }
}

export default Cart;
