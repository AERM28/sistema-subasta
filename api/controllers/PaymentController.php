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
            handleException($e);
        }
    }

    public function get($id)
    {
        try {
            $response = new Response();
            $payment  = new PaymentModel();
            $result   = $payment->get($id);
            $response->toJSON($result);
        } catch (Exception $e) {
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
            handleException($e);
        }
    }

    public function create()
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();

            $paymentM = new PaymentModel();
            $newPay   = $paymentM->create($inputJSON);

            // Disparar evento con Pusher
            $options = ['cluster' => 'us2', 'useTLS' => true];
            $pusher = new Pusher\Pusher('APP_KEY', 'APP_SECRET', 'APP_ID', $options);
            $pusher->trigger('auction-' . $inputJSON->auction_id, 'payment-pending', $newPay);

            $response->toJSON($newPay);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function confirm()
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();
            $paymentM  = new PaymentModel();
            $pay       = $paymentM->confirm($inputJSON->id);
            $response->toJSON($pay);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
