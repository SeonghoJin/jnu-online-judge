export const formatTestCase = (value: string) => {
  return value.replace(/(\s*)/g, "").replace(/\n|\r|\s*/g, "").toLowerCase();
}
