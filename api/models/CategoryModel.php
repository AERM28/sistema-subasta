<?php
class CategoryModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todas las categorías */
    public function all()
    {
        $vSql = "SELECT * FROM category;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /* Obtener una categoría por id */
    public function get($id)
    {
        $vSql = "SELECT * FROM category WHERE id = $id;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    /* Obtener las categorías de un objeto */
    public function getCategoriesByObject($objectId)
    {
        $vSql = "SELECT c.id, c.name, c.description" .
                " FROM category c, object_category oc" .
                " WHERE c.id = oc.category_id" .
                " AND oc.object_id = $objectId;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }
}
