<?php
class user
{
    public function index()
    {
        try {
            $response = new Response();
            $user     = new UserModel();
            $result   = $user->all();
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
            $user     = new UserModel();
            $result   = $user->get($param);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* GET /user/getUserDetail/1 → perfil completo con historial de pujas y subastas */
    public function getUserDetail($id)
    {
        try {
            $response = new Response();
            $user     = new UserModel();
            $result   = $user->getUserDetail($id);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }
}
