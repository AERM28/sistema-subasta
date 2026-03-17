<?php
class ObjectImageModel
{
    private $upload_path = 'uploads/';
    private $valid_extensions = array('jpeg', 'jpg', 'png', 'gif', 'webp');

    public $enlace;

    public function __construct()
    {
        $this->enlace = new MySqlConnect();
    }

    public function uploadFile($object)
    {
        $file     = $object['file'];
        $objectId = $object['object_id'];

        $fileName  = $file['name'];
        $tempPath  = $file['tmp_name'];
        $fileSize  = $file['size'];
        $fileError = $file['error'];

        if (!empty($fileName)) {
            $fileExt    = explode('.', $fileName);
            $fileActExt = strtolower(end($fileExt));
            $fileName   = "object-" . uniqid() . "." . $fileActExt;

            if (in_array($fileActExt, $this->valid_extensions)) {
                if (!file_exists($this->upload_path . $fileName)) {
                    if ($fileSize < 2000000 && $fileError == 0) {
                        if (move_uploaded_file($tempPath, $this->upload_path . $fileName)) {
                            $sql = "INSERT INTO object_image (object_id, image) 
                                    VALUES ($objectId, '$fileName')";
                            $vResultado = $this->enlace->executeSQL_DML($sql);
                            if ($vResultado > 0) {
                                return 'Imagen creada';
                            }
                            return false;
                        }
                    }
                }
            }
        }
    }

    public function getByObject($objectId)
    {
        $vSql = "SELECT * FROM object_image WHERE object_id = $objectId";
        $vResultado = $this->enlace->ExecuteSQL($vSql);
        if (!empty($vResultado)) {
            return $vResultado;
        }
        return [];
    }
}
