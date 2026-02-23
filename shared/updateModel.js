import mongoose from 'mongoose';

const updateSchema = new mongoose.Schema({
  lastUpdated: Date
});

const Update = mongoose.model('Update', updateSchema);

export default Update;