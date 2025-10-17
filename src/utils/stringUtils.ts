export const toTitleCase = (input: string) => {
  return input[0].toUpperCase().concat(input.substring(1).toLowerCase());
}