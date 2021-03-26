import { ProductForCartDB } from '../product/interface';

export interface CartDB {
  username: string;
  readonly products: Array<ProductForCartDB>;
  readonly totalPrice?: number;
  readonly taxesApplied?: number;
}
