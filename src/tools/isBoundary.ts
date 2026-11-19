import isPunctuation from './isPunctuation';

const isBoundary = (leftChar: unknown, rightChar: unknown) =>
  isPunctuation(leftChar) && isPunctuation(rightChar);

export default isBoundary;
