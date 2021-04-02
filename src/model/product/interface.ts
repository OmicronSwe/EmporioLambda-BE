export interface CreateProductRequest {
  readonly name: string;
  readonly description: string;
  readonly imageFile: ImageFile;
  readonly price: number;
  readonly category?: string;
}

export interface ProductDB {
  readonly id?: string
  readonly name: string;
  readonly description: string;
  imageUrl?: string;
  readonly price?: number;
  readonly category?: string;
}

export interface UpdateProductRequest {
  readonly name?: string;
  readonly description?: string;
  readonly imageFile?: ImageFile;
  readonly price?: number;
  readonly category?: string;
}

export interface UpdateProductDB {
  readonly name?: string;
  readonly description?: string;
  imageUrl?: string;
  readonly price?: number;
  readonly category?: string;
}

export interface SearchProductRequest {
  readonly name?: string;
  readonly category?: string;
  readonly minprice?: string;
  readonly maxprice?: string;
  readonly limit?: number;
  lastEvaluatedKey?;
}

interface ImageFile {
  readonly imageCode: string;
  readonly mime: string;
}
