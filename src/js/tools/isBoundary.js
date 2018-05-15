import isPunctuation from "./isPunctuation";

const isBoundary = (leftChar, rightChar) => isPunctuation(leftChar) && isPunctuation(rightChar);

export default isBoundary;