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
}