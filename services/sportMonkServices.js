import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';  
import Fixture from '../models/fixtureModel.js';

dotenv.config();  

// Load environment variables
const API_BASE_URL = process.env.API_URL || 'https://api.sportmonks.com/v3';  
const LEAGUES_API_URL = process.env.LEAGUES_API_URL;
const FIXTURES_API_URL = process.env.FIXTURES_API_URL;
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
const fetchFixtures = async () => {
    try {
        const response = await axios.request({ ...axiosConfig, url: FIXTURES_API_URL });
        console.log("Fixtures response:", response.data);
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
  const fetchTeamStatistics = async (teamId, seasonId) => {
    try {
        const response = await axios.request({ 
            ...axiosConfig, 
            url: `https://api.sportmonks.com/v3/my/filters/entity?api_token=${API_TOKEN}&team_id=${teamId}&season_id=${seasonId}&has_values=true`
        });
        console.log("Filtered Team Statistics:", response.data);
        return response.data.data;  // Return the filtered team statistics
    } catch (error) {
        console.error('Error fetching filtered team statistics:', error.response ? error.response.data : error.message);
        throw new Error('Error fetching filtered team statistics');
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


const generatePayload = async (leagueId, seasonId) => {
    try {
        // First, fetch the fixtures
        const fixtures = await fetchFixturesByLeagueId(leagueId);

        // Then, fetch the team statistics
        const teamStats = await fetchTeamStatistics(seasonId);

        const payload = await Promise.all(
            fixtures.map(async (fixture) => {
                const { name, starting_at, league_id } = fixture;

                const [team1Name, team2Name] = name.split(' vs ');
                const team1Stats = teamStats.find(stat => stat.team.name === team1Name);
                const team2Stats = teamStats.find(stat => stat.team.name === team2Name);

                // Fetch player statistics for both teams
                const team1Players = await fetchPlayerStatistics(team1Stats.team.id);
                const team2Players = await fetchPlayerStatistics(team2Stats.team.id);

                const playerStats = [...team1Players, ...team2Players].map(player => ({
                    name: player.fullname,
                    recent_goals: player.statistics.goals,
                    assists: player.statistics.assists,
                    minutes_played: player.statistics.minutes
                }));

                return {
                    match_info: {
                        team1: team1Name,
                        team2: team2Name,
                        competition: league_id,
                        match_date: starting_at
                    },
                    team_stats: {
                        team1: team1Stats.statistics,
                        team2: team2Stats.statistics
                    },
                    player_stats: playerStats,
                    betting_odds: {}  // Add betting odds data if necessary
                };
            })
        );

        console.log("Generated Payload:", payload);

        // Save the payload to the fixture table
        const newFixture = new Fixture({ payload });
        await newFixture.save();

        console.log('Payload saved to fixture table successfully');
        return payload;
    } catch (error) {
        console.error('Error generating payload:', error.message);
        throw new Error('Error generating payload');
    }
};





export { fetchContinents, fetchCountries, fetchLeagues, getLeaguesByCountryId, fetchFixtures, fetchTeamStatistics, fetchPlayerStatistics, fetchFixturesByLeagueId, fetchTeams, fetchPlayers };
