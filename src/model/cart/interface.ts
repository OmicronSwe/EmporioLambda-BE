export interface CartDB {
  username: string;
  readonly products: Array<ProductForCartDB>;
  readonly totalPrice?: number;
  readonly taxesApplied?: number;
}

export interface UpdateProductInCartRequest {
  readonly id: string;
  readonly quantity: number;
}

interface ProductForCartDB {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly price: number;
  readonly category: string;
  readonly quantity: number;
}
