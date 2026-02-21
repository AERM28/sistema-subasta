<?php
class category
{
    public function index()
    {
        try {
            $response = new Response();
            $category = new CategoryModel();
            $result   = $category->all();
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
            $category = new CategoryModel();
            $result   = $category->get($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
