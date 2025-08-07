import { Request, Response } from 'express';
import Order from '../model/order';
import { usermodel } from '../model/user';
import { IAuthRequest } from '../interface/types';

export const getUsersWithOrders = async (req: IAuthRequest, res: Response) => {
  try {
    const users = await usermodel.find().select('-password -otp -loginAttempts -lockUntil');

    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user._id }).populate('items.product');
        return {
          user,
          orders,
        };
      })
    );

    res.status(200).json({
      status: 'success',
      message: 'Users and their orders fetched successfully',
      data: usersWithOrders,
    });
  } catch (error) {
    console.error('Get users with orders error:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getTotalRevenue = async (req: IAuthRequest, res: Response) => {
  try {
    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Total revenue fetched successfully',
      data: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    });
  } catch (error) {
    console.error('Get total revenue error:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getTotalOrders = async (req: IAuthRequest, res: Response) => {
  try {
    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      status: 'success',
      message: 'Total number of orders fetched successfully',
      data: totalOrders,
    });
  } catch (error) {
    console.error('Get total orders error:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
