<?php
class bid
{
    public function index()
    {
        try {
            $response = new Response();
            $bid      = new BidModel();
            $result   = $bid->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    public function get($param)
    {
        try {
            $response = new Response();
            $bid      = new BidModel();
            $result   = $bid->get($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /bid/getByAuction/1 → pujas de una subasta */
    public function getByAuction($auctionId)
    {
        try {
            $response = new Response();
            $bid      = new BidModel();
            $result   = $bid->getByAuction($auctionId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /bid/getByBidder/3 → pujas de un usuario */
    public function getByBidder($bidderId)
    {
        try {
            $response = new Response();
            $bid      = new BidModel();
            $result   = $bid->getByBidder($bidderId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
