import { IO } from './RunTaMultipleTestCaseRequest';

export type RunTaSingleTestCaseRequest = {
  userName: string;
  folderName: string;
  ios: IO[];
}
