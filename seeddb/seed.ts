import Image from '../model/image'; 
import { HeroData } from '../heroData'; 
import mongoose from 'mongoose';


const transformHeroDataToImageData = (heroItem: any) => {
  return {
    images: heroItem.image.map((imageUrl: string) => ({
      public_id: `seeded_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: imageUrl
    })),
    name: heroItem.name,
    description: heroItem.description,
    categories: heroItem.category,
    spec: heroItem.description,
    price: heroItem.price,
    stockQuantity: heroItem.stockQuantity || 1,
    discount: heroItem.discount || 0
  };
};

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    const existingCount = await Image.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already contains ${existingCount} products. Skipping seed.`);
      return {
        success: true,
        message: `Database already seeded with ${existingCount} products`,
        skipped: true
      };
    }
    const transformedData = HeroData.map(transformHeroDataToImageData)
    const insertedData = await Image.insertMany(transformedData);
    
    console.log(`Successfully seeded ${insertedData.length} products to the database`);
    
    return {
      success: true,
      message: `Successfully seeded ${insertedData.length} products`,
      count: insertedData.length,
      data: insertedData
    };

  } catch (error) {
    console.error('Error seeding database:', error);
    return {
      success: false,
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};



async function runSeed() {
  try {
    await mongoose.connect('mongodb+srv://timosdev99:timo1234567890@cluster0.59vvtcc.mongodb.net/');
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();