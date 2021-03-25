import { v4 as uuid } from 'uuid';

class Product {
  id: string;
  name: string;
  description: string;
  imageURL: string;
  price: number;
  category: string;

  constructor(data) {
    if (!data.name) {
      throw Error('name value not found');
    }
    if (!data.description) {
      throw Error('description value not found');
    }

    this.id = data.id ? data.id : uuid();
    this.name = data.name;
    this.description = data.description;
    this.price = data.price ? data.price : 0;
    this.imageURL = data.imageUrl ? data.imageUrl : null;
    this.category = data.category ? data.category : null;
  }

  public toJSON(): object {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      imageUrl: this.imageURL,
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
