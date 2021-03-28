class Category {
  name: string;

  constructor(data) {
    if (!data.name) {
      throw Error("name value not found");
    }

    this.name = data.name;
  }

  public toJSON(): object {
    return {
      name: this.name,
    };
  }

  public getName(): string {
    return this.name;
  }
}

export default Category;
