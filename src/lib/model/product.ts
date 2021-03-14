import { v4 as uuid } from 'uuid';

class Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: Array<string>;

  constructor(body) {
    this.id = uuid();

    if (!body.name) {
      throw Error('name value not found');
    }
    if (!body.description) {
      throw Error('description value not found');
    }

    this.name = body.name;
    this.description = body.description;
    this.image = body.image ? body.image : null;
    this.price = body.price ? body.price : 0;
    this.category = body.category ? body.category : [];
  }

  public getData(): object {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      image: this.image,
      price: this.price,
      category: this.category,
    };
  }
}

export default Product;
