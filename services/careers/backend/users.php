<?php
  include('../../common/db.php');
  
  class User{
    protected $db;
    
    function __construct($db){
      $this->db = $db;
    }

    public function getUser($id, $r){
      $query = "SELECT * FROM x_ag_usr WHERE u_id = '$id'";
      $ret = $this->db->fetch($query)["data"][0];
      if($r == "usr"){        
        $ret["u_avail"] = intval($ret["u_avail"]);
        $ret["u_files"] = Common::getDirContents("../upload/".$ret["u_id"]);
      }
      return $ret;
    }

    public function addUser($input){
      $uid = 'U'.Common::generateRand();
      if(
        $this->db->save("x_ag_usr", array(
          "u_id"       => $uid,
          "u_name"     => $input["n"],
          "u_email"    => $input["e"],
          "u_avail"    => 0,
          "u_comm"     => "",
          "u_reg_date" => date('Y-m-d H:i:s')
        ))
        &&
        $this->db->save("x_ag_lgn", array(            
          "l_id"   => $input["e"],
          "l_pass" => md5($input["p"]),
          "l_role" => "usr"
        ))
        &&
        Common::makeDir("../upload/".$uid)
      ){
        Common::respond("", "You have registered succesfully. Please login using your email and password.", true);
      }else{
        Common::respond("", "There was an error registering, please try again.", true);
      }
    }

    public function editUser($user, $files){
      $up  = array();
      $res = $this->db->edit(
        "x_ag_usr", 
        array(
          "u_name"  => $user["u_name"],
          "u_email" => $user["u_email"],
          "u_avail" => $user["av"]["id"],
          "u_comm"  => $user["u_comm"]
        ),
        array( "u_id" => $user["u_id"] )
      );

      if(count($files)){
        $up = Common::upload($files["files"], "../upload/".$user["u_id"]."/");
        $res = $res && $up["res"];
      }
      
      if($res){
        $ret = $this->getUser($user["u_id"], "usr");
        $ret["mail"] = Common::sendEmail(
          "edit",
          array(
            "u_avail" => $user["av"]["value"],
            "u_name"  => $user["u_name"],
            "u_email" => $user["u_email"],
            "u_comm"  => $user["u_comm"],
            "up_data" => $up
          )
        );
        Common::respond($ret, "Your details have been saved with us. We will revert as soon as we have relevant news for you.", true);
      }else{
        Common::respond("", "There was an error in submission. Please try again.", false);
      }
    }

    public function checkIfExists($email){
      $u      = $email;
      $query  =  "
        SELECT l_id FROM x_ag_lgn
        WHERE l_id = '$u'
        AND l_role = 'usr'
      ";
      $result = $this->db->fetch($query);
      return $result["result"];
    }

    public function signUp($input){
      // Check if given email exists
      if($this->checkIfExists($input["e"])){
        // If given email exists, error saying exists
        Common::respond($input["e"], "The chosen email already exists. Please use another one.", false);
      }else{
        // If given email doesn't exist, create the user
        $this->addUser($input);        
      }
    }

    public function login($input){
      $u      = $input["e"];
      $p      = md5($input["p"]);
      $r      = $input["r"];
      $query  =  "
        SELECT x_ag_usr.u_id
        FROM x_ag_lgn
        INNER JOIN x_ag_usr
        ON x_ag_lgn.l_id = x_ag_usr.u_email
        WHERE x_ag_lgn.l_id = '$u'
        AND x_ag_lgn.l_pass = '$p'
        AND x_ag_lgn.l_role = '$r'
      ";
      $result = $this->db->fetch($query);
      if($result["result"]){
        Common::respond($this->getUser($result["data"][0]["u_id"], $r), "", true);
      }else{
        Common::respond("", "Wrong email / password combination. Please check and try again.", false);
      }
    }

    public function refer($ref){
      if(
        $this->db->save("x_ag_rfr", array(
          "ref_by"    => $ref["by"],
          "ref_name"  => $ref["r_name"],
          "ref_email" => $ref["r_email"],
          "ref_ph"    => $ref["r_ph"],
          "ref_skill" => $ref["sk"]["value"],
          "ref_av"    => $ref["av"]["value"],
          "ref_how"   => $ref["r_hw"],
          "ref_know"  => $ref["r_knw"],
          "ref_date"  => date('Y-m-d H:i:s')
        ))
      ){
        Common::sendEmail(
          "refer",          
          array(
            "u_name"  => $ref["u_name"],
            "r_name"  => $ref["r_name"],
            "r_email" => $ref["r_email"],
            "r_avail" => $ref["av"]["value"],
            "r_how"   => $ref["r_hw"],
            "r_know"  => $ref["r_knw"],
          )
        );
        Common::respond("", "You have successfully referred ".$ref["r_name"].". We will revert as soon as we have an opening." , true);
      }else{
        Common::respond("", "There was an error in referring. Please check and try again.", false);
      }
    }      
  }

  $user = new User($db);
  
  switch ($params["t"]) {
    case 'login':
      $user->login($params["d"]);
    break;  
    case 'signup':
      $user->signUp($params["d"]);    
    break;
    case 'update':
      $user->editUser($params["d"], $files);    
    break;
    case 'refer':
      $user->refer($params["d"]);
    break;
  }

?>