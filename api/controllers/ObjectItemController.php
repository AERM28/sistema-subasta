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

    //POST
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            //Instancia del modelo
            $item = new ObjectItemModel();
            //Acción del modelo a ejecutar
            $result = $item->create($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    public function update($param)
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputJSON = $request->getJSON();
            $inputJSON->id = $param;
            //Instancia del modelo
            $item = new ObjectItemModel();
            //Acción del modelo a ejecutar
            $result = $item->update($inputJSON);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    public function toggleStatus()
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();
            $object    = new ObjectItemModel();
            $result    = $object->toggleStatus($inputJSON->id);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    public function delete()
    {
        try {
            $request   = new Request();
            $response  = new Response();
            $inputJSON = $request->getJSON();
            $object    = new ObjectItemModel();
            $result    = $object->delete($inputJSON->id);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
