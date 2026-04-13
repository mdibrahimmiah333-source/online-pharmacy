import { Cart } from '../models/Cart.js';
import { Medicine } from '../models/Medicine.js';
import { Order } from '../models/Order.js';

export const checkout = async (req, res) => {
  const { shippingAddress, paymentMethod = 'cod' } = req.body;

  if (!shippingAddress) {
    return res.status(400).json({ message: 'shippingAddress is required' });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.medicine');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const items = [];

  for (const item of cart.items) {
    const medicine = await Medicine.findById(item.medicine._id);

    if (!medicine) {
      return res.status(404).json({ message: `Medicine ${item.medicine._id} not found` });
    }

    if (medicine.stock < item.quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${medicine.name}` });
    }

    medicine.stock -= item.quantity;
    await medicine.save();

    items.push({
      medicine: medicine._id,
      name: medicine.name,
      quantity: item.quantity,
      price: medicine.price,
      requiresPrescription: medicine.requiresPrescription,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 500 ? 0 : 40;
  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + shippingFee + tax).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    payment: {
      method: paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'paid',
      transactionId: '',
    },
    subtotal,
    shippingFee,
    tax,
    total,
    prescriptionVerified: !items.some((item) => item.requiresPrescription),
  });

  cart.items = [];
  await cart.save();

  return res.status(201).json({ message: 'Checkout successful', order });
};
