export const parseJson = (text: string): any | boolean => {
  if (typeof text !== 'string') {
    return false;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    return false;
  }
};
