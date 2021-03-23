/**
2 * @param {Object} serverless - Serverless instance
3 * @param {Object} options - runtime options
4 * @returns {Promise<{name: string, subject: string, html: string, text}[]>}
5 */
module.exports = async (serverless, options) => [{

  
  name: 'orderTemplateEmail',
  subject: 'EmporioLambda company',
  html: `<h1>Hi {{name}}, this is your order</h1>
  <table width="100%" style="max-width:640px;">
    <tr>
      <th></th>
      <th>Product</th>
      <th>Price</th>
      <th>Quantity</th>
    </tr>
    {{#each products}}
      <tr>
        <td><img src="{{image}}" alt="{{name}}" width="100%"/></td>
        <td><p>{{name}}</p></td>
        <td><p>{{price}} EUR</p></td>
        <td><p>{{qantity}}</p></td>
      </tr>
    {{/each}}
  </table>
  <h2>Total price: {{totalPrice}}</h2>`,
  text: `Hi {{name}}, this is your order:\n\n
    {{#each products}}
      - Product: {{name}} | Price: {{price}} EUR | Quantity: {{quantity}}\n
    {{/each}}
    \nTotal price: {{totalPrice}}`,
}];