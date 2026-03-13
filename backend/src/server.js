import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const profile = {
  id: 1,
  name: 'Yash T',
  email: 'yash@example.com',
  city: 'New Delhi',
  joinedAt: '2024-08-14',
};

const products = [
  {
    id: 1,
    title: 'AeroStride Sneaker',
    brand: 'Roadster',
    category: 'Footwear',
    price: 2899,
    discountPercent: 35,
    rating: 4.7,
    assured: true,
    deliveryDays: 2,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    title: 'Urban Utility Backpack',
    brand: 'HRX',
    category: 'Accessories',
    price: 1999,
    discountPercent: 30,
    rating: 4.6,
    assured: true,
    deliveryDays: 2,
    image:
      'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    title: 'Pulse Smartwatch X2',
    brand: 'Noise',
    category: 'Wearables',
    price: 5999,
    discountPercent: 22,
    rating: 4.4,
    assured: true,
    deliveryDays: 3,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    title: 'Luma Overshirt',
    brand: 'WROGN',
    category: 'Apparel',
    price: 2499,
    discountPercent: 40,
    rating: 4.2,
    assured: false,
    deliveryDays: 4,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    title: 'Noir Ceramic Mug Set',
    brand: 'Home Centre',
    category: 'Home',
    price: 1499,
    discountPercent: 25,
    rating: 4.5,
    assured: true,
    deliveryDays: 3,
    image:
      'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    title: 'CloudTune Earbuds',
    brand: 'boAt',
    category: 'Audio',
    price: 3499,
    discountPercent: 28,
    rating: 4.3,
    assured: true,
    deliveryDays: 2,
    image:
      'https://images.unsplash.com/photo-1606220838315-056192d5e927?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 7,
    title: 'StrideLite Running Shorts',
    brand: 'Puma',
    category: 'Apparel',
    price: 1299,
    discountPercent: 32,
    rating: 4.5,
    assured: true,
    deliveryDays: 2,
    image:
      'https://images.unsplash.com/photo-1506629905607-d0c9c2b3a2b7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 8,
    title: 'Classic Denim Jacket',
    brand: 'Levis',
    category: 'Apparel',
    price: 3299,
    discountPercent: 38,
    rating: 4.6,
    assured: true,
    deliveryDays: 3,
    image:
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 9,
    title: 'Metro Leather Wallet',
    brand: 'Tommy Hilfiger',
    category: 'Accessories',
    price: 1699,
    discountPercent: 26,
    rating: 4.3,
    assured: false,
    deliveryDays: 4,
    image:
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 10,
    title: 'Velvet Matte Lip Kit',
    brand: 'Maybelline',
    category: 'Beauty',
    price: 899,
    discountPercent: 18,
    rating: 4.4,
    assured: true,
    deliveryDays: 2,
    image:
      'https://images.unsplash.com/photo-1631214524020-3f814ea0aa7a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 11,
    title: 'HydraGlow Face Serum',
    brand: 'Minimalist',
    category: 'Beauty',
    price: 749,
    discountPercent: 21,
    rating: 4.7,
    assured: true,
    deliveryDays: 2,
    image:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 12,
    title: 'UrbanFit Joggers',
    brand: 'H&M',
    category: 'Apparel',
    price: 1899,
    discountPercent: 29,
    rating: 4.1,
    assured: false,
    deliveryDays: 5,
    image:
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 13,
    title: 'Nova Smart Lamp',
    brand: 'Philips',
    category: 'Home',
    price: 2699,
    discountPercent: 33,
    rating: 4.2,
    assured: true,
    deliveryDays: 3,
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 14,
    title: 'Contour Comfort Loafers',
    brand: 'Bata',
    category: 'Footwear',
    price: 2399,
    discountPercent: 31,
    rating: 4.5,
    assured: true,
    deliveryDays: 2,
    image:
      'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 15,
    title: 'AirMesh Training Tee',
    brand: 'Adidas',
    category: 'Apparel',
    price: 1399,
    discountPercent: 24,
    rating: 4.0,
    assured: false,
    deliveryDays: 4,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 16,
    title: 'Weekend Duffel Bag',
    brand: 'Wildcraft',
    category: 'Accessories',
    price: 2199,
    discountPercent: 27,
    rating: 4.6,
    assured: true,
    deliveryDays: 2,
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80',
  },
];

let cart = [
  {
    productId: 2,
    quantity: 1,
  },
];

let wishlist = [1, 3];

function toCartResponse() {
  return cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        ...item,
        product,
        lineTotal: product.price * item.quantity,
      };
    })
    .filter(Boolean);
}

app.get('/api/health', (_, res) => {
  res.json({ ok: true, service: 'ecommerce-backend' });
});

app.get('/api/profile', (_, res) => {
  res.json(profile);
});

app.put('/api/profile', (req, res) => {
  const { name, email, city } = req.body;
  if (!name || !email) {
    return res.status(400).json({ message: 'name and email are required' });
  }

  profile.name = name;
  profile.email = email;
  profile.city = city || '';

  return res.json(profile);
});

app.get('/api/products', (_, res) => {
  res.json(products);
});

app.get('/api/cart', (_, res) => {
  const items = toCartResponse();
  const total = items.reduce((sum, item) => sum + item.lineTotal, 0);
  res.json({ items, total });
});

app.post('/api/cart', (req, res) => {
  const { productId } = req.body;
  const product = products.find((p) => p.id === Number(productId));

  if (!product) {
    return res.status(404).json({ message: 'product not found' });
  }

  const existing = cart.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId: product.id, quantity: 1 });
  }

  return res.status(201).json({ message: 'added to cart' });
});

app.patch('/api/cart/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  const { quantity } = req.body;
  const target = cart.find((item) => item.productId === productId);

  if (!target) {
    return res.status(404).json({ message: 'cart item not found' });
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: 'quantity must be an integer greater than 0' });
  }

  target.quantity = quantity;
  return res.json({ message: 'cart item updated' });
});

app.delete('/api/cart/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  cart = cart.filter((item) => item.productId !== productId);
  return res.json({ message: 'removed from cart' });
});

app.delete('/api/cart', (_, res) => {
  cart = [];
  return res.json({ message: 'cart cleared' });
});

app.get('/api/wishlist', (_, res) => {
  const items = products.filter((product) => wishlist.includes(product.id));
  res.json(items);
});

app.post('/api/wishlist', (req, res) => {
  const { productId } = req.body;
  const product = products.find((p) => p.id === Number(productId));

  if (!product) {
    return res.status(404).json({ message: 'product not found' });
  }

  if (!wishlist.includes(product.id)) {
    wishlist.push(product.id);
  }

  return res.status(201).json({ message: 'added to wishlist' });
});

app.delete('/api/wishlist/:productId', (req, res) => {
  const productId = Number(req.params.productId);
  wishlist = wishlist.filter((id) => id !== productId);
  return res.json({ message: 'removed from wishlist' });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${PORT}`);
});
