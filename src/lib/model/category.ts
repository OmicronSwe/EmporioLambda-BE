class Category {
  name: string;

  constructor(body) {
    if (!body.name) {
      throw Error('name value not found');
    }

    this.name = body.name;
  }

  public getData(): object {
    return {
      name: this.name,
    };
  }

  public getName(): string {
    return this.name;
  }
}

export default Category;
