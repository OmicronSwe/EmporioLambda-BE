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

    this.totalPrice += this.taxesApplied;
    this.email = body.email;
  }

  public getData(): object {
    let productsCart = this.getProducts();
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
    for (const element of this.getProducts()) {
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

    let productsCart = this.getProducts();

    this.taxesApplied = 0;
    this.totalPrice = 0;
    productsCart.forEach((element) => {
      const prod = new Product(element);
      this.totalPrice += prod.getPrice() * this.products.get(element);
      //manage taxes TO-DO
    });
  }

  public updateTotalPrice(price: number) {
    this.totalPrice += price;

    if (this.totalPrice < 0) {
      this.totalPrice = 0;
    }
  }

  public updateTaxes(price: number) {
    this.taxesApplied += price;

    if (this.taxesApplied < 0) {
      this.taxesApplied = 0;
    }
  }

  public removeProductTotally(product: Product) {
    this.updateTotalPrice(-(product.price * this.products.get(product)));
    //manage taxes TO-DO
    this.products.delete(product);
  }

  public removeProductByQuantity(product: Product, quantity: number = 1) {
    if (this.products.get(product) - quantity > 0) {
      this.updateTotalPrice(-(product.price * quantity));
      //manage taxes TO-DO
      this.products.set(product, this.products.get(product) - quantity);
    } else {
      this.removeProductTotally(product);
    }
  }

  public addProduct(product: Product, quantity: number = 1) {
    const prod = this.getProductFromId(product.id);

    if (prod) {
      this.products.set(prod, quantity + this.products.get(prod));
    } else {
      this.products.set(product, quantity);
    }

    this.updateTotalPrice(product.price * quantity);
    //manage taxes TO-DO
  }
}

export default Cart;
