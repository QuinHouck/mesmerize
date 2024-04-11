import axios from 'axios';

const packageBaseURL = `https://localhost:3000/api/packages`;

function getAxios(token) {
    return axios.create({
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
    })
}

class PackageService {

  getAvailable() {
    return axios.get(packageBaseURL);
  }

  create(data) {
    return axios.post(packageBaseURL, data);
  }

}

export default new PackageService();