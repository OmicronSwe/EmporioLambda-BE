import { CreateCategoryRequest } from "./interface";

class Category {
  name: string;

  constructor(data: CreateCategoryRequest) {
    if (!data.name) {
      throw Error("name value not found");
    }

    this.name = data.name;
  }

  public toJSON(): CreateCategoryRequest {
    return {
      name: this.name,
    };
  }

  public getName(): string {
    return this.name;
  }
}

export default Category;
