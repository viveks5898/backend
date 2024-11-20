import mongoose from 'mongoose';

const LeagueSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  country_id: { type: Number, required: true, ref: 'Country' },
  data: { type: mongoose.Schema.Types.Mixed }  
});

export default mongoose.model('League', LeagueSchema);
