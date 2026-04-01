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
        $vSql = "SELECT p.*, u.full_name AS payer_name, ps.name AS status_name,
                oi.title AS object_title
                FROM payment p, user u, payment_status ps, auction a, object_item oi
                WHERE p.payer_id = u.id
                AND p.status_id = ps.id
                AND p.auction_id = a.id
                AND a.object_id = oi.id
                ORDER BY p.created_at DESC;";
        return $this->enlace->ExecuteSQL($vSql);
    }

    /* Obtener un pago por id */
    public function get($id)
    {
        $vSql = "SELECT p.*, u.full_name AS payer_name, ps.name AS status_name
                 FROM payment p, user u, payment_status ps
                 WHERE p.payer_id = u.id
                 AND p.status_id = ps.id
                 AND p.id = $id;";
        $result = $this->enlace->ExecuteSQL($vSql);
        return $result[0];
    }

    /* Obtener pagos realizados por un usuario */
    public function getByPayer($payerId)
    {
        $vSql = "SELECT p.*, u.full_name AS payer_name, ps.name AS status_name, a.id AS auction_id, oi.title AS object_title
             FROM payment p, user u, payment_status ps, auction a, object_item oi
             WHERE p.payer_id = u.id
             AND p.status_id = ps.id
             AND p.auction_id = a.id
             AND a.object_id = oi.id
             AND p.payer_id = $payerId
             ORDER BY p.created_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    public function getByAuction($auctionId)
    {
        $vSql = "SELECT p.*, u.full_name AS payer_name, ps.name AS status_name
                 FROM payment p, user u, payment_status ps
                 WHERE p.payer_id = u.id
                 AND p.status_id = ps.id
                 AND p.auction_id = $auctionId;";
        $result = $this->enlace->ExecuteSQL($vSql);
        return $result[0];
    }

    public function create($payment)
    {
        $vSql = "INSERT INTO payment (auction_id, payer_id, amount, status_id, method, created_at)
                 VALUES ($payment->auction_id, $payment->payer_id, $payment->amount, $payment->status_id, '$payment->method', NOW());";
        $newId = $this->enlace->executeSQL_DML_last($vSql);
        return $this->get($newId);
    }

    /* Confirmar pago */
    public function confirm($id)
    {
        $vSql = "UPDATE payment SET status_id = 2, paid_at = NOW() WHERE id = $id;";
        $this->enlace->executeSQL_DML($vSql);
        return $this->get($id);
    }
}
