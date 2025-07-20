import { Response } from 'express';
import axios from 'axios';
import Cart from '../model/cart';
import Order from '../model/order';
import { IAuthRequest, IPopulatedProduct } from '../interface/types';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_TEST_SECRET_KEY;
const PAYSTACK_API_URL = 'https://api.paystack.co';

const CALLBACK_URL = process.env.PAYSTACK_CALLBACK_URL || 'http://localhost:3000/order/v1/verify-payment';
const FRONTEND_SUCCESS_URL = process.env.FRONTEND_SUCCESS_URL || 'http://localhost:5173/payment-success';
const FRONTEND_FAILED_URL = process.env.FRONTEND_FAILED_URL || 'http://localhost:5173/payment-failed';

export const initiateCheckout = async (req: IAuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
     res.status(400).json({ message: 'Shipping address is required.' });
       return
    }

    const cart = await Cart.findOne({ user: userId }).populate<{ items: { product: IPopulatedProduct, quantity: number }[] }>('items.product');

    if (!cart || cart.items.length === 0) {
      res.status(400).json({ message: 'Cart is empty.' });
       return
    }

    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      const product = item.product;
      if (!product || typeof product.price !== 'number') {
        throw new Error(`Product with ID ${item.product} not found or has no price.`);
      }
      totalAmount += product.price * item.quantity;
      return {
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      orderStatus: 'pending',
    });

    await newOrder.save();

    const paystackData = {
      email: userEmail,
      amount: totalAmount * 100, 
      callback_url: CALLBACK_URL,
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId,
      },
    };

    const response = await axios.post(`${PAYSTACK_API_URL}/transaction/initialize`, paystackData, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    newOrder.paymentDetails = { reference: response.data.data.reference };
    await newOrder.save();

    res.status(200).json({
      status: 'success',
      message: 'Checkout initiated. Redirect to payment gateway.',
      data: {
        authorization_url: response.data.data.authorization_url,
      }
    });

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Paystack API error:', error.response?.data);
     res.status(error.response?.status || 500).json({ message: 'Error initializing payment', details: error.response?.data });
       return
    }
    console.error('Initiate checkout error:', error);
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const verifyPayment = async (req: IAuthRequest, res: Response) => {
    try {
        const { reference } = req.query;

        if (!reference || typeof reference !== 'string') {
           res.status(400).redirect(FRONTEND_FAILED_URL + '?error=no_reference');
             return
        }

        const response = await axios.get(`${PAYSTACK_API_URL}/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const { status, data } = response.data;

        if (status && data.status === 'success') {
            const orderId = data.metadata.orderId;
            const order = await Order.findById(orderId);

            if (order) {
                order.orderStatus = 'paid';
                order.paymentDetails = {
                    reference: data.reference,
                    status: data.status,
                    gatewayResponse: data.gateway_response,
                };
                await order.save();

                await Cart.findOneAndDelete({ user: order.user });

                res.redirect(FRONTEND_SUCCESS_URL + `?orderId=${orderId}`);
                 return
            } else {
                 res.redirect(FRONTEND_FAILED_URL + `?error=order_not_found`);
                  return
            }
        } else {
            return res.redirect(FRONTEND_FAILED_URL + `?error=payment_failed`);
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Paystack verification error:', error.response?.data);
            res.status(error.response?.status || 500).redirect(FRONTEND_FAILED_URL + '?error=verification_failed');
             return
        }
        console.error('Payment verification error:', error);
        res.status(500).redirect(FRONTEND_FAILED_URL + '?error=server_error');
    }
};

export const getOrders = async (req: IAuthRequest, res: Response) => {
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
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const getOrderById = async (req: IAuthRequest, res: Response) => {
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
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};

export const updateOrderStatus = async (req: IAuthRequest, res: Response) => {
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
    res.status(500).json({ message: 'Server error', error: (error as Error).message });
  }
};
