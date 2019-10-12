<?php
  include('../../common/db.php');   

  class Job{
    protected $db;
    
    function __construct($db){
      $this->db = $db;
    }

    public function getJob($id){
      if($id == "all"){
        $query = "
          SELECT 
            j_id, 
            j_title, 
            j_code, 
            j_loc, 
            j_type
          FROM x_ag_jbs
          ORDER BY j_created DESC
        ";
        $res = $this->db->fetch($query)["data"];
      }else{
        $query = "SELECT * FROM x_ag_jbs WHERE j_id = '$id'";
        $res = $this->db->fetch($query)["data"][0];
      }
      return $res;
    }

    public function addJob($data){
      $jid = 'J'.Common::generateRand();
      if(
        $this->db->save("x_ag_jbs", array(
          "j_id"      => $jid,
          "j_code"    => $data["j_code"],
          "j_title"   => $data["j_title"],
          "j_desc"    => $data["j_desc"],
          "j_loc"     => $data["j_loc"],
          "j_type"    => $data["j_type"],
          "j_created" => date('Y-m-d H:i:s')
        ))
      ){
        Common::respond($this->getJob("all"), "Job created successfully.", true);        
      }else{
        Common::respond("", "There was an error creating job, please try again.", true);
      }
    }

    public function deleteJob($id){
      if(
        $this->db->delete('x_ag_jbs', array(
          "j_id" => $id
        ))
      ){
        Common::respond($this->getJob("all"), "Job deleted successfully.", true);
      }else{
        Common::respond("", "Job could not be deleted. Please try again.", false);
      }
    }
  }

  $job = new Job($db);

  switch ($params["t"]) {
    case 'getAllJobs':
      Common::respond($job->getJob("all"), "", true);
    break;  
    case 'getJob':
      Common::respond($job->getJob($params["d"]), "", true);
    break;
    case 'addJob':
      $job->addJob($params["d"]);      
    break;
    case 'deleteJob':
      $job->deleteJob($params["d"]);      
    break;      
  }
?>