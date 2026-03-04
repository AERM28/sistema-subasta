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
        $imagenA = new ObjectImageModel();
        $categoriaA = new CategoryModel();
        $vSql = "SELECT oi.*, os.name AS status_name, u.full_name AS seller_name" .
            " FROM object_item oi, object_status os, user u" .
            " WHERE oi.status_id = os.id" .
            " AND oi.seller_id = u.id" .
            " ORDER BY oi.date_created DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if (!empty($vResultado) && is_array($vResultado)) {
            for ($i = 0; $i < count($vResultado); $i++) {
                // Convertir objeto a array para que json_encode lo serialice bien
                $vResultado[$i] = (array) $vResultado[$i];
                $vResultado[$i]['imagen'] = $imagenA->getByObject($vResultado[$i]['id']);
                $vResultado[$i]['categoria'] = $categoriaA->getCategoriesByObject($vResultado[$i]['id']);
            }
        }
        return $vResultado;
    }

    /* Obtener un objeto por id */
    public function get($id)
    {
        $vSql = "SELECT oi.*, os.name AS status_name, u.full_name AS seller_name" .
            " FROM object_item oi, object_status os, user u" .
            " WHERE oi.status_id = os.id" .
            " AND oi.seller_id = u.id" .
            " AND oi.id = $id;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    /* Obtener detalle completo del objeto: categorías, imágenes e historial de subastas */
    public function getObjectDetail($id)
    {
        $categoryModel = new CategoryModel();
        $imageModel    = new ObjectImageModel();
        $auctionModel  = new AuctionModel();

        $vSql = "SELECT oi.*, os.name AS status_name, u.full_name AS seller_name" .
            " FROM object_item oi, object_status os, user u" .
            " WHERE oi.status_id = os.id" .
            " AND oi.seller_id = u.id" .
            " AND oi.id = $id;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!empty($vResultado)) {
            $vResultado = $vResultado[0];
            $vResultado->categories      = $categoryModel->getCategoriesByObject($id);
            $vResultado->images          = $imageModel->getByObject($id);
            $vResultado->auction_history = $auctionModel->getByObject($id);
        }
        return $vResultado;
    }

    /* Obtener objetos por categoría */
    public function getByCategory($categoryId)
    {
        $vSql = "SELECT oi.*, os.name AS status_name, u.full_name AS seller_name" .
            " FROM object_item oi, object_status os, user u, object_category oc" .
            " WHERE oi.status_id = os.id" .
            " AND oi.seller_id = u.id" .
            " AND oi.id = oc.object_id" .
            " AND oc.category_id = $categoryId;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /* Obtener objetos de un vendedor */
    public function getBySeller($sellerId)
    {
        $vSql = "SELECT oi.*, os.name AS status_name" .
            " FROM object_item oi, object_status os" .
            " WHERE oi.status_id = os.id" .
            " AND oi.seller_id = $sellerId;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }
}
