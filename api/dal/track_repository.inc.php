<?php
require_once("./model/track.inc.php");
require_once("./model/track_score.inc.php");

class TrackRepository
{

    private $dbh;

    function __construct()
    {

        $config = require("./config.inc.php");

        $user = $config["db_user"];
        $pass = $config["db_password"]; 
        $connectionString = "mysql:host={$config["db_host"]};port={$config["db_port"]};dbname={$config["db_database"]}";

        $this->dbh = new PDO($connectionString, $user, $pass);
        // $this->dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    function __destruct() 
    {
        $this->dbh = null;
    }

    public function GetAllTracks()
    {
        $tracks = array();
        $sql = "SELECT id, guid, name, sortorder, file FROM track ORDER BY sortorder";
        
        $stmt = $this->dbh->query($sql);
        $stmt->setFetchMode(PDO::FETCH_CLASS, 'Track');
        while ($track = $stmt->fetch()) {
            $tracks[] = $track;
        }
        $stmt = null;
        return $tracks;
    }

    public function GetTrackByGuid($guid)
    {
        $track = null;
        $sql = "SELECT id, guid, name, sortorder, file FROM track WHERE guid=:guid";
        $stmt = $this->dbh->prepare($sql);
        $stmt->bindValue(':guid', "{$guid}");
        $stmt->execute();
        $stmt->setFetchMode(PDO::FETCH_CLASS, 'Track');
        while ($trackItem = $stmt->fetch()) {
            $track = $trackItem;
        }
        $stmt = null;
        return $track;
    }

    public function GetTrackHiScoresByGuid($trackGuid, $limit)
    {
        $intLimit = (int)$limit;
        $sql = "SELECT ts.guid, ts.name, time, time_finished, time_started FROM track_score ts JOIN track ON track.id = ts.track_id WHERE track.guid=:trackguid AND time_finished IS NOT NULL AND ts.name IS NOT NULL AND ts.name <> '' ORDER BY time ASC LIMIT {$limit}";
        $stmt = $this->dbh->prepare($sql);
        $stmt->bindValue(':trackguid', $trackGuid);
        // $stmt->bindValue(':limit', $limit);
        $stmt->execute();
        $trackScores = $this->QueryHiScores($stmt);
        $stmt = null;
        return $trackScores;
    }

    public function GetTrackHiScoresByTrackId($trackId, $limit)
    {
        $intLimit = (int)$limit;
        $sql = "SELECT ts.guid, ts.name, time, time_finished, time_started FROM track_score ts JOIN track ON track.id = ts.track_id WHERE track.id=:trackId AND time_finished IS NOT NULL AND ts.name IS NOT NULL AND ts.name <> '' ORDER BY time ASC LIMIT {$limit}";
        $stmt = $this->dbh->prepare($sql);
        $stmt->bindValue(':trackId', $trackId);
        // $stmt->bindValue(':limit', $limit);
        $stmt->execute();
        $trackScores = $this->QueryHiScores($stmt);
        $stmt = null;
        return $trackScores;
    }

    private function QueryHiScores($stmt) 
    {
        $trackScores = array();
        $stmt->setFetchMode(PDO::FETCH_CLASS, 'TrackScore');
        while ($trackScore = $stmt->fetch()) {
            $trackScores[] = $trackScore;
        }
        return $trackScores;
    }

    public function AddTrackScore($trackId) 
    {

        $sql = "INSERT INTO track_score (guid, track_id) VALUES (:guid, :trackid)";

        $stmt = $this->dbh->prepare($sql);
        $stmt->bindValue(':guid', $this->createGUID());
        $stmt->bindValue(':trackid', $trackId);
        $result = $stmt->execute();

        $insertedId = $this->dbh->lastInsertId();
        return $insertedId;
    }

    public function SaveTrackScore($trackScore) 
    {
        $sql = "UPDATE track_score SET time=:time, time_finished=:time_finished, name=:name WHERE guid=:guid;";
        $stmt = $this->dbh->prepare($sql);
        $stmt->bindValue(':guid', $trackScore->guid);
        $stmt->bindValue(':time', $trackScore->time);
        $stmt->bindValue(':time_finished', $trackScore->time_finished);
        $stmt->bindValue(':name', $trackScore->name);
        $result = $stmt->execute();
    }

    public function GetTrackScoreById($id)
    {
        $trackScore = null;
        $sql = "SELECT guid, time_started, time_finished, time, track_id FROM track_score WHERE id=:id";

        try {
            $stmt = $this->dbh->prepare($sql);
            $stmt->execute([':id' => $id]);

            $stmt->setFetchMode(PDO::FETCH_CLASS, 'TrackScore');

            while ($trackScoreItem = $stmt->fetch()) {
                $trackScore = $trackScoreItem;
            }
        } catch(Exception $exc) {
            throw new Exception("Error looking up track-score by id. ", 500, $exc);
        }
        
        return $trackScore;
    }

    public function GetTrackScoreByGuid($guid)
    {
        $trackScore = null;
        $sql = "SELECT guid, time_started, time_finished, time, track_id FROM track_score WHERE guid=:guid";
        try {
            $stmt = $this->dbh->prepare($sql);
            $stmt->execute([':guid' => $guid]);

            $stmt->setFetchMode(PDO::FETCH_CLASS, 'TrackScore');

            while ($trackScoreItem = $stmt->fetch()) {
                $trackScore = $trackScoreItem;
            }
        } catch(Exception $exc) {
            throw new Exception("Error looking up track-score by guid. ", 500, $exc);
        }
        
        return $trackScore;
    }

    public function GetRanking($trackScore)
    {
        $sql = "SELECT (COUNT(*) + 1) AS ranking FROM track_score WHERE time <= :time AND track_id=:trackId AND time_finished IS NOT NULL AND name IS NOT NULL AND name <> '' LIMIT 1";
        $stmt = $this->dbh->prepare($sql);
        $stmt->bindValue(':time', $trackScore->time);
        $stmt->bindValue(':trackId', $trackScore->track_id);
        $stmt->execute();

        $stmt->setFetchMode(PDO::FETCH_LAZY);
        $result = $stmt->fetch();

        return $result->ranking;
    }

    private function createGUID()
    {
        if (function_exists('com_create_guid'))
        {
            return com_create_guid();
        }
        else
        {
            mt_srand((double)microtime() * 10000);
            $charid = strtoupper(md5(uniqid(rand(), true)));
            $hyphen = chr(45);// "-"
            // $uuid = chr(123)// "{"
            $uuid = substr($charid, 0, 8).$hyphen
                .substr($charid, 8, 4).$hyphen
                .substr($charid,12, 4).$hyphen
                .substr($charid,16, 4).$hyphen
                .substr($charid,20,12);
                // .chr(125);// "}"
            return $uuid;
        }
    }
}