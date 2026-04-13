import { Medicine } from '../models/Medicine.js';

export const createMedicine = async (req, res) => {
  const medicine = await Medicine.create(req.body);
  return res.status(201).json(medicine);
};

export const getMedicines = async (req, res) => {
  const { q, category, requiresPrescription } = req.query;
  const filter = {};

  if (q) {
    filter.$or = [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
      { manufacturer: { $regex: q, $options: 'i' } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (typeof requiresPrescription !== 'undefined') {
    filter.requiresPrescription = requiresPrescription === 'true';
  }

  const medicines = await Medicine.find(filter).sort({ createdAt: -1 });
  return res.status(200).json(medicines);
};

export const getMedicineById = async (req, res) => {
  const medicine = await Medicine.findById(req.params.id);
  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  return res.status(200).json(medicine);
};

export const updateMedicine = async (req, res) => {
  const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  return res.status(200).json(medicine);
};

export const deleteMedicine = async (req, res) => {
  const medicine = await Medicine.findByIdAndDelete(req.params.id);

  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  return res.status(200).json({ message: 'Medicine deleted successfully' });
};
