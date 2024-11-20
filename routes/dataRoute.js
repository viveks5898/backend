import express from 'express';
import { saveContinents, saveCountries, saveFixtures, saveLeagues, savePlayers, saveTeams} from '../controllers/dataController.js';

const router = express.Router();

router.post('/continents', saveContinents);
router.post('/countries', saveCountries);
router.post('/leagues', saveLeagues);
router.post('/fixture', saveFixtures);
router.post('/teams', saveTeams);
router.post('/players', savePlayers);



export default router;
