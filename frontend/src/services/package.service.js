import axios from 'axios';

const packageBaseURL = `http://3.91.197.7:9000/api/packages`;

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