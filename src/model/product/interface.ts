export interface ProductDB {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly price: number;
  readonly category: string;
}

export interface ProductForCartDB {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly price: number;
  readonly category: string;
  readonly quantity: number;
}

export interface ProductRequest {
  readonly name: string;
  readonly description: string;
  readonly imageFile: ImageFile;
  readonly price: number;
  readonly category?: string;
}

interface ImageFile {
  readonly imageCode: string;
  readonly mime: string;
}

export interface ProductToCartRequest {
  readonly id: string;
  readonly quantity: number;
}

export interface ProductForCheckout {
  readonly name: string;
  readonly description: string;
  readonly images: Array<string>;
  readonly amount: number;
  readonly currency: string;
  readonly quantity: number;
}
