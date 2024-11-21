import express from 'express';
import { getContinents, getCountries, getFixtures, getLeagues, getPlayers, getTeams, saveContinents, saveCountries, saveFixtures, saveLeagues, savePlayers, saveTeams} from '../controllers/dataController.js';

const router = express.Router();

// POST routes for saving data
router.post('/continents', saveContinents);
router.post('/countries', saveCountries);
router.post('/leagues', saveLeagues);
router.post('/fixture', saveFixtures);
router.post('/teams', saveTeams);
router.post('/players', savePlayers);

// GET routes for retrieving data
router.get('/continents', getContinents);
router.get('/countries', getCountries);
router.get('/leagues', getLeagues);
router.get('/fixture', getFixtures);
router.get('/teams', getTeams);
router.get('/players', getPlayers);

export default router;
