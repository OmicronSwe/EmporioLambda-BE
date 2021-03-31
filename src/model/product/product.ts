import { v4 as uuid } from "uuid";
import { ProductDB } from "./interface";

class Product {
  id: string;

  name: string;

  description: string;

  imageUrl: string;

  price: number;

  category: string;

  constructor(data: ProductDB) {
    if (!data.name) {
      throw Error("name value not found");
    }
    if (!data.description) {
      throw Error("description value not found");
    }

    this.id = data.id ? data.id : uuid();
    this.name = data.name;
    this.description = data.description;
    this.price = data.price ? data.price : 0;
    this.imageUrl = data.imageUrl;
    this.category = data.category;
  }

  public toJSON(): ProductDB {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      imageUrl: this.imageUrl,
      price: this.price,
      category: this.category,
    };
  }

  public getPrice(): number {
    return this.price;
  }

  public getCategory(): string {
    return this.category;
  }

  public isDifference(prod: Product): boolean {
    if (
      this.price != prod.price ||
      this.id != prod.id ||
      this.imageUrl != prod.imageUrl ||
      this.category != prod.category ||
      this.description != prod.description ||
      this.name != prod.name
    ) {
      return true;
    }

    return false;
  }
}

export default Product;
