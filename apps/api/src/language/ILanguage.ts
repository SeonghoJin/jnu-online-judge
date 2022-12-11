
export interface ILanguage<T extends > {
  compile: (options?: T) => void;
}
