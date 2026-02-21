<?php
class auctionresult
{
    public function index()
    {
        try {
            $response = new Response();
            $result_m = new AuctionResultModel();
            $result   = $result_m->all();
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
            $result_m = new AuctionResultModel();
            $result   = $result_m->get($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /auctionresult/getByAuction/1 → resultado de una subasta */
    public function getByAuction($auctionId)
    {
        try {
            $response = new Response();
            $result_m = new AuctionResultModel();
            $result   = $result_m->getByAuction($auctionId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /auctionresult/getByWinner/2 → subastas ganadas por un usuario */
    public function getByWinner($winnerId)
    {
        try {
            $response = new Response();
            $result_m = new AuctionResultModel();
            $result   = $result_m->getByWinner($winnerId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
