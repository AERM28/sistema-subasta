<?php

use Firebase\JWT\JWT;

class UserModel
{
    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    /* Listar todos los usuarios */
    public function all()
    {
        $vSql = "SELECT u.*, r.name AS role_name, us.name AS status_name" .
            " FROM user u, role r, user_status us" .
            " WHERE u.role_id = r.id" .
            " AND u.status_id = us.id" .
            " ORDER BY u.full_name DESC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    public function get($id)
    {
        $vSql = "SELECT u.*, r.name AS role_name, us.name AS status_name" .
            " FROM user u, role r, user_status us" .
            " WHERE u.role_id = r.id" .
            " AND u.status_id = us.id" .
            " AND u.id = $id;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    public function getUserDetail($id)
    {
        $bidModel     = new BidModel();
        $auctionModel = new AuctionModel();

        $vSql = "SELECT u.*, r.name AS role_name, us.name AS status_name," .
            " (SELECT COUNT(*) FROM bid b WHERE b.bidder_id = u.id) AS total_bids_placed," .
            " (SELECT COUNT(*) FROM auction a WHERE a.created_by = u.id) AS total_auctions_created" .
            " FROM user u, role r, user_status us" .
            " WHERE u.role_id = r.id" .
            " AND u.status_id = us.id" .
            " AND u.id = $id;";

        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (!empty($vResultado)) {
            $vResultado = $vResultado[0];
            $vResultado->bid_history     = $bidModel->getByBidder($id);
            $vResultado->auction_history = $auctionModel->getBySeller($id);
        }

        return $vResultado;
    }

    // Para editar perfil
    public function update($objeto)
    {
        $sql = "UPDATE user SET" .
            " full_name = '$objeto->full_name'," .
            " email = '$objeto->email'" .
            " WHERE id = $objeto->id";

        $this->enlace->executeSQL_DML($sql);
        return $this->get($objeto->id);
    }

    // Para bloquear/activar
    public function toggleStatus($id)
    {
        $sql = "UPDATE user 
            SET status_id = CASE WHEN status_id = 1 THEN 2 ELSE 1 END 
            WHERE id = $id";
        $this->enlace->executeSQL_DML($sql);
        return $this->get($id);
    }

    public function login($objeto)
    {
        $vSql = "SELECT * FROM user WHERE email='$objeto->email'";
        $vResultado = $this->enlace->ExecuteSQL($vSql);

        if (is_object($vResultado[0])) {
            $user = $vResultado[0];
            if (password_verify($objeto->password, $user->password)) {
                $usuario = $this->get($user->id);
                if (!empty($usuario)) {
                    if ($usuario->status_id != 1) {
                        return false;
                    }
                    $data = [
                        'id'        => $usuario->id,
                        'email'     => $usuario->email,
                        'full_name' => $usuario->full_name,
                        'rol'       => $usuario->role_name,
                        'iat'       => time(),
                        'exp'       => time() + 3600
                    ];
                    $jwt_token = JWT::encode($data, config::get('SECRET_KEY'), 'HS256');
                    return $jwt_token;
                }
            }
        } else {
            return false;
        }
    }

    public function create($objeto)
    {
        if (isset($objeto->password) && $objeto->password != null) {
            $crypt = password_hash($objeto->password, PASSWORD_BCRYPT);
            $objeto->password = $crypt;
        }

        $vSql = "INSERT INTO user (full_name, email, password, role_id, status_id)" .
            " VALUES ('$objeto->full_name', '$objeto->email', '$objeto->password', $objeto->role_id, 1)";
        //                                                                         

        $vResultado = $this->enlace->executeSQL_DML_last($vSql);
        return $this->get($vResultado);
    }
}
