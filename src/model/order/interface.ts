export interface OrderDB {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly products: Array<ProductForOrderDB>;
  readonly totalPrice: number;
  readonly taxesApplied: number;
  readonly date: string;
}

interface ProductForOrderDB {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly price: number;
  readonly category: string;
  readonly quantity: number;
}
