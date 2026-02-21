<?php
class AuctionResultModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todos los resultados de subasta */
    public function all()
    {
        $vSql = "SELECT ar.*, u.full_name AS winner_name, oi.title AS object_title, a.base_price" .
                " FROM auction_result ar, user u, auction a, object_item oi" .
                " WHERE ar.winner_id = u.id" .
                " AND ar.auction_id = a.id" .
                " AND a.object_id = oi.id" .
                " ORDER BY ar.closed_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /* Obtener resultado por id */
    public function get($id)
    {
        $vSql = "SELECT ar.*, u.full_name AS winner_name, oi.title AS object_title, a.base_price" .
                " FROM auction_result ar, user u, auction a, object_item oi" .
                " WHERE ar.winner_id = u.id" .
                " AND ar.auction_id = a.id" .
                " AND a.object_id = oi.id" .
                " AND ar.id = $id;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    /* Obtener resultado por id de subasta */
    public function getByAuction($auctionId)
    {
        $vSql = "SELECT ar.*, u.full_name AS winner_name, oi.title AS object_title, a.base_price" .
                " FROM auction_result ar, user u, auction a, object_item oi" .
                " WHERE ar.winner_id = u.id" .
                " AND ar.auction_id = a.id" .
                " AND a.object_id = oi.id" .
                " AND ar.auction_id = $auctionId;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    /* Subastas ganadas por un usuario */
    public function getByWinner($winnerId)
    {
        $vSql = "SELECT ar.*, oi.title AS object_title, a.base_price" .
                " FROM auction_result ar, auction a, object_item oi" .
                " WHERE ar.auction_id = a.id" .
                " AND a.object_id = oi.id" .
                " AND ar.winner_id = $winnerId" .
                " ORDER BY ar.closed_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }
}
