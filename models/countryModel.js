import mongoose from 'mongoose';

const CountrySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  continent_id: { type: Number, required: true, ref: 'Continent' },
  iso: { type: String },
  // Add a field to store all other dynamic fields
  data: { type: mongoose.Schema.Types.Mixed }  // This allows saving arbitrary data as-is from the API
});

export default mongoose.model('Country', CountrySchema);
