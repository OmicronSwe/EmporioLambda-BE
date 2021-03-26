import { ProductForCartDB } from '../product/interface';

export interface OrderDB {
  readonly id: string;
  readonly email: string;
  readonly username: string;
  readonly products: Array<ProductForCartDB>;
  readonly totalPrice: number;
  readonly taxesApplied: number;
  readonly date: string;
}
