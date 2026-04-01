<?php
class BidModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todas las pujas */
    public function all()
    {
        $vSql = "SELECT b.*, u.full_name AS bidder_name" .
            " FROM bid b, user u" .
            " WHERE b.bidder_id = u.id" .
            " ORDER BY b.created_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /* Obtener una puja por id */
    public function get($id)
    {
        $vSql = "SELECT b.*, u.full_name AS bidder_name" .
            " FROM bid b, user u" .
            " WHERE b.bidder_id = u.id" .
            " AND b.id = $id;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    /* Obtener pujas de una subasta ordenadas cronológicamente */
    public function getByAuction($auctionId)
    {
        $vSql = "SELECT b.*, u.full_name AS bidder_name" .
            " FROM bid b, user u" .
            " WHERE b.bidder_id = u.id" .
            " AND b.auction_id = $auctionId" .
            " ORDER BY b.created_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    public function getHighest($auctionId)
    {
        $vSql = "SELECT b.*, u.full_name AS bidder_name" .
            " FROM bid b, user u" .
            " WHERE b.bidder_id = u.id" .
            " AND b.auction_id = $auctionId" .
            " ORDER BY b.amount DESC" .
            " LIMIT 1;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        return !empty($vResultado) ? $vResultado[0] : null;
    }
    /* Obtener pujas realizadas por un usuario */
    public function getByBidder($bidderId)
    {
        $vSql = "SELECT b.*, oi.title AS object_title, a.end_at" .
            " FROM bid b, auction a, object_item oi" .
            " WHERE b.auction_id = a.id" .
            " AND a.object_id = oi.id" .
            " AND b.bidder_id = $bidderId" .
            " ORDER BY b.created_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

     public function create($bid)
    {
        $auctionM = new AuctionModel();
        $auction  = $auctionM->get($bid->auction_id);
 
        if (!$auction) {
            return ["error" => "Subasta no encontrada."];
        }
        if ($auction->status_id != 3) {
            return ["error" => "La subasta no está activa."];
        }
        if ($auction->seller_id == $bid->bidder_id) {
            return ["error" => "El vendedor no puede pujar en su propia subasta."];
        }
        if (strtotime($auction->end_at) <= time()) {
            return ["error" => "La subasta ya ha finalizado."];
        }
 

        $highestBid = $this->getHighest($bid->auction_id);
        $highest    = $highestBid ? $highestBid->amount : $auction->base_price;
 
        if ($bid->amount <= $highest) {
            return ["error" => "Monto debe ser mayor a la puja actual ($highest)."];
        }
        if (($bid->amount - $highest) < $auction->min_increment) {
            return ["error" => "Debe respetar el incremento mínimo ({$auction->min_increment})."];
        }
 
        $vSql = "INSERT INTO bid (auction_id, bidder_id, amount, created_at)
                 VALUES ($bid->auction_id, $bid->bidder_id, $bid->amount, NOW());";
        $newId = $this->enlace->executeSQL_DML_last($vSql);
        return $this->get($newId);
    }
}
