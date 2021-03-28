import Product from "../product/product";
import { ProductsForCheckout } from "../product/interface";
import { CartDB } from "./interface";

class Cart {
  username: string;

  products: Map<Product, number>;

  totalPrice: number;

  taxesApplied: number;

  constructor(data: CartDB) {
    if (!data.username) {
      throw Error("username value not found");
    }

    // console.log(data);

    this.products = new Map<Product, number>();
    this.taxesApplied = 0;
    this.totalPrice = 0;

    if (data.products) {
      data.products.forEach((element) => {
        const prod = new Product(element);
        const quantity = element.quantity ? element.quantity : 1;

        this.products.set(prod, quantity);
        this.totalPrice += prod.getPrice() * quantity;

        // manage taxes TO-DO
      });
    }

    this.totalPrice += this.taxesApplied;
    this.username = data.username;
  }

  public toJSON(): CartDB {
    const productsCart = this.getProductsList();
    let productsCartObject;
    const productCartArray = [];

    productsCart.forEach((element) => {
      productsCartObject = element.toJSON();
      productsCartObject.quantity = this.products.get(element);
      productCartArray.push(productsCartObject);
    });

    return {
      username: this.username,
      products: productCartArray,
      totalPrice: this.totalPrice,
      taxesApplied: this.taxesApplied,
    };
  }

  public getProductsList(): Array<Product> {
    return Array.from(this.products.keys());
  }

  public getProductFromId(id: string): Product {
    const productList: Array<Product> = this.getProductsList();
    for (let i = 0; i < productList.length; i++) {
      if (productList[i].id == id) {
        return productList[i];
      }
    }

    return null;
  }

  public getProductQuantity(product: Product): number {
    return this.products.get(product);
  }

  public updateProduct(oldProduct: Product, newProduct: Product) {
    const quantity: number = this.products.get(oldProduct);
    this.products.delete(oldProduct);
    this.products.set(newProduct, quantity);

    const productsCart = this.getProductsList();

    this.taxesApplied = 0;
    this.totalPrice = 0;
    productsCart.forEach((element) => {
      const prod = new Product(element);
      this.totalPrice += prod.getPrice() * this.products.get(element);
      // manage taxes TO-DO
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
    // manage taxes TO-DO
    this.products.delete(product);
  }

  public removeProductByQuantity(product: Product, quantity: number = 1) {
    if (this.products.get(product) - quantity > 0) {
      this.updateTotalPrice(-(product.price * quantity));
      // manage taxes TO-DO
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
    // manage taxes TO-DO
  }

  public getProductsInfoCheckout(): Array<ProductsForCheckout> {
    const lineItems: Array<ProductsForCheckout> = new Array<ProductsForCheckout>();

    this.getProductsList().forEach((element) => {
      const prodCheckout = {
        name: element.name,
        description: element.description,
        images: [element.imageUrl],
        amount: element.price,
        currency: "EUR",
        quantity: this.getProductQuantity(element),
      };

      lineItems.push(prodCheckout);
    });

    return lineItems;
  }
}

export default Cart;
