import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';  
import Fixture from '../models/fixtureModel.js';
import moment from "moment"


dotenv.config();  

// Load environment variables
const API_BASE_URL = process.env.API_URL || 'https://api.sportmonks.com/v3';  
const LEAGUES_API_URL = process.env.LEAGUES_API_URL;
const FIXTURES_API_URL = 'https://api.sportmonks.com/v3/football/fixtures/between';
const API_TOKEN = process.env.SPORT_MONK_TOKEN;
const TEAMS_API_URL = process.env.TEAMS_API_URL;
const PLAYERS_API_URL = process.env.PLAYERS_API_URL;





if (!API_TOKEN) {
    throw new Error('API token is not set in environment variables');
}

const agent = process.env.NODE_ENV === 'development' ? new https.Agent({  
    rejectUnauthorized: false 
}) : undefined;

const axiosConfig = {
    method: 'get',
    maxBodyLength: Infinity,
    headers: { 
        'Content-Type': 'application/json', 
        'Accept': 'application/json', 
        'Authorization': API_TOKEN
    },
    httpsAgent: agent, 
};

// fetch Continents

const fetchContinents = async () => {
    try {
        const response = await axios.request({ ...axiosConfig, url: `${API_BASE_URL}/core/continents` });
        console.log("Continents response:", response.data);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching continents:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching continents');
    }
};

// Fetch Countries
const fetchCountries = async () => {
    try {
        const response = await axios.request({ ...axiosConfig, url: `${API_BASE_URL}/core/countries` });
        console.log("Countries response:", response.data);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching countries:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching countries');
    }
};

// Fetch Leagues
const fetchLeagues = async () => {
    try {
        const response = await axios.request({ ...axiosConfig, url: LEAGUES_API_URL });
        console.log("Leagues response:", response.data);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching leagues:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching leagues');
    }
};

// Fetch Leagues by Country ID
const getLeaguesByCountryId = async (countryId) => {
    try {
        const response = await axios.request({
            ...axiosConfig,
            url: `${API_BASE_URL}/football/leagues/countries/${countryId}`,  // URL with dynamic countryId
        });
        console.log("Leagues by Country ID response:", response.data);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching leagues by country ID:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching leagues by country ID');
    }
};


// Fetch Fixtures
// const fetchFixtures = async () => {
//     try {
//         const response = await axios.request({ ...axiosConfig, url: FIXTURES_API_URL });
//         console.log("Fixtures response:", response.data);
//         return response.data.data;
//     } catch (error) {
//         console.error('Error fetching fixtures:', error.response ? error.response.data : error.message);
//         throw new Error('Error fetching fixtures');
//     }
// };

const fetchFixtures = async () => {
    try {
        // Get current date (startDate) and next day (endDate)
        const startDate = moment().format('YYYY-MM-DD');  // Today
        const endDate = moment().add(1, 'days').format('YYYY-MM-DD');  // Tomorrow

        // Construct the URL with startDate and endDate
        const url = `${FIXTURES_API_URL}/${startDate}/${endDate}?include=participants`;

        console.log(url, "url")

        // Make the request to the API
        const response = await axios.request({ ...axiosConfig, url });
        console.log("Fixtures response:", response.data);
        
        // Return the fixtures data from the API response
        return response.data.data;
    } catch (error) {
        console.error('Error fetching fixtures:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching fixtures');
    }
};


const fetchFixturesByLeagueId = async (leagueId) => {
    try {
        // Fetch the fixtures for the given league ID
        const response = await axios.request({ 
            ...axiosConfig, 
            url: `${API_BASE_URL}/football/fixtures/latest/?league_id=${leagueId}` 
        });

        console.log("Fixtures by League response:", response.data);

        // If fixtures are returned, we process them for payload generation
        const fixtures = response.data.data;
        
        if (fixtures && fixtures.length > 0) {
            // Call the generatePayload function to create and save the payload
            await generatePayload(leagueId, fixtures[0].season_id);
        }

        return fixtures;  // Return the fixtures data
    } catch (error) {
        console.error('Error fetching fixtures by league ID:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching fixtures by league ID');
    }
};



// Fetch Team Statistics
const fetchTeamStatistics = async (teamId) => {
    try {
        const url = `https://api.sportmonks.com/v3/football/teams/${teamId}?api_token=${API_TOKEN}&include=statistics.details.type`;
        const response = await axios.get(url);
        const stats = response.data.data.statistics; // This is an array of statistics objects
        return stats; // Return relevant team statistics
    } catch (error) {
        console.error(`Error fetching statistics for team ID ${teamId}:`, error.message);
        throw new Error('Error fetching team statistics');
    }
};




