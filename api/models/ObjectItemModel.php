<?php
class ObjectItemModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todos los objetos */
    public function all()
    {
        $imagenA    = new ObjectImageModel();
        $categoriaA = new CategoryModel();

        $vSql = "SELECT oi.*, u.full_name AS seller_name" .
            " FROM object_item oi, user u" .
            " WHERE oi.seller_id = u.id" .
            " ORDER BY oi.date_created DESC;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i]->imagen    = $imagenA->getByObject($vResultado[$i]->id);
                $vResultado[$i]->categoria = $categoriaA->getCategoriesByObject($vResultado[$i]->id);
            }
        }

        return $vResultado;
    }

    /* Obtener un objeto por id */
    public function get($id)
    {
        $vSql = "SELECT * FROM object_item WHERE id = $id;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    /* Detalle completo: categorías, imágenes e historial de subastas */
    public function getObjectDetail($id)
    {
        $categoriaA = new CategoryModel();
        $imagenA    = new ObjectImageModel();
        $auctionM   = new AuctionModel();

        $vSql = "SELECT oi.*, u.full_name AS seller_name, os.name AS status_name" .
            " FROM object_item oi, user u, object_status os" .
            " WHERE oi.seller_id = u.id" .
            " AND oi.status_id = os.id" .
            " AND oi.id = $id;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!empty($vResultado)) {
            $vResultado = $vResultado[0];
            $vResultado->images         = $imagenA->getByObject($id);
            $vResultado->categories       = $categoriaA->getCategoriesByObject($id);
            $vResultado->auction_history = $auctionM->getByObject($id);
        }

        return $vResultado;
    }

    /* Objetos por categoría */
    public function getByCategory($categoryId)
    {
        $imagenA    = new ObjectImageModel();
        $categoriaA = new CategoryModel();

        $vSql = "SELECT oi.* FROM object_item oi, object_category oc" .
            " WHERE oi.id = oc.object_id" .
            " AND oc.category_id = $categoryId;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i]->imagen    = $imagenA->getByObject($vResultado[$i]->id);
                $vResultado[$i]->categoria = $categoriaA->getCategoriesByObject($vResultado[$i]->id);
            }
        }

        return $vResultado;
    }

    /* Objetos de un vendedor */
    public function getBySeller($sellerId)
    {
        $imagenA    = new ObjectImageModel();
        $categoriaA = new CategoryModel();

        $vSql = "SELECT * FROM object_item WHERE seller_id = $sellerId;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i]->imagen    = $imagenA->getByObject($vResultado[$i]->id);
                $vResultado[$i]->categoria = $categoriaA->getCategoriesByObject($vResultado[$i]->id);
            }
        }

        return $vResultado;
    }

    public function getAvailableForSeller($sellerId)
    {
        $imagenA    = new ObjectImageModel();
        $categoriaA = new CategoryModel();

        $vSql = "SELECT oi.*, u.full_name AS seller_name 
         FROM object_item oi, user u
         WHERE oi.seller_id = u.id
         AND oi.seller_id = $sellerId
         AND oi.status_id = 1
         AND NOT EXISTS (
             SELECT 1 FROM auction a 
             WHERE a.object_id = oi.id 
             AND a.status_id in (2,3)
         );";
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                $vResultado[$i]->imagen    = $imagenA->getByObject($vResultado[$i]->id);
                $vResultado[$i]->categoria = $categoriaA->getCategoriesByObject($vResultado[$i]->id);
            }
        }

        return $vResultado;
    }

    public function create($Object)
    {
        //consulta sql
        $vSql = "Insert into object_item (seller_id, title, description, item_condition, status_id)" .
            "Values ('$Object->seller_id', '$Object->title', '$Object->description', '$Object->item_condition', '$Object->status_id')";

        //ejecutar consulta
        $idItem = $this->enlace->executeSQL_DML_last($vSql);

        foreach ($Object->categories as $value) {
            $sql = "Insert into object_category(object_id,category_id)" .
                " Values($idItem,$value)";
            $vResultadoGen = $this->enlace->executeSQL_DML($sql);
        }

        return $this->get($idItem);
    }

    public function hasActiveAuction($objectId)
    {
        $vSql = "SELECT COUNT(*) as total FROM auction 
             WHERE object_id = $objectId 
             AND status_id = 3";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0]->total > 0;
    }

    public function update($Object)
    {
        if ($this->hasActiveAuction($Object->id)) {
            return ["error" => "No se puede editar un objeto con subasta activa"];
        }

        $vSql = "UPDATE object_item SET seller_id = '$Object->seller_id'," .
            "title = '$Object->title', description = '$Object->description', item_condition = '$Object->item_condition'," .
            "status_id = '$Object->status_id' WHERE id=$Object->id";
        $this->enlace->executeSQL_DML($vSql);

        // Borrar categorías y reinsertar
        $vSql = "DELETE FROM object_category WHERE object_id = $Object->id";
        $this->enlace->executeSQL_DML($vSql);
        foreach ($Object->categories as $value) {
            $sql = "INSERT INTO object_category(object_id, category_id) VALUES($Object->id, $value)";
            $this->enlace->executeSQL_DML($sql);
        }

        // Borrar imágenes anteriores solo si viene imagen nueva
        if (isset($Object->has_new_image) && $Object->has_new_image) {
            $vSql = "DELETE FROM object_image WHERE object_id = $Object->id";
            $this->enlace->executeSQL_DML($vSql);
        }

        return $this->get($Object->id);
    }

    public function toggleStatus($id)
    {
        $current = $this->get($id);

        // Solo aplica restricción al desactivar (status 1 → 2)
        if ($current->status_id == 1) {
            if ($this->hasActiveAuction($id)) {
                return ["error" => "No se puede desactivar un objeto con subasta activa."];
            }
            $vSql = "SELECT COUNT(*) as total FROM auction WHERE object_id = $id;";
            $resultado = $this->enlace->ExecuteSQL($vSql);
            if ($resultado[0]->total > 0) {
                return ["error" => "No se puede desactivar un objeto que ha sido subastado anteriormente."];
            }
        }

        $vSql = "UPDATE object_item 
             SET status_id = CASE WHEN status_id = 1 THEN 2 ELSE 1 END 
             WHERE id = $id;";
        $this->enlace->executeSQL_DML($vSql);
        return $this->get($id);
    }

    /*public function delete($id)
    {
        // Verificar subasta activa
        if ($this->hasActiveAuction($id)) {
            return ["error" => "No se puede eliminar un objeto con subasta activa."];
        }

        // Verificar si alguna vez fue subastado
        $vSql = "SELECT COUNT(*) as total FROM auction WHERE object_id = $id;";
        $resultado = $this->enlace->ExecuteSQL($vSql);
        if ($resultado[0]->total > 0) {
            return ["error" => "No se puede eliminar un objeto que ha sido subastado anteriormente."];
        }

        // Cambiar a estado eliminado (status_id = 3)
        $vSql = "UPDATE object_item SET status_id = 3 WHERE id = $id;";
        $this->enlace->executeSQL_DML($vSql);
        return $this->get($id);
    }*/
}
