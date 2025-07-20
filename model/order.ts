import { Schema, model, Document, Types } from 'mongoose';

interface IOrderItem {
  product: Types.ObjectId; // Reference to the Product model
  quantity: number;
  price: number; // Price at the time of purchase
}

// Interface for the structure of payment details from Paystack
interface IPaymentDetails {
  reference?: string;
  status?: string;
  gatewayResponse?: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId; // Explicitly type the _id
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
  paymentDetails?: IPaymentDetails; 
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Image', required: true },
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
    reference: { type: String },
    status: { type: String },
    gatewayResponse: { type: String },
  },
}, { timestamps: true });

export default model<IOrder>('Order', OrderSchema);