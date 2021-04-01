import Product from "../product/product";
import { ProductForCheckout } from "../product/interface";
import { CreateCartRequest } from "./interface";

class Cart {
  username: string;

  products: Map<Product, number>;

  totalPrice: number;

  taxesApplied: number;

  constructor(data: CreateCartRequest) {
    if (!data.username) {
      throw Error("username value not found");
    }

    // console.log(data);

    this.products = new Map<Product, number>();
    this.taxesApplied = 20;
    this.totalPrice = 0;

    if (data.products) {
      data.products.forEach((element) => {
        const prod = new Product(element);
        const quantity = element.quantity ? element.quantity : 1;

        this.products.set(prod, quantity);
        this.updateTotalPrice(prod.getPrice() * quantity);
      });
    }

    this.username = data.username;
  }

  public toJSON(): CreateCartRequest {
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
      totalPrice: +this.totalPrice.toFixed(2),
      taxesApplied: this.taxesApplied,
    };
  }

  private priceWithTaxes(price: number): number {
    return (this.taxesApplied * price) / 100;
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

    this.totalPrice = 0;
    productsCart.forEach((element) => {
      const prod = new Product(element);
      this.updateTotalPrice(prod.getPrice() * this.products.get(element));
    });
  }

  public updateTotalPrice(price: number) {
    this.totalPrice += price + this.priceWithTaxes(price);

    if (this.totalPrice < 0) {
      this.totalPrice = 0;
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
  }

  public getProductsInfoCheckout(): Array<ProductForCheckout> {
    const lineItems: Array<ProductForCheckout> = new Array<ProductForCheckout>();

    this.getProductsList().forEach((element) => {
      const prodCheckout = {
        name: element.name,
        description: element.description,
        images: [element.imageUrl],
        amount: element.price * 100,
        currency: "EUR",
        quantity: this.getProductQuantity(element),
      };

      lineItems.push(prodCheckout);
    });

    return lineItems;
  }
}

export default Cart;
