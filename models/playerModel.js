import mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String,  },
  country_id: { type: Number, ref: 'Country' },  // Reference to Country model
  team_id: { type: Number, ref: 'Team' },  // Reference to Team model
  league_id: { type: Number, ref: 'League' },  // Reference to League model
  position: { type: String },
  data: { type: mongoose.Schema.Types.Mixed },  // Store all player data in 'data' field
});

export default mongoose.model('Player', PlayerSchema);
