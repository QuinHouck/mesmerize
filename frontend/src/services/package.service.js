import axios from 'axios';
import env from '../config/env';

const packageBaseURL = `${env.apiUrl}/api/packages`;

class PackageService {

  getAvailable() {
    return axios.get(packageBaseURL);
  }

  getPackage(name) {
    return axios.get(packageBaseURL + "/" + name);
  }

  create(data) {
    return axios.post(packageBaseURL, data);
  }

}

export default new PackageService();