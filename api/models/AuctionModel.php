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
        $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title, u.full_name AS seller_name,
             (SELECT COUNT(*) FROM bid b WHERE b.auction_id = a.id) AS total_bids,
             (SELECT oi2.image FROM object_image oi2 WHERE oi2.object_id = a.object_id LIMIT 1) AS first_image
             FROM auction a, auction_status ast, object_item oi, user u
             WHERE a.status_id = ast.id
             AND a.object_id = oi.id
             AND a.seller_id = u.id
             AND ast.name = 'activa'
             ORDER BY a.end_at DESC;";
        return $this->enlace->ExecuteSQL($vSql);
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

    public function getOnlyFinalized()
    {
        $vSql = "SELECT a.*, ast.name AS status_name, oi.title AS object_title, u.full_name AS seller_name," .
            " (SELECT COUNT(*) FROM bid b WHERE b.auction_id = a.id) AS total_bids," .
            " (SELECT oi2.image FROM object_image oi2 WHERE oi2.object_id = a.object_id LIMIT 1) AS first_image" .
            " FROM auction a, auction_status ast, object_item oi, user u" .
            " WHERE a.status_id = ast.id" .
            " AND a.object_id = oi.id" .
            " AND a.seller_id = u.id" .
            " AND a.status_id = 4" .
            " ORDER BY a.end_at DESC;";
        return $this->enlace->ExecuteSQL($vSql);
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

    public function getWinner($auctionId)
    {
        $vSql = "SELECT ar.*, u.full_name AS winner_name, u.email AS winner_email
                 FROM auction_result ar, user u
                 WHERE ar.auction_id = $auctionId
                 AND ar.winner_id = u.id;";
        $resultado = $this->enlace->ExecuteSQL($vSql);
        return !empty($resultado) ? $resultado[0] : null;
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

        if (strtotime($auction->end_at) <= time()) {
            return ["error" => "No se puede publicar: la subasta ya habría finalizado."];
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

    public function activatePendingAuctions()
    {
        $vSql = "UPDATE auction
                 SET status_id = 3
                 WHERE status_id = 2
                 AND start_at <= NOW()
                 AND end_at > NOW();";
        $this->enlace->executeSQL_DML($vSql);

        // Retornar las activadas
        $vSql = "SELECT a.*, ast.name AS status_name FROM auction a, auction_status ast
                 WHERE a.status_id = ast.id
                 AND a.status_id = 3
                 AND a.start_at <= NOW();";
        return $this->enlace->ExecuteSQL($vSql);
    }


    public function finalizeExpiredAuctions()
    {
        $vSql = "SELECT a.id FROM auction a
                 WHERE a.status_id = 3
                 AND a.end_at <= NOW();";
        $auctions = $this->enlace->ExecuteSQL($vSql);

        $closed = [];
        if (!empty($auctions) && is_array($auctions)) {
            foreach ($auctions as $a) {
                $result = $this->closeAuction($a->id);
                $closed[] = $result;
            }
        }

        return $closed;
    }

    public function closeAuction($id)
    {
        $auction = $this->get($id);

        if (!$auction) {
            return ["error" => "Subasta no encontrada."];
        }

        // Ya está finalizada o cancelada — devolver tal cual
        if ($auction->status_id == 4 || $auction->status_id == 5) {
            return $auction;
        }

        $fechaFin = new DateTime($auction->end_at);
        $ahora    = new DateTime();

        if ($ahora < $fechaFin) {
            return ["error" => "La subasta aún no ha finalizado por tiempo."];
        }

        // Usar getHighest para determinar ganador por monto, no por fecha
        $bidM      = new BidModel();
        $winnerBid = $bidM->getHighest($id);

        if ($winnerBid) {
            // Insertar resultado solo si no existe
            $checkResult = $this->enlace->ExecuteSQL(
                "SELECT COUNT(*) AS total FROM auction_result WHERE auction_id = $id;"
            );
            if ($checkResult[0]->total == 0) {
                $this->enlace->executeSQL_DML(
                    "INSERT INTO auction_result (auction_id, winner_id, winner_bid_id, final_price, closed_at)
                     VALUES ($id, $winnerBid->bidder_id, $winnerBid->id, $winnerBid->amount, NOW());"
                );
            }

            // Insertar pago solo si no existe
            $checkPayment = $this->enlace->ExecuteSQL(
                "SELECT COUNT(*) AS total FROM payment WHERE auction_id = $id;"
            );
            if ($checkPayment[0]->total == 0) {
                $this->enlace->executeSQL_DML(
                    "INSERT INTO payment (auction_id, payer_id, amount, status_id, method, created_at)
                     VALUES ($id, $winnerBid->bidder_id, $winnerBid->amount, 1, 'simulated', NOW());"
                );
            }
        }

        // Cambiar estado a finalizada
        $this->enlace->executeSQL_DML("UPDATE auction SET status_id = 4 WHERE id = $id;");

        return $this->get($id);
    }

    public function reportBySeller()
    {
        $vSql = "SELECT u.full_name AS seller_name, COUNT(a.id) AS total_auctions" .
            " FROM auction a, user u" .
            " WHERE a.seller_id = u.id" .
            " GROUP BY u.id, u.full_name" .
            " ORDER BY total_auctions DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }
}
