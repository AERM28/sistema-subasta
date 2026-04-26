import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL + 'auction';

class AuctionService {

    // GET /auction
    getAuctions() {
        return axios.get(BASE_URL);
    }

    // GET /auction/1
    getAuctionById(id) {
        return axios.get(BASE_URL + '/' + id);
    }

    // GET /auction/getActive
    getActive() {
        return axios.get(BASE_URL + '/getActive');
    }

    // GET /auction/getFinalized
    getFinalized() {
        return axios.get(BASE_URL + '/getFinalized');
    }

    // GET /auction/getDraft
    getDraft() {
        return axios.get(BASE_URL + '/getDraft');
    }

    // GET /auction/getScheduled
    getScheduled() {
        return axios.get(BASE_URL + '/getScheduled');
    }

    // GET /auction/getAuctionDetail/1
    getAuctionDetail(id) {
        return axios.get(BASE_URL + '/getAuctionDetail/' + id);
    }

    // GET /auction/getBySeller/1
    getBySeller(sellerId) {
        return axios.get(BASE_URL + '/getBySeller/' + sellerId);
    }

    // GET /auction/getByObject/1
    getByObject(objectId) {
        return axios.get(BASE_URL + '/getByObject/' + objectId);
    }

    // POST /auction/create
    create(data) {
        return axios.post(BASE_URL, JSON.stringify(data));
    }

    // PUT /auction/update/1
    update(id, data) {
        return axios.put(BASE_URL + '/update/' + id, JSON.stringify(data));
    }

    // PUT /auction/publish/1
    publish(id) {
        return axios.post(BASE_URL + '/publish', { id });
    }

    cancel(id) {
        return axios.post(BASE_URL + '/cancel', { id });
    }

    // GET /auction/getActiveWithImage
    getActiveWithImage() {
        return axios.get(BASE_URL + '/getActiveWithImage');
    }

    // PUT /auction/close/1
    close(id) {
        return axios.post(BASE_URL + '/close', { id });
    }
    closeAuction(auctionId) {
        return axios.put(BASE_URL + '/close/' + auctionId);
    }

    // Obtener ganador de una subasta
    getWinner(auctionId) {
        return axios.get(BASE_URL + '/getWinner/' + auctionId);
    }

    activatePending() {
        return axios.put(BASE_URL + '/activatePending');
    }

    reportBySeller() {
    return axios.get(BASE_URL + '/reportBySeller');
    }

    getOnlyFinalized() {
    return axios.get(BASE_URL + '/getOnlyFinalized');
    }

}

export default new AuctionService();