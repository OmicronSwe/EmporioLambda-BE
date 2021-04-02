import { CategoryDB } from "./interface";

class Category {
  name: string;

  constructor(data: CategoryDB) {
    if (!data.name) {
      throw Error("name value not found");
    }

    this.name = data.name;
  }

  public toJSON(): CategoryDB {
    return {
      name: this.name,
    };
  }

  public getName(): string {
    return this.name;
  }
}

export default Category;
