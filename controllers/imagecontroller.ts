import { Request, Response } from 'express';
import Image from '../model/image';
import cloudinary from '../utils/cloudinary';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
       return
    }

    const result = await cloudinary.uploader.upload_stream(
      { resource_type: 'auto' },
      async (error, result) => {
        if (error || !result) {
          res.status(500).json({ message: 'Failed to upload to Cloudinary' });
           return
        }

        const newImage = new Image({
          public_id: result.public_id,
          url: result.secure_url,
        });

        await newImage.save();
        res.status(201).json(newImage);
      }
    ).end(req.file.buffer);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getImages = async (req: Request, res: Response) => {
  try {
    const images = await Image.find();
    res.status(200).json(images);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
