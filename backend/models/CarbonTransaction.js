const mongoose = require('mongoose');

const carbonTransactionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  emissionFactor: { type: mongoose.Schema.Types.ObjectId, ref: 'EmissionFactor', required: true },
  quantity: { type: Number, required: true },
  emissionKg: { type: Number },
  date: { type: Date, default: Date.now },
  source: { type: String, enum: ['manual', 'purchase', 'fleet', 'expense'], default: 'manual' },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scope: { type: String, enum: ['scope_1', 'scope_2', 'scope_3'], default: 'scope_1' },
  scope3Category: {
    type: String,
    enum: [
      'purchased_goods_services', 'capital_goods', 'fuel_energy_activities',
      'upstream_transportation', 'waste_generated', 'business_travel',
      'employee_commuting', 'upstream_leased_assets', 'downstream_transportation',
      'processing_of_sold_products', 'use_of_sold_products', 'end_of_life_treatment',
      'downstream_leased_assets', 'franchises', 'investments', 'other'
    ]
  },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }
}, { timestamps: true });

carbonTransactionSchema.pre('save', async function (next) {
  if (this.isModified('quantity') || this.isModified('emissionFactor')) {
    const factor = await mongoose.model('EmissionFactor').findById(this.emissionFactor);
    if (factor) {
      this.emissionKg = this.quantity * factor.factorValue;
    }
  }
  next();
});

module.exports = mongoose.model('CarbonTransaction', carbonTransactionSchema);
