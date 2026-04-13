import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

export const uploadPrescription = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Prescription file is required' });
  }

  await User.findByIdAndUpdate(req.user._id, {
    $push: {
      prescriptionFiles: {
        fileName: req.file.filename,
        path: req.file.path,
      },
    },
  });

  return res.status(201).json({
    message: 'Prescription uploaded successfully',
    file: {
      fileName: req.file.filename,
      path: req.file.path,
    },
  });
};

export const verifyOrderPrescription = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.prescriptionVerified = true;
  await order.save();

  return res.status(200).json({ message: 'Prescription verified', order });
};
