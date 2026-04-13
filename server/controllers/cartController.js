import { Cart } from '../models/Cart.js';
import { Medicine } from '../models/Medicine.js';

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.medicine');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate('items.medicine');
  }

  return cart;
};

export const getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  return res.status(200).json(cart);
};

export const addToCart = async (req, res) => {
  const { medicineId, quantity = 1 } = req.body;

  if (!medicineId) {
    return res.status(400).json({ message: 'medicineId is required' });
  }

  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((item) => item.medicine._id.toString() === medicineId);

  if (existing) {
    existing.quantity += Number(quantity);
    existing.priceAtAdd = medicine.price;
  } else {
    cart.items.push({
      medicine: medicine._id,
      quantity: Number(quantity),
      priceAtAdd: medicine.price,
    });
  }

  await cart.save();
  const updated = await cart.populate('items.medicine');
  return res.status(200).json(updated);
};

export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || Number(quantity) < 1) {
    return res.status(400).json({ message: 'quantity must be at least 1' });
  }

  const cart = await getOrCreateCart(req.user._id);
  const targetItem = cart.items.find(
    (item) => item.medicine._id.toString() === req.params.medicineId
  );

  if (!targetItem) {
    return res.status(404).json({ message: 'Item not found in cart' });
  }

  targetItem.quantity = Number(quantity);
  await cart.save();
  const updated = await cart.populate('items.medicine');
  return res.status(200).json(updated);
};

export const removeCartItem = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((item) => item.medicine._id.toString() !== req.params.medicineId);
  await cart.save();
  const updated = await cart.populate('items.medicine');
  return res.status(200).json(updated);
};

export const clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  return res.status(200).json(cart);
};
