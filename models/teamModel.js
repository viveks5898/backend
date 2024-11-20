import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },  // Unique identifier for the team
  name: { type: String, required: true },  // Team name
  country_id: { type: Number, required: true, ref: 'Country' },  // Reference to the Country model
  league_id: { type: Number , ref: 'League' },  // Reference to the League model
  data: { type: mongoose.Schema.Types.Mixed }  // Additional data related to the team (e.g., stats, logos)
});

export default mongoose.model('Team', TeamSchema);
