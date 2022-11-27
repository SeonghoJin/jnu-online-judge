import axios, {AxiosInstance} from "axios";

export type HttpService = AxiosInstance;
export const httpService: HttpService = axios.create();
