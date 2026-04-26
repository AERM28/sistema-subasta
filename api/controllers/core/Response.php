<?php

class Response
{
    private $status = 200;

    public function status(int $code)
    {
        $this->status = $code;
        return $this;
    }

    public function toJSON($response = [], $message = "")
    {
        // Array vacío o null = éxito sin resultados (200), NO un error
        if ($response === [] || $response === null) {
            $json = [
                "success" => true,
                "status"  => 200,
                "message" => $message ?: "Solicitud exitosa",
                "data"    => []
            ];
            $this->status = 200;

        // Caso éxito con datos
        } elseif (!empty($response)) {
            $json = [
                "success" => true,
                "status"  => 200,
                "message" => $message ?: "Solicitud exitosa",
                "data"    => $response
            ];
            $this->status = 200;

        // Caso error interno (false, string de error, etc.)
        } else {
            $json = [
                "success" => false,
                "status"  => 500,
                "message" => $message ?: "Error interno del servidor",
                "error"   => [
                    "code"    => "INTERNAL_ERROR",
                    "details" => "Ocurrió un error inesperado"
                ]
            ];
            $this->status = 500;
        }

        http_response_code($this->status);
        echo json_encode($json, JSON_UNESCAPED_UNICODE);
    }
}