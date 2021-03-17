export const decodeURI = (URI: string) =>
  '{"' +
  decodeURIComponent(URI)
    .replace('search?', '')
    .replace(/"/g, '\\"')
    .replace(/&/g, '","')
    .replace(/=/g, '":"') +
  '"}';
