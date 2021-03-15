<?php
require_once('./dal/track_repository.inc.php');

$response = "";
$repo = new TrackRepository();

$action = $_GET["action"];

switch($action) 
{
    case "list": 
    {
        $tracks = $repo->GetAllTracks();
        $response = json_encode($tracks);
        
        break;
    }
    case "hiscores":
    {
        $trackGuid = trim($_GET["track"]);
        // must be valid guid
        if($trackGuid != "" &&
            preg_match('/^\{?[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}\}?$/i', $trackGuid)) 
        {
            $trackScores = $repo->GetTrackHiScoresByGuid($trackGuid, 10);
            $response = json_encode($trackScores);
        }
        break;
    }
    case "startgame": 
    {
        $trackGuid = trim($_GET["track"]);
        // must be valid guid
        if($trackGuid != "" &&
            preg_match('/^\{?[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}\}?$/i', $trackGuid))
        {
            $track = $repo->GetTrackByGuid($trackGuid);
            if($track != null)
            {
                $trackScoreId = $repo->AddTrackScore($track->id);
                $trackScore = $repo->GetTrackScoreById($trackScoreId);
                $response = "{ \"guid\": \"{$trackScore->guid}\" }" ;
            }
            
        }
        break;
    }
    case "finishgame":
    {
        $trackScoreGuid = trim($_GET["game"]);
        $completedTime = $_GET["time"];
        if($trackScoreGuid != "" && 
            preg_match('/^\{?[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}\}?$/i', $trackScoreGuid)) 
        {
            $trackScore = $repo->GetTrackScoreByGuid($trackScoreGuid);
            if($trackScore->time > 0) 
            {
                // TODO: Return error
            }
            else
            {
                $trackScore->time = (float)$completedTime;
                $trackScore->time_finished = strtotime('now');
                $repo->SaveTrackScore($trackScore);

                $ranking = $repo->GetRanking($trackScore);
                $response = "{ \"guid\": \"{$trackScore->guid}\", \"ranking\": \"{$ranking}\" }" ;
            }

        }
        break;
    }
    case "setplayername": 
    {
        $hiscoreListLength = 10;

        $trackScoreGuid = trim($_GET["game"]);
        $playerName = trim($_GET["playername"]);
        if($trackScoreGuid != "" && 
            preg_match('/^\{?[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}\}?$/i', $trackScoreGuid) &&
            $playerName != "") 
        {
            $trackScore = $repo->GetTrackScoreByGuid($trackScoreGuid);
            $ranking = $repo->GetRanking($trackScore);
            if ($ranking <= $hiscoreListLength)
            {
                $trackScore->name = $playerName;
                $repo->SaveTrackScore($trackScore);
            }
            $trackScores = $repo->GetTrackHiScoresByTrackId($trackScore->track_id, $hiscoreListLength);
            $response = json_encode($trackScores);
        }
        break;
    }
}

header("Content-Type: text/json");
echo($response);