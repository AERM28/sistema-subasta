<?php
// Composer autoloader
require_once 'vendor/autoload.php';

/* Encabezados CORS */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");
header('Content-Type: application/json');

/* --- Clases core */
require_once "controllers/core/Config.php";
require_once "controllers/core/HandleException.php";
require_once "controllers/core/Logger.php";
require_once "controllers/core/MySqlConnect.php";
require_once "controllers/core/Request.php";
require_once "controllers/core/Response.php";

/* --- Middleware */
require_once "middleware/AuthMiddleware.php";

/* --- Modelos */
require_once "models/CategoryModel.php";
require_once "models/ObjectImageModel.php";
require_once "models/ObjectItemModel.php";
require_once "models/AuctionModel.php";
require_once "models/BidModel.php";
require_once "models/AuctionResultModel.php";
require_once "models/PaymentModel.php";
require_once "models/UserModel.php";

/* --- Controladores */
require_once "controllers/CategoryController.php";
require_once "controllers/ObjectItemController.php";
require_once "controllers/ObjectImageController.php";
require_once "controllers/AuctionController.php";
require_once "controllers/BidController.php";
require_once "controllers/AuctionResultController.php";
require_once "controllers/PaymentController.php";
require_once "controllers/UserController.php";

/* --- Enrutador */
require_once "routes/RoutesController.php";
$index = new RoutesController();
$index->index();
