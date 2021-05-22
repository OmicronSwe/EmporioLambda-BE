import { ProductDB } from "../product/interface";
import Product from "../product/product";
import { CartDB, CartProductForCheckout } from "./interface";

class Cart {
  private username: string;

  private products: Map<Product, number>;

  private totalPrice: number;

  private taxesApplied: number;

  constructor(data: CartDB) {
    if (!data.username) {
      throw Error("username value not found");
    }

    // console.log(data);

    this.products = new Map<Product, number>();
    this.taxesApplied = data.taxesApplied ? data.taxesApplied : 0;
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

  public getUsername(): string {
    return this.username;
  }

  public getProducts(): Map<Product, number> {
    return this.products;
  }

  public getTotalPrice(): number {
    return Math.round(this.totalPrice * 100) / 100;
  }

  public getTaxesApplied(): number {
    return this.taxesApplied;
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
      totalPrice: this.getTotalPrice(),
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
      if (productList[i].getId() == id) {
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
      const productDb: ProductDB = {
        id: element.getId(),
        name: element.getName(),
        description: element.getDescription(),
        imageUrl: element.getImageUrl(),
        price: element.getPrice(),
        category: element.getCategory(),
      };

      const prod = new Product(productDb);
      this.updateTotalPrice(prod.getPrice() * this.products.get(element));
    });
  }

  private updateTotalPrice(price: number) {
    this.totalPrice += price + this.priceWithTaxes(price);

    if (this.totalPrice < 0) {
      this.totalPrice = 0;
    }
  }

  public removeProductTotally(product: Product) {
    this.updateTotalPrice(-(product.getPrice() * this.products.get(product)));
    // manage taxes TO-DO
    this.products.delete(product);
  }

  public removeProductByQuantity(product: Product, quantity: number = 1) {
    if (this.products.get(product) - quantity > 0) {
      this.updateTotalPrice(-(product.getPrice() * quantity));
      // manage taxes TO-DO
      this.products.set(product, this.products.get(product) - quantity);
    } else {
      this.removeProductTotally(product);
    }
  }

  public addProduct(product: Product, quantity: number = 1) {
    const prod = this.getProductFromId(product.getId());

    if (prod) {
      this.products.set(prod, quantity + this.products.get(prod));
    } else {
      this.products.set(product, quantity);
    }

    this.updateTotalPrice(product.getPrice() * quantity);
  }

  public getProductsInfoCheckout(): Array<CartProductForCheckout> {
    const lineItems: Array<CartProductForCheckout> =
      new Array<CartProductForCheckout>();

    this.getProductsList().forEach((element) => {
      const prodCheckout = {
        name: element.getName(),
        description: element.getDescription(),
        images: [element.getImageUrl()],
        amount: Math.round(
          (this.priceWithTaxes(element.getPrice()) + element.getPrice()) * 100
        ),
        currency: "EUR",
        quantity: this.getProductQuantity(element),
      };

      lineItems.push(prodCheckout);
    });

    return lineItems;
  }
}

export default Cart;
