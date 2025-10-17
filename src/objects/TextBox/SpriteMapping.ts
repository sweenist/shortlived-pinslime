const DEFAULT_WIDTH = 5;
const widthMap = new Map<string, number>();

widthMap.set('c', 4);
widthMap.set('f', 4);
widthMap.set('i', 2);
widthMap.set('j', 4);
widthMap.set('l', 3);
widthMap.set('n', 4);

widthMap.set('r', 4);
widthMap.set('t', 4);
widthMap.set('u', 4);
widthMap.set('u', 4);
widthMap.set('w', 5);
widthMap.set('x', 4);
widthMap.set('y', 4);
widthMap.set('z', 4);

widthMap.set('E', 4);
widthMap.set('F', 4);
widthMap.set('M', 7);
widthMap.set('W', 7);

widthMap.set(' ', 3);
widthMap.set("'", 1);
widthMap.set('!', 1);

export const getCharacterWidth = (char: string) =>
  widthMap.get(char) ?? DEFAULT_WIDTH;

const frameMap = new Map<string, number>();
[
  'abcdefghijklm',
  'nopqrstuvwxyz',
  'ABCDEFGHIJKLM',
  'NOPQRSTUVWXYZ',
  '0123456789 __',
  ".!-,?'",
]
  .join('')
  .split('')
  .forEach((char, index) => {
    frameMap.set(char, index);
  });

export const getCharacterFrame = (char: string) => frameMap.get(char);
