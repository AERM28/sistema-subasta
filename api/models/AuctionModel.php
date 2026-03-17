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
            " (SELECT COUNT(*) FROM bid b WHERE b.auction_id = a.id) AS total_bids" .
            " FROM auction a, auction_status ast, object_item oi, user u" .
            " WHERE a.status_id = ast.id" .
            " AND a.object_id = oi.id" .
            " AND a.seller_id = u.id" .
            " AND ast.name = 'activa'" .
            " ORDER BY a.end_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }


    /* Subastas finalizadas y canceladas */
    public function getFinalized()
    {
        $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title, u.full_name AS seller_name," .
            " (SELECT COUNT(*) FROM bid b WHERE b.auction_id = a.id) AS total_bids" .
            " FROM auction a, auction_status ast, object_item oi, user u" .
            " WHERE a.status_id = ast.id" .
            " AND a.object_id = oi.id" .
            " AND a.seller_id = u.id" .
            " AND ast.is_final = 1" .
            " ORDER BY a.end_at DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    public function getDraft()
    {
        $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title, u.full_name AS seller_name," .
            " (SELECT COUNT(*) FROM bid b WHERE b.auction_id = a.id) AS total_bids" .
            " FROM auction a, auction_status ast, object_item oi, user u" .
            " WHERE a.status_id = ast.id" .
            " AND a.object_id = oi.id" .
            " AND a.seller_id = u.id" .
            " AND a.status_id = 1" .
            " ORDER BY a.created_at DESC;";
        return $this->enlace->ExecuteSQL($vSql);
    }

    public function getScheduled()
    {
        $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title, u.full_name AS seller_name," .
            " (SELECT COUNT(*) FROM bid b WHERE b.auction_id = a.id) AS total_bids" .
            " FROM auction a, auction_status ast, object_item oi, user u" .
            " WHERE a.status_id = ast.id" .
            " AND a.object_id = oi.id" .
            " AND a.seller_id = u.id" .
            " AND a.status_id = 2" .
            " ORDER BY a.start_at ASC;";
        return $this->enlace->ExecuteSQL($vSql);
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

    public function hasStarted($id)
    {
        $vSql = "SELECT COUNT(*) AS total FROM auction
                 WHERE id = $id
                 AND start_at <= NOW();";
        $resultado = $this->enlace->ExecuteSQL($vSql);
        return $resultado[0]->total > 0;
    }

    public function hasBids($id)
    {
        $vSql = "SELECT COUNT(*) AS total FROM bid
                 WHERE auction_id = $id;";
        $resultado = $this->enlace->ExecuteSQL($vSql);
        return $resultado[0]->total > 0;
    }

    public function objectHasActiveAuction($objectId, $excludeId = 0)
    {
        $vSql = "SELECT COUNT(*) AS total FROM auction
                 WHERE object_id = $objectId
                 AND status_id = 3
                 AND id != $excludeId;";
        $resultado = $this->enlace->ExecuteSQL($vSql);
        return $resultado[0]->total > 0;
    }

    public function objectIsActive($objectId)
    {
        $vSql = "SELECT COUNT(*) AS total FROM object_item
                 WHERE id = $objectId
                 AND status_id = 1;";
        $resultado = $this->enlace->ExecuteSQL($vSql);
        return $resultado[0]->total > 0;
    }

    public function create($auction)
    {
        // Regla: el objeto debe estar activo
        if (!$this->objectIsActive($auction->object_id)) {
            return ["error" => "El objeto seleccionado no está activo."];
        }

        // Regla: el objeto no puede tener otra subasta activa
        if ($this->objectHasActiveAuction($auction->object_id)) {
            return ["error" => "El objeto ya tiene una subasta activa."];
        }

        $start = str_replace("T", " ", $auction->start_at);
        $end   = str_replace("T", " ", $auction->end_at);

        // Regla: fecha cierre > fecha inicio
        if (strtotime($auction->end_at) <= strtotime($auction->start_at)) {
            return ["error" => "La fecha de cierre debe ser posterior a la fecha de inicio."];
        }

        // Regla: precio base > 0
        if ($auction->base_price <= 0) {
            return ["error" => "El precio base debe ser mayor a 0."];
        }

        // Regla: incremento mínimo > 0
        if ($auction->min_increment <= 0) {
            return ["error" => "El incremento mínimo debe ser mayor a 0."];
        }

        // status_id = 1 (borrador) al crear
        $vSql = "INSERT INTO auction (object_id, seller_id, created_by, start_at, end_at, base_price, min_increment, status_id, created_at)" .
            " VALUES ('$auction->object_id', '$auction->seller_id', '$auction->seller_id', '$start', '$end'," .
            " '$auction->base_price', '$auction->min_increment', 1, NOW());";

        $newId = $this->enlace->executeSQL_DML_last($vSql);
        return $this->get($newId);
    }

    public function update($auction)
    {
        // Regla: no ha iniciado
        if ($this->hasStarted($auction->id)) {
            return ["error" => "No se puede editar una subasta que ya ha iniciado."];
        }

        // Regla: no tiene pujas
        if ($this->hasBids($auction->id)) {
            return ["error" => "No se puede editar una subasta que ya tiene pujas."];
        }

        // Regla: fecha cierre > fecha inicio
        if (strtotime($auction->end_at) <= strtotime($auction->start_at)) {
            return ["error" => "La fecha de cierre debe ser posterior a la fecha de inicio."];
        }

        // Regla: precio base > 0
        if ($auction->base_price <= 0) {
            return ["error" => "El precio base debe ser mayor a 0."];
        }

        // Regla: incremento mínimo > 0
        if ($auction->min_increment <= 0) {
            return ["error" => "El incremento mínimo debe ser mayor a 0."];
        }

        // Solo se modifican los campos permitidos (objeto y vendedor no se tocan)
        $vSql = "UPDATE auction SET" .
            " start_at = '$auction->start_at'," .
            " end_at = '$auction->end_at'," .
            " base_price = '$auction->base_price'," .
            " min_increment = '$auction->min_increment'" .
            " WHERE id = $auction->id;";

        $this->enlace->executeSQL_DML($vSql);
        return $this->get($auction->id);
    }

    public function publish($id)
    {
        $auction = $this->get($id);

        if ($auction->status_id != 1) {
            return ["error" => "Solo se puede publicar una subasta en estado borrador."];
        }

        if (strtotime($auction->start_at) <= time()) {
            return ["error" => "No se puede publicar: la fecha de inicio ya pasó."];
        }

        $vSql = "UPDATE auction SET status_id = 2, published_at = NOW() WHERE id = $id;";
        $this->enlace->executeSQL_DML($vSql);
        return $this->get($id);
    }

    public function cancel($id)
    {
        $notStarted = !$this->hasStarted($id);
        $noBids     = !$this->hasBids($id);

        // Debe cumplir al menos una condición
        if (!$notStarted && !$noBids) {
            return ["error" => "No se puede cancelar: la subasta ya inició y tiene pujas."];
        }

        $vSql = "UPDATE auction SET status_id = 5 WHERE id = $id;";
        $this->enlace->executeSQL_DML($vSql);
        return $this->get($id);
    }
}
