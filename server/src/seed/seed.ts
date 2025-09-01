import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Product } from '../models/Product';

const sampleProducts = [
  {
    title: "Bleu de Chanel Eau de Parfum",
    slug: "bleu-de-chanel-edp",
    brand: "Chanel",
    gender: "men",
    family: "woody",
    notes: ["Citrus", "Labdanum", "Sandalwood", "Cedar"],
    description: "An aromatic-woody fragrance that captures a man's determination. This irresistibly sexy fragrance for men reveals the spirit of a man who chooses his own destiny with independence and determination.",
    price: 6999,
    mrp: 8999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500",
      }
    ],
    stock: 25,
    ratingAvg: 4.8,
    ratingCount: 156,
    isFeatured: true,
  },
  {
    title: "Sauvage Eau de Toilette",
    slug: "sauvage-edt",
    brand: "Dior",
    gender: "men",
    family: "fresh",
    notes: ["Bergamot", "Pepper", "Ambroxan", "Geranium"],
    description: "Sauvage is an act of creation inspired by wide-open spaces. An ozone blue sky that dominates a white-hot desert landscape.",
    price: 5499,
    mrp: 6999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1594736797933-d0cc501ba2fe?w=500",
      }
    ],
    stock: 30,
    ratingAvg: 4.7,
    ratingCount: 203,
    isFeatured: true,
  },
  {
    title: "Black Opium Eau de Parfum",
    slug: "black-opium-edp",
    brand: "Yves Saint Laurent",
    gender: "women",
    family: "oriental",
    notes: ["Coffee", "Vanilla", "White Flowers", "Cedar"],
    description: "Black Opium is the first coffee floral fragrance by YSL Beauty. A seductive and invigorating scent for the YSL woman who lives her life to the fullest.",
    price: 7499,
    mrp: 9499,
    images: [
      {
        url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?w=500",
      }
    ],
    stock: 20,
    ratingAvg: 4.9,
    ratingCount: 187,
    isFeatured: true,
  },
  {
    title: "Libre Eau de Parfum",
    slug: "libre-edp",
    brand: "Yves Saint Laurent",
    gender: "women",
    family: "floral",
    notes: ["Mandarin", "Lavender", "Orange Blossom", "Vanilla"],
    description: "LIBRE, the fragrance of freedom. A floral lavender contrasted by the sensuality of orange blossom and the boldness of a glowing vanilla accord.",
    price: 6799,
    mrp: 8499,
    images: [
      {
        url: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500",
      }
    ],
    stock: 15,
    ratingAvg: 4.6,
    ratingCount: 142,
    isFeatured: false,
  },
  {
    title: "Acqua di Gio Profumo",
    slug: "acqua-di-gio-profumo",
    brand: "Giorgio Armani",
    gender: "men",
    family: "fresh",
    notes: ["Bergamot", "Geranium", "Sage", "Incense"],
    description: "Acqua di Giò Profumo is a sophisticated aquatic fragrance. Marine notes blend with aromatic sage, while incense adds depth and sensuality.",
    price: 5999,
    mrp: 7499,
    images: [
      {
        url: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=500",
      }
    ],
    stock: 22,
    ratingAvg: 4.5,
    ratingCount: 98,
    isFeatured: false,
  },
  {
    title: "CK One Eau de Toilette",
    slug: "ck-one-edt",
    brand: "Calvin Klein",
    gender: "unisex",
    family: "citrus",
    notes: ["Lemon", "Bergamot", "Cardamom", "Amber"],
    description: "A refreshingly clean fragrance that can be worn by anyone. CK One is a citrus fragrance with fresh and clean notes.",
    price: 2999,
    mrp: 3999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
      }
    ],
    stock: 35,
    ratingAvg: 4.2,
    ratingCount: 76,
    isFeatured: false,
  },
  {
    title: "Tom Ford Black Orchid",
    slug: "tom-ford-black-orchid",
    brand: "Tom Ford",
    gender: "unisex",
    family: "oriental",
    notes: ["Black Truffle", "Ylang-Ylang", "Blackcurrant", "Dark Chocolate"],
    description: "Black Orchid is Tom Ford's original signature fragrance. Rich, dark, and sensual, it's an luxurious and sensual unisex fragrance.",
    price: 12999,
    mrp: 15999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500",
      }
    ],
    stock: 8,
    ratingAvg: 4.9,
    ratingCount: 234,
    isFeatured: true,
  },
  {
    title: "La Vie Est Belle",
    slug: "la-vie-est-belle",
    brand: "Lancôme",
    gender: "women",
    family: "gourmand",
    notes: ["Blackcurrant", "Pear", "Jasmine", "Praline"],
    description: "La Vie Est Belle is a sweet gourmand fragrance. It's an optimistic and happy fragrance that celebrates life's simple pleasures.",
    price: 7999,
    mrp: 9999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?w=500",
      }
    ],
    stock: 18,
    ratingAvg: 4.7,
    ratingCount: 165,
    isFeatured: true,
  },
  {
    title: "Creed Aventus",
    slug: "creed-aventus",
    brand: "Creed",
    gender: "men",
    family: "woody",
    notes: ["Pineapple", "Birch", "Musk", "Oak Moss"],
    description: "Aventus celebrates strength, power, success, and heritage. A sophisticated blend of woods and fruits that has become a modern classic.",
    price: 24999,
    mrp: 29999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1594736797933-d0cc501ba2fe?w=500",
      }
    ],
    stock: 5,
    ratingAvg: 4.9,
    ratingCount: 89,
    isFeatured: true,
  },
  {
    title: "Miss Dior Eau de Parfum",
    slug: "miss-dior-edp",
    brand: "Dior",
    gender: "women",
    family: "floral",
    notes: ["Blood Orange", "Lily of the Valley", "Rose", "Patchouli"],
    description: "Miss Dior is a radiant fragrance that pays tribute to love. A bright and bold trail that is both romantic and rebellious.",
    price: 8499,
    mrp: 10499,
    images: [
      {
        url: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500",
      }
    ],
    stock: 12,
    ratingAvg: 4.8,
    ratingCount: 178,
    isFeatured: false,
  },
  {
    title: "Versace Eros",
    slug: "versace-eros",
    brand: "Versace",
    gender: "men",
    family: "fresh",
    notes: ["Mint", "Green Apple", "Tonka Bean", "Vanilla"],
    description: "Eros is a fragrance for a strong, passionate man who is master of himself. It's fresh, woody, and slightly oriental.",
    price: 4999,
    mrp: 6499,
    images: [
      {
        url: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=500",
      }
    ],
    stock: 28,
    ratingAvg: 4.6,
    ratingCount: 134,
    isFeatured: false,
  },
  {
    title: "Flowerbomb Eau de Parfum",
    slug: "flowerbomb-edp",
    brand: "Viktor & Rolf",
    gender: "women",
    family: "floral",
    notes: ["Tea", "Bergamot", "Freesia", "Patchouli"],
    description: "Flowerbomb is a floral explosion, a profusion of flowers that has the power to make everything seem more positive.",
    price: 6999,
    mrp: 8999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?w=500",
      }
    ],
    stock: 16,
    ratingAvg: 4.7,
    ratingCount: 192,
    isFeatured: false,
  },
  {
    title: "Jean Paul Gaultier Le Male",
    slug: "jpg-le-male",
    brand: "Jean Paul Gaultier",
    gender: "men",
    family: "oriental",
    notes: ["Lavender", "Mint", "Cardamom", "Vanilla"],
    description: "Le Male is a fragrance for the unconventional man. A spicy lavender for the contrasting man, who is both strong and gentle.",
    price: 4499,
    mrp: 5999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
      }
    ],
    stock: 21,
    ratingAvg: 4.4,
    ratingCount: 87,
    isFeatured: false,
  },
  {
    title: "Dolce & Gabbana Light Blue",
    slug: "dg-light-blue",
    brand: "Dolce & Gabbana",
    gender: "unisex",
    family: "citrus",
    notes: ["Sicilian Lemon", "Apple", "Cedar", "Amber"],
    description: "Light Blue captures the essence of the Mediterranean. A fresh and fruity fragrance that evokes the joy of sunny days.",
    price: 3999,
    mrp: 5499,
    images: [
      {
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500",
      }
    ],
    stock: 26,
    ratingAvg: 4.3,
    ratingCount: 112,
    isFeatured: false,
  },
  {
    title: "Coco Mademoiselle",
    slug: "coco-mademoiselle",
    brand: "Chanel",
    gender: "women",
    family: "oriental",
    notes: ["Orange", "Jasmine", "Rose", "Patchouli"],
    description: "An oriental fragrance that draws its inspiration from the fascinating personality of Gabrielle Chanel. Rebellious and audacious.",
    price: 8999,
    mrp: 11499,
    images: [
      {
        url: "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=500",
      }
    ],
    stock: 14,
    ratingAvg: 4.8,
    ratingCount: 201,
    isFeatured: false,
  },
  {
    title: "Hugo Boss Bottled",
    slug: "hugo-boss-bottled",
    brand: "Hugo Boss",
    gender: "men",
    family: "woody",
    notes: ["Apple", "Plum", "Geranium", "Cedar"],
    description: "Boss Bottled represents the essence of the Boss man. Elegant, confident, and sophisticated with a fresh and fruity opening.",
    price: 3499,
    mrp: 4999,
    images: [
      {
        url: "https://images.unsplash.com/photo-1594736797933-d0cc501ba2fe?w=500",
      }
    ],
    stock: 31,
    ratingAvg: 4.4,
    ratingCount: 78,
    isFeatured: false,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@scentrise.com',
      password: hashedPassword,
      role: 'admin',
    });

    // Create products
    console.log('Creating products...');
    await Product.insertMany(sampleProducts);

    console.log('✅ Database seeded successfully!');
    console.log('Admin login: admin@scentrise.com / Admin@123');
    console.log(`${sampleProducts.length} products created`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
