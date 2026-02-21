<?php
class auction
{
    public function index()
    {
        try {
            $response = new Response();
            $auction  = new AuctionModel();
            $result   = $auction->all();
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
            $auction  = new AuctionModel();
            $result   = $auction->get($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /auction/getAuctionDetail/1 → subasta con objeto, imágenes y pujas */
    public function getAuctionDetail($id)
    {
        try {
            $response = new Response();
            $auction  = new AuctionModel();
            $result   = $auction->getAuctionDetail($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /auction/getActive → subastas activas */
    public function getActive()
    {
        try {
            $response = new Response();
            $auction  = new AuctionModel();
            $result   = $auction->getActive();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /auction/getFinalized → subastas finalizadas y canceladas */
    public function getFinalized()
    {
        try {
            $response = new Response();
            $auction  = new AuctionModel();
            $result   = $auction->getFinalized();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /auction/getBySeller/2 → subastas de un vendedor */
    public function getBySeller($sellerId)
    {
        try {
            $response = new Response();
            $auction  = new AuctionModel();
            $result   = $auction->getBySeller($sellerId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /auction/getByStatus/3 → subastas por estado */
    public function getByStatus($statusId)
    {
        try {
            $response = new Response();
            $auction  = new AuctionModel();
            $result   = $auction->getByStatus($statusId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /auction/getByObject/1 → historial de subastas de un objeto */
    public function getByObject($objectId)
    {
        try {
            $response = new Response();
            $auction  = new AuctionModel();
            $result   = $auction->getByObject($objectId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
