const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    name: { type: String, required: true },
    season: { type: String },
    soilCompatibility: [{ type: String }],
    growingTimeDays: { type: Number },
    waterRequirement: { type: String },
    expectedProfitPerHectare: { type: Number }
});

module.exports = mongoose.model('Crop', cropSchema);
