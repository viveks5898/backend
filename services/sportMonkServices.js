import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';  

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
      const response = await axios.request({ 
        ...axiosConfig, 
        url: `${API_BASE_URL}/football/fixtures/league/${leagueId}` 
      });
      console.log("Fixtures by League response:", response.data);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching fixtures by league ID:', error.response ? error.response.data : error.message);
      throw new Error('Error fetching fixtures by league ID');
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


export { fetchContinents, fetchCountries, fetchLeagues, getLeaguesByCountryId, fetchFixtures, fetchFixturesByLeagueId, fetchTeams, fetchPlayers };
