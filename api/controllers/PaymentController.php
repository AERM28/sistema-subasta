<?php
class payment
{
    public function index()
    {
        try {
            $response = new Response();
            $payment  = new PaymentModel();
            $result   = $payment->all();
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
            $payment  = new PaymentModel();
            $result   = $payment->get($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /payment/getByAuction/1 → pago de una subasta */
    public function getByAuction($auctionId)
    {
        try {
            $response = new Response();
            $payment  = new PaymentModel();
            $result   = $payment->getByAuction($auctionId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /payment/getByPayer/3 → pagos de un usuario */
    public function getByPayer($payerId)
    {
        try {
            $response = new Response();
            $payment  = new PaymentModel();
            $result   = $payment->getByPayer($payerId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
