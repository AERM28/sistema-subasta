<?php
class PaymentModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todos los pagos */
    public function all()
    {
        $vSql = "SELECT p.*, ps.name AS status_name, u.full_name AS payer_name, oi.title AS object_title" .
                " FROM payment p, payment_status ps, user u, auction a, object_item oi" .
                " WHERE p.status_id = ps.id" .
                " AND p.payer_id = u.id" .
                " AND p.auction_id = a.id" .
                " AND a.object_id = oi.id" .
                " ORDER BY p.created_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /* Obtener pago por id */
    public function get($id)
    {
        $vSql = "SELECT p.*, ps.name AS status_name, u.full_name AS payer_name, oi.title AS object_title" .
                " FROM payment p, payment_status ps, user u, auction a, object_item oi" .
                " WHERE p.status_id = ps.id" .
                " AND p.payer_id = u.id" .
                " AND p.auction_id = a.id" .
                " AND a.object_id = oi.id" .
                " AND p.id = $id;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    /* Obtener pago por subasta */
    public function getByAuction($auctionId)
    {
        $vSql = "SELECT p.*, ps.name AS status_name, u.full_name AS payer_name" .
                " FROM payment p, payment_status ps, user u" .
                " WHERE p.status_id = ps.id" .
                " AND p.payer_id = u.id" .
                " AND p.auction_id = $auctionId;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    /* Pagos de un usuario */
    public function getByPayer($payerId)
    {
        $vSql = "SELECT p.*, ps.name AS status_name, oi.title AS object_title" .
                " FROM payment p, payment_status ps, auction a, object_item oi" .
                " WHERE p.status_id = ps.id" .
                " AND p.auction_id = a.id" .
                " AND a.object_id = oi.id" .
                " AND p.payer_id = $payerId" .
                " ORDER BY p.created_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }
}
