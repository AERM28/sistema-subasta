<?php
class objectimage
{
    public function index()
    {
        try {
            $response = new Response();
            $image    = new ObjectImageModel();
            $result   = $image->all();
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
            $image    = new ObjectImageModel();
            $result   = $image->get($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /objectimage/getByObject/1 → imágenes de un objeto */
    public function getByObject($objectId)
    {
        try {
            $response = new Response();
            $image    = new ObjectImageModel();
            $result   = $image->getByObject($objectId);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
