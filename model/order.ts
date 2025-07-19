import { Schema, model, Document, Types } from 'mongoose';

interface IOrderItem {
  product: object; // A snapshot of the product data
  quantity: number;
  price: number; // Price at the time of purchase
}

interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  orderStatus: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  paymentDetails: {
    paymentId: string;
    paymentMethod: string;
  };
  createdAt: Date;
}

const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: Object, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  paymentDetails: {
    paymentId: { type: String },
    paymentMethod: { type: String, default: 'Stripe' }, // Or another provider
  },
}, { timestamps: true });

export default model<IOrder>('Order', OrderSchema);