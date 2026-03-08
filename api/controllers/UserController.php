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

    /* PUT /user/1 → actualizar nombre y correo */
    public function update($param)
    {
        try {
            $request  = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $inputJSON->id = $param;
            $user     = new UserModel();
            $result   = $user->update($inputJSON);
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
        }
    }

    /* PATCH /user/toggleStatus/1 → bloquear o activar */
    public function toggleStatus()
    {
        try {
            $request  = new Request();
            $response = new Response();
            $inputJSON = $request->getJSON();
            $user     = new UserModel();
            $result   = $user->toggleStatus($inputJSON->id);
            $response->toJSON($result);
        } catch (Exception $e) {
            handleException($e);
        }
    }
}
