import Product from '../../lib/model/product';

export const HMTLTemplate = (
  productList: Map<Product, number>,
  totalPrice: number,
  nameCustomer: string
): string => {
  let html: string =
    `<h1>Hi ` +
    nameCustomer +
    `,</h1><h2>this is your order</h2><br>
  <table style="text-align: center;width: 80%;border-spacing: 0 1em;">
    <tr>
      <th></th>
      <th>Product</th>
      <th>Price</th>
      <th>Quantity</th>
    </tr>`;

  productList.forEach((value: number, key: Product) => {
    html +=
      `<tr><td width="30%"><img width="100%" src="` +
      key.imageUrl +
      `" alt="` +
      key.name +
      `" /></td>
    <td><p>` +
      key.name +
      `</p></td>
    <td><p>` +
      key.price +
      ` EUR</p></td>
    <td><p>` +
      value +
      `</p></td></tr>`;
  });
  html += '</table><br><h2>Total price: ' + totalPrice + ' EUR</h2>';

  return html;
};

export const TXTTemplate = (
  productList: Map<Product, number>,
  totalPrice: number,
  nameCustomer: string
): string => {
  let text: string = 'Hi ' + nameCustomer + ', this is your order:\n\n';

  productList.forEach((value: number, key: Product) => {
    text +=
      '- Product: ' + key.name + ' | Price: ' + key.price + ' EUR | Quantity: ' + value + '\n';
  });
  text += '\nTotal price: ' + totalPrice + ' EUR';

  return text;
};
