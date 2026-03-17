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
}
