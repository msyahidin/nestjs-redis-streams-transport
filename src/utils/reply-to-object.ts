import { parseJson } from './parse-json';

export const replyToObject = (reply: any): any => {
  // The reply might be a string or a buffer if this is called in a transaction (multi)
  if (reply.length === 0 || !(reply instanceof Array)) {
    return null;
  }
  const obj = {};
  for (let i = 0; i < reply.length; i += 2) {
    obj[reply[i].toString('binary')] = parseJson(reply[i + 1]) || reply[i + 1];
  }
  return obj;
};
