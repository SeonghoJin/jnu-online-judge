import {HttpService, httpService} from "./HttpService";

export class ApiService {
  private httpService: HttpService;

  constructor(httpService: HttpService) {
    this.httpService = httpService;
  }

  runTestCaseWithIO = async (params: {
    input: string;
    output: string;
    resourceId: string;
  }) => {
    try {
      const result = await this.httpService.post('http://localhost:3333/test/single', {
        input: params.input,
        output: params.output,
        resourceId: params.resourceId
      });
      console.log(result);
    } catch (err) {
      console.warn(err);
    }
  }
}

export const apiService = new ApiService(httpService);

