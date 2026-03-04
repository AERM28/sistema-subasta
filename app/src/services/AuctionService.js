import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'auction';

class AuctionService {

    // GET /api/auction
    getAuctions() {
        return axios.get(BASE_URL);
    }

    // GET /api/auction/1
    getAuctionById(id) {
        return axios.get(BASE_URL + '/' + id);
    }

    // GET /api/auction/getActive
    getActive() {
        return axios.get(BASE_URL + '/getActive');
    }

    // GET /api/auction/getFinalized
    getFinalized() {
        return axios.get(BASE_URL + '/getFinalized');
    }

    // GET /api/auction/getAuctionDetail/1
    getAuctionDetail(id) {
        return axios.get(BASE_URL + '/getAuctionDetail/' + id);
    }
}

export default new AuctionService();