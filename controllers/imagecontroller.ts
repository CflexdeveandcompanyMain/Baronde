import { Request, Response } from 'express';
import Image from '../model/image';
import cloudinary from '../utils/cloudinary';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { name, brand, specs, description, price, categories, keyword, image } = req.body;

    if (!image || !name || !description || !price || !categories) {
     res.status(400).json({
        message: 'Input compulsory fields: image, name, description, price and categories'
      });
       return 
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: 'products'
    });

    const newImage = new Image({
      images: [{ public_id: result.public_id, url: result.secure_url }],
      brand: brand,
      name: name,
      spec: specs,
      description: description,
      categories: categories,
      price: price,
      keyword: Array.isArray(keyword) ? keyword : [keyword]
    });

    await newImage.save();
    res.status(201).json({
      status: 'success',
      message: 'Product uploaded successfully',
      data: newImage
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getImages = async (req: Request, res: Response) => {
  try {
    const images = await Image.find();
    if (!images || images.length === 0) {
      res.status(404).json({ message: "No images have been uploaded yet" });
      return;
    }
    res.status(200).json({
      status: 'success',
      message: 'Images fetched successfully',
      count: images.length,
      data: images
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getImagesByName = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    
    const findImage = await Image.find({ 
      name: { $regex: name, $options: 'i' } 
    });
    
    if (!findImage || findImage.length === 0) {
      res.status(404).json({ 
        status: 'error',
        message: 'No images found with that name' 
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Images fetched successfully',
      count: findImage.length,
      data: findImage
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: 'An error occurred while searching',
      error: error.message 
    });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { categories } = req.params;
    const data = await Image.find({ categories });
    
    if (!data || data.length === 0) {
      res.status(404).json({
        status: "Not found",
        message: "No results"
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Fetched results successfully",
      count: data.length,
      data: data 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getImageById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const image = await Image.findById(id);
    
    if (!image) {
      res.status(404).json({
        status: 'error',
        message: 'Image not found'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Image fetched successfully',
      data: image
    });
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

export const getImagesByKeyword = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.params;
    const images = await Image.find({ keyword: { $in: [keyword] } });
    if (!images || images.length === 0) {
      res.status(404).json({ message: "No images found with that keyword" });
      return;
    }
    res.status(200).json({
      status: 'success',
      message: 'Images fetched successfully',
      count: images.length,
      data: images
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
