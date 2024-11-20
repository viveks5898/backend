import mongoose from 'mongoose';

const ContinentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
});

export default mongoose.model('Continent', ContinentSchema);
