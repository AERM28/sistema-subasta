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

    public function getDraft()
    {
        try {
            $response = new Response();
            $auction  = new AuctionModel();
            $result   = $auction->getDraft();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    public function getScheduled()
    {
        try {
            $response = new Response();
            $auction  = new AuctionModel();
            $result   = $auction->getScheduled();
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

    public function getWinner($auctionId)
    {
        try {
            $response = new Response();
            $auction  = new AuctionModel();
            $result   = $auction->getWinner($auctionId);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* POST /auction/create */
    public function create()
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();
            $auction   = new AuctionModel();
            $result    = $auction->create($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* PUT /auction/update/1 */
    public function update($param)
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();
            $inputJSON->id = $param;
            $auction = new AuctionModel();
            $result  = $auction->update($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* PUT /auction/publish/1 */
    public function publish()
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();
            $auction   = new AuctionModel();
            $result    = $auction->publish($inputJSON->id);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* PUT /auction/cancel/1 */
    public function cancel()
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();
            $auction   = new AuctionModel();
            $result    = $auction->cancel($inputJSON->id);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }


    public function activatePending()
    {
        try {
            $response = new Response();
            $auctionM = new AuctionModel();
            $result = $auctionM->activatePendingAuctions();
            $response->toJSON(["message" => "Subastas activadas", "data" => $result]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    /* PUT /auction/finalizeExpired → cerrar subastas vencidas */
    public function finalizeExpired()
    {
        try {
            $response = new Response();
            $auctionM = new AuctionModel();
            $result = $auctionM->finalizeExpiredAuctions();
            $response->toJSON(["message" => "Subastas finalizadas", "data" => $result]);
        } catch (Exception $e) {
            handleException($e);
        }
    }

    public function close()
    {
        try {
            $request  = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $id = $inputJSON->id;

            if (!$id) {
                return $response->toJSON(["error" => "ID no recibido"]);
            }

            $auctionM = new AuctionModel();
            $result   = $auctionM->closeAuction($id);

            if (is_array($result) && isset($result['error'])) {
                return $response->toJSON($result);
            }

            try {
                $config = require __DIR__ . '/../config.php';
                $pusher = new Pusher\Pusher(
                    $config['PUSHER_KEY'],
                    $config['PUSHER_SECRET'],
                    $config['PUSHER_APP_ID'],
                    ['cluster' => $config['PUSHER_CLUSTER'], 'useTLS' => true]
                );

                $winnerData = null;
                if (is_object($result) && $result->status_id == 4) {
                    $winnerData = $auctionM->getWinner($id);
                }

                $pusher->trigger('auction-' . $id, 'auction-closed', [
                    'auction' => $result,
                    'winner'  => $winnerData,
                ]);
            } catch (Exception $pusherEx) {
            }

            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
