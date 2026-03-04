import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'objectitem';

class ObjectItemService {

    // GET /api/objectitem
    getObjects() {
        return axios.get(BASE_URL);
    }

    // GET /api/objectitem/1
    getObjectById(id) {
        return axios.get(BASE_URL + '/' + id);
    }

    // GET /api/objectitem/getObjectDetail/1
    getObjectDetail(id) {
        return axios.get(BASE_URL + '/getObjectDetail/' + id);
    }
}

export default new ObjectItemService();