import {HttpService, httpService} from "./HttpService";
import {makeTry} from "make-try";
import {SingleTestIORequest, SingleTestIOResponse} from "@online-judge/domain";

export class ApiService {
  private httpService: HttpService;

  constructor(httpService: HttpService) {
    this.httpService = httpService;
  }

  runTestCaseWithIO = makeTry(async (params: SingleTestIORequest) => {
    return await this.httpService.post<SingleTestIOResponse>('http://localhost:3333/test/single', {
      input: params.input,
      output: params.output,
      resourceId: params.resourceId
    });
  }, {
    abort: true
  })
}

export const apiService = new ApiService(httpService);

