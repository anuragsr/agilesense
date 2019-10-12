<?php

  header('Access-Control-Allow-Origin: *');
  header('Access-Control-Allow-Headers: Content-Type');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
  
  // $env = "prod";
  $env = "local";
  if($env == "local"){
    define("DB_HOST", "localhost");
    define("DB_USER", "root");
    define("DB_PASS", " ");
    define("DB_NAME", "x_agile_9301");
  }else{
    define("DB_HOST", "localhost");
    define("DB_USER", "agilesen_aacuser");
    define("DB_PASS", "aacuser10234");
    define("DB_NAME", "agilesen_user_9301");
  }

  class Common{
      
    public static function sendEmail($type, $data){
      // $to = "anurag.131092@gmail.com";
      $to = "agile@agilesense.co.za, anurag.131092@gmail.com";
      $headers = "MIME-Version: 1.0" . "\r\n";
      $headers.= "Content-type:text/html;charset=UTF-8" . "\r\n";
      $headers.= "From: Agile Sense Admin <webmaster@agilesense.co.za>";
      $txt = "<div style='font-size: 0.85rem;'>Hello, Agile Sense<br/>";

      switch($type){
        case "edit":
          $subject = "New CV Submission / Update";
          $txt.= "<br/>A user has updated his CV / details.";
          $txt.= " Below are the updated details:<br/>";
          $txt.= "<br/><b>Name : </b>".$data['u_name']."<br/><br/>";
          $txt.= "<b>Email : </b>".$data['u_email']."<br/><br/>";
          $txt.= "<b>Availability : </b>".$data['u_avail']."<br/><br/>";
          $txt.= "<b>General Comments : </b>".$data['u_comm']."<br/><br/>";
          if(count($data["up_data"])){            
            $url = "http://".$_SERVER['SERVER_NAME'].":".$_SERVER['SERVER_PORT']."/services/careers/";
            $url.= $data["up_data"]["files"][0];
            $txt.= "<a href=".$url.">Download CV Here</a><br/>";
          }
        break;
        
        case "refer":
          $subject = "New Referral";
          $txt.= "<br/>A user has submitted a referral.";
          $txt.= " Below are the referral details:<br/>";
          $txt.= "<br/><b>Referred By</b><br/>".$data['u_name']."<br/><br/>";
          $txt.= "<b>Name</b><br/>".$data['r_name']."<br/><br/>";
          $txt.= "<b>Email</b><br/>".$data['r_email']."<br/><br/>";
          $txt.= "<b>Availability</b><br/>".$data['r_avail']."<br/><br/>";
          $txt.= "<b>How do you know this person?</b><br/>".$data['r_how']."<br/><br/>";
          $txt.= "<b>Does the person know you have referred them?</b><br/>".($data['r_know']?"Yes":"No")."<br/><br/>";
        break;

        case "contact":
          $subject = "New Information Enquiry";
          $txt.= "<br/>There is a new information enquiry.";
          $txt.= " Below are the request details:<br/>";
          $txt.= "<br/><b>Name</b><br/>".$data['name']."<br/><br/>";
          $txt.= "<b>Email</b><br/>".$data['email']."<br/><br/>";
          $txt.= "<b>Phone</b><br/>".$data['ph']."<br/><br/>";
          $txt.= "<b>Designation / Title</b><br/>".$data['title']."<br/><br/>";
          $txt.= "<b>Organisation</b><br/>".$data['org']."<br/><br/>";
          $txt.= "<b>Query</b><br/>".$data['message']."<br/><br/>";
        break;

        // case "contact-ge":
        //   $subject = "New General Enquiry";
        //   $txt.= "<br/>There is a new general enquiry.";
        //   $txt.= " Below are the enquiry details:<br/>";
        //   $txt.= "<br/><b>Name</b><br/>".$data['name']."<br/><br/>";
        //   $txt.= "<b>Email</b><br/>".$data['email']."<br/><br/>";
        //   $txt.= "<b>Message</b><br/>".$data['message']."<br/><br/>";          
        // break;
      }

      $txt.= "Thanks and Regards,<br/>";
      $txt.= "Agile Sense Admin</div>";
      return mail($to, $subject, $txt, $headers);
    }

    public static function respond($data, $message, $result){
      echo json_encode(array(
        "data" => $data,
        "message" => $message,
        "result" => $result
      ));
    }

    public static function makeDir($path){     
      return mkdir($path, 0755, true);
    }

    public static function upload($files, $path){
      $res = true;
      $pathArr = array();

      foreach ($files as $key => $file){
        $res = $res && move_uploaded_file($file["tmp_name"], $path.$file["name"]);
        $pathArr[] = ltrim($path.rawurlencode($file["name"]), "./");
      }
      return array(
        "res" => $res,
        "files" => $pathArr,
      );
    }

    public static function generateRand($length = 5) {
      $characters = '0123456789';
      $charactersLength = strlen($characters);
      $randomString = '';
      for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
      }
      return $randomString;
    }

    public static function normalizeFiles($files = array()) {
      $normalized_array = array();
      foreach($files as $index => $file) {
        if (!is_array($file['name'])) {
          $normalized_array[$index][] = $file;
          continue;
        }
        foreach($file['name'] as $idx => $name) {
          $normalized_array[$index][$idx] = array(
            'name' => $name,
            'type' => $file['type'][$idx],
            'tmp_name' => $file['tmp_name'][$idx],
            'error' => $file['error'][$idx],
            'size' => $file['size'][$idx]
          );
        }
      }
      return $normalized_array;
    }

    public static function getDirContents($dir){
      $files = array_diff(scandir($dir, 1), array('.', '..'));
      $ret = array();
      $i = 0;
      foreach ($files as $key => $value){
        $path = $dir."/".$value;
        $ret[$i]["name"] = $value;
        $ret[$i]["path"] = $path;
        $ret[$i]["dlPath"] = substr($path, 3);
        $i++;
      }
      return $ret;
    }
  }  

  class DBUtil extends mysqli{
    function __construct($h, $u, $p, $d){
      parent::__construct($h, $u, $p, $d);
    }

    public function fetch($q){
      $m = array("result" => false, "data" => array());
      $r = $this->query($q);
      if ($r->num_rows > 0) {
        $arr = array();
        while($row = $r->fetch_assoc()) {
          $arr[] = $row;
        }
        $m["result"] = true;
        $m["data"] = $arr;
      }
      return $m;
    }

    public function save($table, $fields){
      $length = count($fields);
      $refArr = array();
      $values = "";
      $q = "";
      $i = 0;

      foreach ($fields as $key => &$ref){
        if($i < $length - 1){
          $values.= "$key, ";
          $q.= "?, ";
        }else{
          $values.= "$key";          
          $q.= "?";
        }
        $refArr[] = &$ref; 
        $i++;
      }
      
      unset($ref);
      $str  = "INSERT INTO $table ( ".$values." ) VALUES ( ".$q." )";
      $stmt = $this->prepare($str);

      call_user_func_array(
        array($stmt, "bind_param"),
        array_merge(array(str_repeat("s", $length)), $refArr)
      );

      return $stmt->execute();
    }

    public function edit($table, $fields, $conditions){
      $length = count($fields);
      $clength = count($conditions);
      $refArr = array();
      $values = "";
      $conds = "";
      $i = 0;

      foreach ($fields as $key => &$ref){
        if($i < $length - 1){
          $values.= "$key = ?, ";
        }else{
          $values.= "$key = ?";          
        }
        $refArr[] = &$ref;
        $i++;
      }

      $i = 0;
      foreach ($conditions as $key => &$ref){
        if($i == 0){
          $conds.= "$key = ? ";
        }else{
          $conds.= "AND $key = ? ";
        }
        $refArr[] = &$ref;
        $i++;
      }
      unset($ref);
      
      $str  = "UPDATE $table SET ".$values." WHERE ".$conds;
      $stmt = $this->prepare($str);

      $length+= $clength;
      call_user_func_array(
        array($stmt, "bind_param"),
        array_merge(array(str_repeat("s", $length)), $refArr)
      );

      return $stmt->execute();
    }

    public function delete($table, $conditions){
      $i = 0;
      $conds = "";

      foreach ($conditions as $key => $value){
        if($i == 0){
          $conds.= "$key = '$value' ";
        }else{
          $conds.= "AND $key = '$value' ";
        }
        $i++;
      }
      $q = "DELETE FROM $table WHERE ".$conds;
      return $this->query($q);
    }
  }

  $db = new DBUtil(DB_HOST, DB_USER, DB_PASS, DB_NAME);
  if($db->connect_error){
    die("Connection failed: " . $db->connect_error);
  }
  $db->query("SET NAMES 'utf8'");

  $params = json_decode($_REQUEST["params"], true);
  $files  = Common::normalizeFiles($_FILES);
?>