<?php
class ObjectImageModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todas las imágenes */
    public function all()
    {
        $vSql = "SELECT * FROM object_image;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /* Obtener una imagen por id */
    public function get($id)
    {
        $vSql = "SELECT * FROM object_image WHERE id = $id;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    /* Obtener todas las imágenes de un objeto */
    public function getByObject($objectId)
    {
        $vSql = "SELECT * FROM object_image WHERE object_id = $objectId;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }
}
