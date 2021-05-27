/** function that decode URI passed by front-end
 * @param  {string} URI: URI passed by front-end
 */
export const decodeURI = (URI: string) =>
  `{"${decodeURIComponent(URI)
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"')}"}`;
