import Continent from '../models/continentModal.js';
import Country from '../models/countryModel.js';
import League from '../models/leagueModel.js';
import Fixture from '../models/fixtureModel.js';
import Team from '../models/teamModel.js';
import Player from '../models/playerModel.js';
import { fetchContinents, fetchCountries, fetchLeagues, getLeaguesByCountryId, fetchFixtures, fetchTeams, fetchPlayers, fetchFixturesByLeagueId } from '../services/sportMonkServices.js';
// const moment = require('moment');


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

const fetchLeaguesByCountryId = async (req, res) => {
    const { countryId } = req.params;  // Extract countryId from route parameters
    try {
        const leagues = await getLeaguesByCountryId(countryId);  // Fetch leagues using the service
        res.status(200).json({ message: 'Leagues fetched successfully by country', data: leagues });
    } catch (error) {
        console.error('Error fetching leagues by country ID:', error.message);
        res.status(500).json({ message: 'Error fetching leagues by country', error: error.message });
    }
};



const saveFixturesToDB = async () => {
  try {
    // Fetch the fixtures data from the external API
    const fixtures = await fetchFixtures();
    
    // If fixtures are invalid or not an array, throw an error
    if (!fixtures || !Array.isArray(fixtures)) {
      throw new Error('Invalid data received from API');
    }

    // Upsert fixtures into the database (update if exists, insert if new)
    const fixturePromises = fixtures.map(async (fixture) => {
      return Fixture.updateOne(
        { id: fixture.id }, // Query by fixture id
        { $set: { ...fixture, data: fixture } }, // Update fields (use $set to avoid overwriting entire document)
        { upsert: true } // Insert new document if it doesn't exist
      );
    });

    // Wait for all upserts to complete
    await Promise.all(fixturePromises);
    
    console.log('Fixtures saved/updated successfully');
  } catch (error) {
    console.error('Error saving fixtures:', error.message);
    throw new Error('Error saving fixtures');
  }
};


// Express route handler - call saveFixturesToDB() and handle response
const saveFixtures = async (req, res) => {
  try {
    await saveFixturesToDB();
    res.status(200).json({ message: 'Fixtures saved/updated successfully' });
  } catch (error) {
    // console.error('Error saving fixtures:', error.message);
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

// const getFixturesByLeagueId = async (req, res) => {
//     try {
//       const { leagueId } = req.params; // Get league ID from route parameter
//       const fixtures = await fetchFixturesByLeagueId(leagueId);
      
//       if (!fixtures || fixtures.length === 0) {
//         return res.status(404).json({ message: 'No fixtures found for this league' });
//       }
      
//       res.status(200).json({ message: 'Fixtures fetched successfully', data: fixtures });
//     } catch (error) {
//       console.error('Error fetching fixtures by league ID:', error.message);
//       res.status(500).json({ message: 'Error fetching fixtures by league ID', error: error.message });
//     }
//   };
  
const getFixtureByLeagueId = async (req, res) => {
  console.log("hello");
  try {
    const { leagueId } = req.params;  // Get leagueId from the request parameters

    console.log(leagueId, "leagueId");

    // Fetch fixtures based on leagueId
    const fixtures = await Fixture.find({
      league_id: leagueId,  // Match the leagueId
      // starting_at: { $gte: moment().toISOString() }  // Optional condition for future matches
    });

    console.log(fixtures, "fixturess");

    if (!fixtures || fixtures.length === 0) {
      return res.status(404).json({ message: 'No fixtures found for this league' });
    }

    // Extract the name and starting time of each fixture from the nested 'data' field
    const matchDetails = fixtures.map(fixture => {
      // Access the data field which contains the actual fixture details
      const fixtureData = fixture.data;

      // Return the name and starting_at (and any other desired fields)
      return {
        name: fixtureData.name,
        starting_at: fixtureData.starting_at,
      };
    });

    res.status(200).json({
      message: 'Fixtures found',
      data: matchDetails,
    });
  } catch (error) {
    console.error('Error retrieving fixtures:', error.message);
    res.status(500).json({ message: 'Error retrieving fixtures', error: error.message });
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

  
  
export { saveContinents, getContinents, saveCountries, getCountries, saveLeagues,getLeagues, fetchLeaguesByCountryId, saveFixtures, saveFixturesToDB, getFixtures, getFixtureByLeagueId, saveTeams, getTeams,  savePlayers, getPlayers };
