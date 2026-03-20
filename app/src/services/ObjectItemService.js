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

    getAvailableForSeller(sellerId) {
        return axios.get(BASE_URL + '/getAvailableForSeller/' + sellerId);
    }

    createObjectItem(Item) {
        return axios.post(BASE_URL, JSON.stringify(Item));
    }

    updateObjectItem(data) {
        return axios({
            method: 'put',
            url: BASE_URL + '/update/' + data.id,
            data: JSON.stringify(data)
        });
    }

    toggleStatus(id) {
        return axios.post(BASE_URL + '/toggleStatus', { id });
    }

    delete(id) {
        return axios.post(BASE_URL + '/delete', { id });
    }


}

export default new ObjectItemService();