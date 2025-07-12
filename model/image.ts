import { Schema, model } from 'mongoose';

interface IImage {
  public_id: string;
  url: string;
}

const imageSchema = new Schema<IImage>({
  public_id: { type: String, required: true },
  url: { type: String, required: true },
});

const Image = model<IImage>('Image', imageSchema);

export default Image;
