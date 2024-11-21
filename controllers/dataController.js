import Continent from '../models/continentModal.js';
import Country from '../models/countryModel.js';
import League from '../models/leagueModel.js';
import Fixture from '../models/fixtureModel.js';
import Team from '../models/teamModel.js';
import Player from '../models/playerModel.js';
import { fetchContinents, fetchCountries, fetchLeagues, fetchFixtures, fetchTeams, fetchPlayers } from '../services/sportMonkServices.js';

const saveContinents = async (req, res) => {
    try {
      const continents = await fetchContinents();
        
      if (!continents || !Array.isArray(continents)) {
        return res.status(400).json({ message: 'Invalid data received from API' });
      }
  
      const savedContinents = await Continent.insertMany(continents);
  
      res.status(200).json({ message: 'Continents saved successfully', data: savedContinents });
    } catch (error) {
      console.error('Error saving continents:', error.message);
      res.status(500).json({ message: 'Error saving continents', error: error.message });
    }
  };

  const getContinents = async (req, res) => {
    try {
        const continents = await Continent.find(); // Retrieve all continents
        res.status(200).json({ message: 'Continents fetched successfully', data: continents });
    } catch (error) {
        console.error('Error fetching continents:', error.message);
        res.status(500).json({ message: 'Error fetching continents', error: error.message });
    }
};

  
  

  const saveCountries = async (req, res) => {
    try {
      const countries = await fetchCountries();  // Fetch the countries data
  
      if (!countries || !Array.isArray(countries)) {
        return res.status(400).json({ message: 'Invalid data received from API' });
      }
  
      const savedCountries = await Country.insertMany(countries, { upsert: true });
  
      res.status(200).json({ message: 'Countries saved successfully', data: savedCountries });
    } catch (error) {
      console.error('Error saving countries:', error.message);
      res.status(500).json({ message: 'Error saving countries', error: error.message });
    }
  };

  const getCountries = async (req, res) => {
    try {
        const countries = await Country.find(); // Retrieve all countries
        res.status(200).json({ message: 'Countries fetched successfully', data: countries });
    } catch (error) {
        console.error('Error fetching countries:', error.message);
        res.status(500).json({ message: 'Error fetching countries', error: error.message });
    }
};


  const saveLeagues = async (req, res) => {
    try {
      const leagues = await fetchLeagues();  
  
      if (!leagues || !Array.isArray(leagues)) {
        return res.status(400).json({ message: 'Invalid data received from API' });
      }
  
      const savedLeagues = await League.insertMany(
        leagues.map(league => ({ ...league, data: league }))  
      );
  
      res.status(200).json({ message: 'Leagues saved successfully', data: savedLeagues });
    } catch (error) {
      console.error('Error saving leagues:', error.message);
      res.status(500).json({ message: 'Error saving leagues', error: error.message });
    }
  };

  const getLeagues = async (req, res) => {
    try {
        const leagues = await League.find(); // Retrieve all leagues
        res.status(200).json({ message: 'Leagues fetched successfully', data: leagues });
    } catch (error) {
        console.error('Error fetching leagues:', error.message);
        res.status(500).json({ message: 'Error fetching leagues', error: error.message });
    }
};


  const saveFixtures = async (req, res) => {
    try {
      const fixtures = await fetchFixtures();  // Fetch fixtures data
  
      if (!fixtures || !Array.isArray(fixtures)) {
        return res.status(400).json({ message: 'Invalid data received from API' });
      }
  
      // Save all fixtures directly as they are without mapping, including all data
      const savedFixtures = await Fixture.insertMany(
        fixtures.map(fixture => ({ ...fixture, data: fixture }))  // Save all data in 'data' field
      );
  
      res.status(200).json({ message: 'Fixtures saved successfully', data: savedFixtures });
    } catch (error) {
      console.error('Error saving fixtures:', error.message);
      res.status(500).json({ message: 'Error saving fixtures', error: error.message });
    }
  };

  const getFixtures = async (req, res) => {
    try {
        const fixtures = await Fixture.find(); // Retrieve all fixtures
        res.status(200).json({ message: 'Fixtures fetched successfully', data: fixtures });
    } catch (error) {
        console.error('Error fetching fixtures:', error.message);
        res.status(500).json({ message: 'Error fetching fixtures', error: error.message });
    }
};



  const saveTeams = async (req, res) => {
    try {
      const teams = await fetchTeams();
      
      if (!teams || !Array.isArray(teams)) {
        return res.status(400).json({ message: 'Invalid data received from API' });
      }
  
      const savedTeams = await Team.insertMany(
        teams.map(team => ({ ...team, data: team }))
      );
  
      res.status(200).json({ message: 'Teams saved successfully', data: savedTeams });
    } catch (error) {
      console.error('Error saving teams:', error.message);
      res.status(500).json({ message: 'Error saving teams', error: error.message });
    }
  };

  const getTeams = async (req, res) => {
    try {
        const teams = await Team.find(); // Retrieve all teams
        res.status(200).json({ message: 'Teams fetched successfully', data: teams });
    } catch (error) {
        console.error('Error fetching teams:', error.message);
        res.status(500).json({ message: 'Error fetching teams', error: error.message });
    }
};



  const savePlayers = async (req, res) => {
    try {
      // Fetch players data from the external API
      const players = await fetchPlayers();
      
      // Validate the data received
      if (!players || !Array.isArray(players)) {
        return res.status(400).json({ message: 'Invalid data received from API' });
      }
  
      // Save players to the database
      const savedPlayers = await Player.insertMany(
        players.map(player => ({ ...player, data: player }))
      );
  
      // Return success response
      res.status(200).json({ message: 'Players saved successfully', data: savedPlayers });
    } catch (error) {
      console.error('Error saving players:', error.message);
      res.status(500).json({ message: 'Error saving players', error: error.message });
    }
  };

  const getPlayers = async (req, res) => {
    try {
        const players = await Player.find(); // Retrieve all players
        res.status(200).json({ message: 'Players fetched successfully', data: players });
    } catch (error) {
        console.error('Error fetching players:', error.message);
        res.status(500).json({ message: 'Error fetching players', error: error.message });
    }
};

  
  
export { saveContinents, getContinents, saveCountries, getCountries, saveLeagues,getLeagues, saveFixtures, getFixtures, saveTeams, getTeams,  savePlayers, getPlayers };
