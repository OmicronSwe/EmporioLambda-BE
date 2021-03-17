export const decodeURI = (URI: string) =>
  '{"' +
  decodeURIComponent(URI).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') +
  '"}';
