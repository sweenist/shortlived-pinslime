const DEFAULT_WIDTH = 8;
const widthMap = new Map<string, number>();

widthMap.set('!', 1);
widthMap.set('.', 1);

export const getCharacterWidth = (char: string) =>
  widthMap.get(char) ?? DEFAULT_WIDTH;

const frameMap = new Map<string, number>();
[
  'abcdefghijklm',
  'nopqrstuvwxyz',
  'ABCDEFGHIJKLM',
  'NOPQRSTUVWXYZ',
  '1234567890!?.',
]
  .join('')
  .split('')
  .forEach((char, index) => {
    frameMap.set(char, index);
  });

export const getCharacterFrame = (char: string) => frameMap.get(char);
