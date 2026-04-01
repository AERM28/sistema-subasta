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


    public function getHighest($auctionId)
    {
        try {
            $response = new Response();
            $bid      = new BidModel();
            $result   = $bid->getHighest($auctionId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    public function create()
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();

            $auctionM = new AuctionModel();
            $bidM     = new BidModel();

            // Validar que la subasta esté activa
            $auction = $auctionM->get($inputJSON->auction_id);
            if ($auction->status_name !== 'activa') {
                return $response->toJSON(["error" => "La subasta no está activa"]);
            }

            // Validar que el usuario no sea el vendedor
            if ($auction->seller_id == $inputJSON->bidder_id) {
                return $response->toJSON(["error" => "El vendedor no puede pujar"]);
            }

            // Validar monto mayor y mínimo incremento
            $bids = $bidM->getByAuction($inputJSON->auction_id);
            $highest = !empty($bids) ? $bids[0]->amount : $auction->base_price;

            if ($inputJSON->amount <= $highest) {
                return $response->toJSON(["error" => "La puja debe ser mayor a la actual"]);
            }
            if (($inputJSON->amount - $highest) < $auction->min_increment) {
                return $response->toJSON(["error" => "La puja debe respetar el incremento mínimo"]);
            }

            // Guardar puja
            $newBid = $bidM->create($inputJSON);

            // Disparar evento con Pusher desde config
            $config = require __DIR__ . '/../config.php';
            $options = [
                'cluster' => $config['PUSHER_CLUSTER'],
                'useTLS' => true
            ];
            $pusher = new Pusher\Pusher(
                $config['PUSHER_KEY'],
                $config['PUSHER_SECRET'],
                $config['PUSHER_APP_ID'],
                $options
            );

            $pusher->trigger('auction-' . $inputJSON->auction_id, 'bid-created', [
                'auction_id' => $inputJSON->auction_id,
                'bid'        => $newBid,
                'highest_bid' => $bidM->getHighest($inputJSON->auction_id)
            ]);

            $response->toJSON($newBid);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
