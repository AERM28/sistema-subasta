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
        $vSql = "SELECT u.id, u.email, u.full_name, r.name AS role_name, us.name AS status_name, u.date_created," .
                " (SELECT COUNT(*) FROM auction a WHERE a.created_by = u.id) AS total_auctions_created," .
                " (SELECT COUNT(*) FROM bid b WHERE b.bidder_id = u.id) AS total_bids_placed" .
                " FROM user u, role r, user_status us" .
                " WHERE u.role_id = r.id" .
                " AND u.status_id = us.id" .
                " ORDER BY u.full_name ASC;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado;
    }

    /* Obtener usuario por id */
    public function get($id)
    {
        $vSql = "SELECT u.id, u.email, u.full_name, r.name AS role_name, us.name AS status_name, u.date_created," .
                " (SELECT COUNT(*) FROM auction a WHERE a.created_by = u.id) AS total_auctions_created," .
                " (SELECT COUNT(*) FROM bid b WHERE b.bidder_id = u.id) AS total_bids_placed" .
                " FROM user u, role r, user_status us" .
                " WHERE u.role_id = r.id" .
                " AND u.status_id = us.id" .
                " AND u.id = $id;";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        return $vResultado[0];
    }

    /* Detalle completo: info del usuario + historial de pujas + historial de subastas creadas */
    public function getUserDetail($id)
    {
        $bidModel     = new BidModel();
        $auctionModel = new AuctionModel();

        $vSql = "SELECT u.id, u.email, u.full_name, r.name AS role_name, us.name AS status_name, u.date_created," .
                " (SELECT COUNT(*) FROM auction a WHERE a.created_by = u.id) AS total_auctions_created," .
                " (SELECT COUNT(*) FROM bid b WHERE b.bidder_id = u.id) AS total_bids_placed" .
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
}
