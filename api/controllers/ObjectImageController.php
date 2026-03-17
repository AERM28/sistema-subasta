<?php
//class Genre
class objectimage{
    //POST Crear
    public function create()
    {
        try {
            $request = new Request();
            $response = new Response();
            //Obtener json enviado
            $inputFILE = $request->getBody();
            //Instancia del modelo
            $imagen = new ObjectImageModel();
            //Acción del modelo a ejecutar
            $result = $imagen->uploadFile($inputFILE);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }
    public function get($id)
    {
        try {
            $response = new Response();
            $imagen = new ObjectImageModel();
            $result = $imagen->getByObject($id);
            //Dar respuesta
            $response->toJSON($result);
        } catch (Exception $e) {
            $response->toJSON($result);
            handleException($e);
            
        }
    }
}