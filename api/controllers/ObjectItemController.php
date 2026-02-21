<?php
class objectitem
{
    public function index()
    {
        try {
            $response = new Response();
            $object   = new ObjectItemModel();
            $result   = $object->all();
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    public function get($param)
    {
        try {
            $response = new Response();
            $object   = new ObjectItemModel();
            $result   = $object->get($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /objectitem/getObjectDetail/1 → objeto con imágenes, categorías e historial de subastas */
    public function getObjectDetail($id)
    {
        try {
            $response = new Response();
            $object   = new ObjectItemModel();
            $result   = $object->getObjectDetail($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /objectitem/getByCategory/2 → objetos de una categoría */
    public function getByCategory($categoryId)
    {
        try {
            $response = new Response();
            $object   = new ObjectItemModel();
            $result   = $object->getByCategory($categoryId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /objectitem/getBySeller/3 → objetos de un vendedor */
    public function getBySeller($sellerId)
    {
        try {
            $response = new Response();
            $object   = new ObjectItemModel();
            $result   = $object->getBySeller($sellerId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
