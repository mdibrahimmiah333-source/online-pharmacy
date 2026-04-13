import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: '' },
    manufacturer: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    requiresPrescription: { type: Boolean, default: false },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Medicine = mongoose.model('Medicine', medicineSchema);
