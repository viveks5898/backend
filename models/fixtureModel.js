import mongoose from 'mongoose';

const FixtureSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  season_id: { type: Number,  },
  league_id: { type: Number,  },
  country_id: { type: Number,  },
  status: { type: String,  },
  home_team_id: { type: Number,  },
  away_team_id: { type: Number,  },
  home_score: { type: Number },
  away_score: { type: Number },
  match_date: { type: Date },
  data: { type: mongoose.Schema.Types.Mixed }, // Store all other dynamic fields as "data"
  payload: {
    type: Object, // Stores JSON data
},

});

export default mongoose.model('Fixture', FixtureSchema);
