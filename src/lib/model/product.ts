import { v4 as uuid } from 'uuid';

class Product {
  id: string;
  name: string;
  description: string;
  imageURL: string;
  price: number;
  category: Array<string>;

  constructor(body) {
    if (!body.name) {
      throw Error('name value not found');
    }
    if (!body.description) {
      throw Error('description value not found');
    }

    this.id = uuid();
    this.name = body.name;
    this.description = body.description;
    this.price = body.price ? body.price : 0;
    this.imageURL = body.image ? body.image : null;
    this.category = body.category ? body.category : [];
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
}

export default Product;
