import { v4 as uuid } from 'uuid';

class Product {
  id: string;
  name: string;
  description: string;
  imageURL: string;
  price: number;
  category: string;

  constructor(body) {
    if (!body.name) {
      throw Error('name value not found');
    }
    if (!body.description) {
      throw Error('description value not found');
    }

    this.id = body.id ? body.id : uuid();
    this.name = body.name;
    this.description = body.description;
    this.price = body.price ? body.price : 0;
    this.imageURL = body.image ? body.image : null;
    this.category = body.category ? body.category : null;
  }

  public getData(): object {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      image: this.imageURL,
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
      this.imageURL != prod.imageURL ||
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
