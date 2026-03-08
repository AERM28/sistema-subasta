<?php
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
}
