<?php
class AuctionModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todas las subastas */
    public function all()
{
    $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title, u.full_name AS seller_name," .
            " (SELECT COUNT(*) FROM bid b WHERE b.auction_id = a.id) AS total_bids" .
            " FROM auction a, auction_status ast, object_item oi, user u" .
            " WHERE a.status_id = ast.id" .
            " AND a.object_id = oi.id" .
            " AND a.seller_id = u.id" .
            " ORDER BY a.start_at DESC;";
    $vResultado = $this->enlace->ExecuteSQL($vSql);
    return $vResultado;
}
    /* Obtener una subasta por id */
    public function get($id)
    {
        $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title, u.full_name AS seller_name" .
                " FROM auction a, auction_status ast, object_item oi, user u" .
                " WHERE a.status_id = ast.id" .
                " AND a.object_id = oi.id" .
                " AND a.seller_id = u.id" .
                " AND a.id = $id;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    /* Detalle completo: subasta + objeto con imágenes, categorías + pujas */
    public function getAuctionDetail($id)
{
    $bidModel    = new BidModel();
    $objectModel = new ObjectItemModel();

    $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title, u.full_name AS seller_name," .
            " (SELECT COUNT(*) FROM bid b WHERE b.auction_id = a.id) AS total_bids" .
            " FROM auction a, auction_status ast, object_item oi, user u" .
            " WHERE a.status_id = ast.id" .
            " AND a.object_id = oi.id" .
            " AND a.seller_id = u.id" .
            " AND a.id = $id;";
    $vResultado = $this->enlace->ExecuteSQL($vSql);

    if (!empty($vResultado)) {
        $vResultado = $vResultado[0];
        $vResultado->bids   = $bidModel->getByAuction($id);
        $vResultado->object = $objectModel->getObjectDetail($vResultado->object_id);
    }

    return $vResultado;
}

    /* Subastas activas */
    public function getActive()
{
    $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title, u.full_name AS seller_name," .
            " (SELECT COUNT(*) FROM bid b WHERE b.auction_id = a.id) AS total_bids" .  // ← agregar
            " FROM auction a, auction_status ast, object_item oi, user u" .
            " WHERE a.status_id = ast.id" .
            " AND a.object_id = oi.id" .
            " AND a.seller_id = u.id" .
            " AND ast.name = 'activa'" .
            " ORDER BY a.end_at ASC;";
    $vResultado = $this->enlace->ExecuteSQL($vSql);
    return $vResultado;
}


    /* Subastas finalizadas y canceladas */
    public function getFinalized()
{
    $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title, u.full_name AS seller_name," .
            " (SELECT COUNT(*) FROM bid b WHERE b.auction_id = a.id) AS total_bids" .  // ← agregar
            " FROM auction a, auction_status ast, object_item oi, user u" .
            " WHERE a.status_id = ast.id" .
            " AND a.object_id = oi.id" .
            " AND a.seller_id = u.id" .
            " AND ast.is_final = 1" .
            " ORDER BY a.end_at DESC;";
    $vResultado = $this->enlace->ExecuteSQL($vSql);
    return $vResultado;
}

    /* Subastas por vendedor */
    public function getBySeller($sellerId)
    {
        $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title" .
                " FROM auction a, auction_status ast, object_item oi" .
                " WHERE a.status_id = ast.id" .
                " AND a.object_id = oi.id" .
                " AND a.seller_id = $sellerId" .
                " ORDER BY a.created_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /* Subastas por estado */
    public function getByStatus($statusId)
    {
        $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title, u.full_name AS seller_name" .
                " FROM auction a, auction_status ast, object_item oi, user u" .
                " WHERE a.status_id = ast.id" .
                " AND a.object_id = oi.id" .
                " AND a.seller_id = u.id" .
                " AND a.status_id = $statusId" .
                " ORDER BY a.start_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /* Historial de subastas de un objeto */
    public function getByObject($objectId)
    {
        $vSql = "SELECT a.*, ast.name AS status_name" .
                " FROM auction a, auction_status ast" .
                " WHERE a.status_id = ast.id" .
                " AND a.object_id = $objectId" .
                " ORDER BY a.start_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }
}