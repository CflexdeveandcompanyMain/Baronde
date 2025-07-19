import { Request, Response } from 'express';
import Cart from '../model/cart';
import Order from '../model/order';
import Image from '../model/image';

// PAYSTACK INTEGRATION CONFIG

export const initiateCheckout = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
     res.status(400).json({ message: 'Shipping address is required.' });
       return
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ message: 'Cart is empty.' });
       return
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product as any; // Cast to any to access product properties
      if (!product || product.price === undefined) {
       res.status(400).json({ message: `Product with ID ${item.product} not found or has no price.` });
        return 
      }
      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images, 
        },
        quantity: item.quantity,
        price: product.price,
      });
    }

 //PAYSTACK PAYYMENT INTENT 

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      orderStatus: 'pending',
      paymentDetails: {},
    });

    await newOrder.save();

    // For now, we'll just return the order details. In a real scenario, you'd return the client_secret
    res.status(200).json({
      status: 'success',
      message: 'Checkout initiated. Complete payment to confirm order.',
      data: newOrder,
      // clientSecret: paymentIntent.client_secret, // Uncomment for Stripe integration
    });

  } catch (error) {
    console.error('Initiate checkout error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const orders = await Order.find({ user: userId }).populate('items.product');

    if (!orders || orders.length === 0) {
     res.status(404).json({ message: 'No orders found for this user.' });
      return 
    }

    res.status(200).json({ status: 'success', message: 'Orders fetched successfully', data: orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const order = await Order.findOne({ _id: id, user: userId }).populate('items.product');

    if (!order) {
      res.status(404).json({ message: 'Order not found or does not belong to this user.' });
       return
    }

    res.status(200).json({ status: 'success', message: 'Order fetched successfully', data: order });
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      res.status(400).json({ message: 'Order status is required.' });
       return
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ message: 'Order not found.' });
       return
    }

    order.orderStatus = orderStatus;
    await order.save();

    res.status(200).json({ status: 'success', message: 'Order status updated successfully', data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