const fetchPlayerStatistics = async (teamId) => {
    try {
        const response = await axios.request({
            ...axiosConfig,
            url: `${API_BASE_URL}/football/players?filters=teamId:${teamId}`
        });
        console.log("Player Statistics response:", response.data);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching player statistics:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching player statistics');
    }
};


  

const fetchTeams = async () => {
    try {
        const response = await axios.request({ ...axiosConfig, url: TEAMS_API_URL });
        console.log("Teams response:", response.data);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching teams:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching teams');
    }
};


const fetchPlayers = async () => {
    try {
        const response = await axios.request({ ...axiosConfig, url: PLAYERS_API_URL });
        console.log("Players response:", response.data);
        return response.data.data;  // Assuming players data is in the 'data' field of the response
    } catch (error) {
        console.error('Error fetching players:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching players');
    }
};

const generatePayload = async (req, res) => {
    try {
        const { fixtureId } = req.params;

        console.log('Received fixtureId:', fixtureId);

        const fixtureIdInt = parseInt(fixtureId, 10);

        if (isNaN(fixtureIdInt)) {
            return res.status(400).json({ error: "Invalid fixture ID" });
        }

        // Query the database for the fixture with the given fixtureId
        const fixtureDoc = await Fixture.findOne({ id: fixtureIdInt });

        console.log('Fixture document found:', fixtureDoc);

        if (!fixtureDoc) {
            return res.status(404).json({ error: "Fixture not found" });
        }

        // Destructure data from fixtureDoc
        const { 
            data: { match_info, team_stats, player_stats, betting_odds }, 
            league_id 
        } = fixtureDoc;

        if (!match_info || !team_stats || !player_stats || !betting_odds) {
            return res.status(400).json({ error: "Incomplete fixture data" });
        }

        // Destructure match_info
        const { team1, team2, competition, match_date } = match_info;

        // Validate the existence of team_stats for both teams
        const team1Stats = team_stats.team1 || {};
        const team2Stats = team_stats.team2 || {};

        // Construct match_info
        const matchInfo = {
            team1,
            team2,
            competition,
            match_date,
        };

        // Construct team_stats payload
        const teamStats = {
            team1: {
                recent_form: team1Stats.recent_form || ["W", "D", "W", "L", "W"],
                goals_scored: team1Stats.goals_scored || 18,
                goals_conceded: team1Stats.goals_conceded || 7,
                matches_played: team1Stats.matches_played || 5,
                average_goals_per_match: team1Stats.average_goals_per_match || 3.6,
                home_record: team1Stats.home_record || { wins: 8, draws: 1, losses: 1 },
                head_to_head: team1Stats.head_to_head || { wins: 4, losses: 3, draws: 3 },
            },
            team2: {
                recent_form: team2Stats.recent_form || ["L", "W", "D", "L", "W"],
                goals_scored: team2Stats.goals_scored || 12,
                goals_conceded: team2Stats.goals_conceded || 10,
                matches_played: team2Stats.matches_played || 5,
                average_goals_per_match: team2Stats.average_goals_per_match || 2.4,
                away_record: team2Stats.away_record || { wins: 4, draws: 2, losses: 4 },
                head_to_head: team2Stats.head_to_head || { wins: 3, losses: 4, draws: 3 },
            },
        };

        // Betting odds can be directly used
        const playerStats = player_stats;

        const bettingOdds = betting_odds;

        // Construct the final payload
        const payload = {
            match_info: matchInfo,
            team_stats: teamStats,
            player_stats: playerStats,
            betting_odds: bettingOdds,
        };

        const saveResult = await savePayload(fixtureId, payload);

        if (!saveResult.success) {
            return res.status(500).json({ error: saveResult.error });
        }


        // console.log("Generated Payload:", JSON.stringify(payload, null, 2));

        // Return the payload as the response
        return res.json(payload);

    } catch (error) {
        console.error('Error generating payload:', error.message);
        return res.status(500).json({ error: 'Error generating payload' });
    }
};



// Fetch competition name based on league_id
const fetchCompetitionName = async (leagueId) => {
    try {
        const competitionData = await axios.get(`https://api.sportmonks.com/v3/football/leagues/${leagueId}?api_token=${API_TOKEN}`);
        return competitionData.data.data.name; // Assuming the competition name is under 'data.name'
    } catch (error) {
        console.error('Error fetching competition name:', error.message);
        return 'Unknown Competition'; // Fallback in case of an error
    }
};








export { fetchContinents, fetchCountries, fetchLeagues, getLeaguesByCountryId, fetchFixtures, fetchTeamStatistics, generatePayload, fetchPlayerStatistics, fetchFixturesByLeagueId, fetchTeams, fetchPlayers };
