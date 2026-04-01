import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'payment';

class PaymentService {

    // GET /payment
    getPayments() {
        return axios.get(BASE_URL);
    }

    // GET /payment/1
    getPaymentById(id) {
        return axios.get(BASE_URL + '/' + id);
    }

    // GET /payment/getByPayer/1
    getByPayer(payerId) {
        return axios.get(BASE_URL + '/getByPayer/' + payerId);
    }

    getByAuction(auctionId) {
        return axios.get(BASE_URL + '/getByAuction/' + auctionId);
    }

    // POST /payment/create
    create(data) {
        return axios.post(BASE_URL + '/create', JSON.stringify(data));
    }

    // PUT /payment/confirm/1
    confirm(id) {
        return axios.post(BASE_URL + '/confirm', { id });
    }
}

export default new PaymentService();