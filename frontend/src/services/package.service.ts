import axios, { AxiosResponse } from 'axios';
import env from '../config/env';
import type { PackageInfo, PackageItem } from '../types/package';

const packageBaseURL = `${env.apiUrl}/api/packages`;

class PackageService {
  getAvailable(): Promise<AxiosResponse<PackageInfo[]>> {
    return axios.get<PackageInfo[]>(packageBaseURL);
  }

  getPackage(name: string): Promise<AxiosResponse<PackageItem[]>> {
    return axios.get<PackageItem[]>(`${packageBaseURL}/${name}`);
  }

  create(data: PackageInfo): Promise<AxiosResponse<PackageInfo>> {
    return axios.post<PackageInfo>(packageBaseURL, data);
  }
}

export default new PackageService();

