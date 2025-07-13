import { Schema, model } from 'mongoose';

interface IImage {
  public_id: string;
  url: string;
  name: string;
  description: string;
  spec: string
  price: number | { currency: string; value: number };
}

const imageSchema = new Schema<IImage>({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  spec: { type: String },
  price: { type: Number},
});

const Image = model<IImage>('Image', imageSchema);

export default Image;
