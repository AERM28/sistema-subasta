import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'bid';

class BidService {

    // GET /api/bid
    getBids() {
        return axios.get(BASE_URL);
    }

    // GET /api/bid/getByAuction/1
    getByAuction(auctionId) {
        return axios.get(BASE_URL + '/getByAuction/' + auctionId);
    }

    // GET /api/bid/getByBidder/1
    getByBidder(bidderId) {
        return axios.get(BASE_URL + '/getByBidder/' + bidderId);
    }

    // POST /bid/create
    create(data) {
        return axios.post(BASE_URL + '/create', JSON.stringify(data));
    }

    getHighest(auctionId) {
        return axios.get(BASE_URL + '/getHighest/' + auctionId);
    }

}

export default new BidService();