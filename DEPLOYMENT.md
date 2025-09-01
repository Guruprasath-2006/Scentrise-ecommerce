# Scentrise - Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### ✅ Backend Setup
- [ ] All TypeScript compilation errors resolved
- [ ] Email service configured with SMTP credentials
- [ ] Database indexes optimized
- [ ] Security headers implemented
- [ ] Rate limiting configured
- [ ] Error logging setup
- [ ] Environment variables configured

### ✅ Frontend Setup
- [ ] Analytics tracking implemented
- [ ] SEO meta tags added
- [ ] Error boundaries in place
- [ ] Performance monitoring enabled
- [ ] PWA configuration (optional)
- [ ] Build optimization completed

### ✅ Production Features Implemented
- [ ] Email notifications (Welcome, Order confirmation, Low stock alerts)
- [ ] Product recommendations engine
- [ ] Advanced inventory management
- [ ] Coupon/discount system
- [ ] Enhanced pagination
- [ ] Flipkart-style filters
- [ ] User address management

## 🌐 Deployment Options

### Option 1: Vercel + MongoDB Atlas (Recommended for beginners)

#### Frontend (Vercel)
1. **Push code to GitHub repository**
   ```bash
   git add .
   git commit -m "Production ready deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set environment variables in Vercel dashboard
   - Deploy automatically

3. **Environment Variables for Vercel**
   ```
   REACT_APP_GA_MEASUREMENT_ID=GA_MEASUREMENT_ID
   REACT_APP_FACEBOOK_PIXEL_ID=your_facebook_pixel_id
   REACT_APP_HOTJAR_ID=your_hotjar_id
   REACT_APP_RAZORPAY_KEY_ID=rzp_live_your_key_id
   REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
   REACT_APP_SITE_URL=https://your-domain.com
   VITE_API_URL=https://your-backend-domain.com
   ```

#### Backend (Railway/Render/Heroku)
1. **Railway Deployment**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Environment Variables for Production**
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/scentrise
   JWT_SECRET=your-super-secret-jwt-key-production-256-bit
   CLIENT_URL=https://your-frontend-domain.com
   RAZORPAY_KEY_ID=rzp_live_your_key_id
   RAZORPAY_KEY_SECRET=your_live_razorpay_secret
   STRIPE_SECRET=sk_live_your_stripe_secret
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=Scentrise <noreply@scentrise.com>
   ADMIN_EMAIL=admin@scentrise.com
   ```

### Option 2: AWS/Digital Ocean (Advanced)

#### Backend (EC2/Droplet)
1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   
   # Install MongoDB or use MongoDB Atlas
   # Install Nginx for reverse proxy
   sudo apt install nginx
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/scentrise.git
   cd scentrise/server
   
   # Install dependencies
   npm install
   
   # Build TypeScript
   npm run build
   
   # Start with PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-api-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

#### Frontend (S3 + CloudFront)
1. **Build for Production**
   ```bash
   cd client
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --delete
   ```

3. **Configure CloudFront for SPA routing**

## 🔧 Configuration Steps

### 1. Email Service Setup (Gmail)
1. Enable 2-factor authentication on Gmail
2. Generate App Password:
   - Google Account → Security → App passwords
   - Select app: Mail, Device: Other
   - Copy the 16-character password
3. Update SMTP_PASS in environment variables

### 2. Payment Gateway Setup

#### Razorpay
1. Create account at [razorpay.com](https://razorpay.com)
2. Complete KYC verification
3. Get Live API keys from Dashboard
4. Update environment variables

#### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Complete account verification
3. Get Live API keys from Dashboard
4. Update environment variables

### 3. Analytics Setup

#### Google Analytics 4
1. Create GA4 property at [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID (GA_MEASUREMENT_ID)
3. Add to environment variables

#### Facebook Pixel
1. Create Facebook Business account
2. Set up Facebook Pixel in Events Manager
3. Get Pixel ID
4. Add to environment variables

### 4. Domain & SSL
1. **Purchase domain** from providers like Namecheap, GoDaddy
2. **Configure DNS** to point to your hosting provider
3. **SSL Certificate** (usually automatic with modern hosts)
4. **Update CORS origins** in backend to include your domain

## 📊 Monitoring & Maintenance

### Performance Monitoring
- Set up Google Analytics for user behavior tracking
- Monitor Core Web Vitals
- Set up error tracking (Sentry, LogRocket)
- Monitor server performance (CPU, Memory, Disk)

### Database Maintenance
```javascript
// MongoDB indexes for better performance
db.products.createIndex({ name: "text", description: "text" })
db.products.createIndex({ category: 1, price: 1 })
db.products.createIndex({ brand: 1, inStock: 1 })
db.orders.createIndex({ userId: 1, createdAt: -1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

### Security Best Practices
- Regular dependency updates
- Environment variable security
- Database backup strategy
- Rate limiting monitoring
- SSL certificate renewal
- Security headers validation

## 🚨 Post-Deployment Testing

### Frontend Testing
- [ ] All pages load correctly
- [ ] Analytics tracking works
- [ ] Payment integration functional
- [ ] Mobile responsiveness
- [ ] Performance score > 90

### Backend Testing
- [ ] All API endpoints respond
- [ ] Email notifications send
- [ ] Payment processing works
- [ ] File uploads function
- [ ] Error handling works

### User Flow Testing
- [ ] User registration/login
- [ ] Product browsing
- [ ] Add to cart
- [ ] Checkout process
- [ ] Order confirmation
- [ ] Email notifications

## 📞 Support & Troubleshooting

### Common Issues

1. **CORS Errors**
   - Update CLIENT_URL in backend .env
   - Check CORS_ORIGIN configuration

2. **Email Not Sending**
   - Verify SMTP credentials
   - Check App Password format
   - Test with simple email client

3. **Payment Failures**
   - Verify API keys are for live environment
   - Check webhook configurations
   - Monitor payment gateway dashboards

4. **Analytics Not Tracking**
   - Verify Measurement IDs
   - Check browser ad blockers
   - Test in incognito mode

### Performance Optimization
- Enable gzip compression
- Implement CDN for static assets
- Optimize images (WebP format)
- Enable browser caching
- Database query optimization

---

## 🎉 Congratulations!

Your Scentrise e-commerce platform is now production-ready with:
- ✅ Complete user management system
- ✅ Advanced product catalog with filters
- ✅ Shopping cart and checkout
- ✅ Payment integration (Razorpay/Stripe)
- ✅ Email notification system
- ✅ Product recommendations
- ✅ Inventory management
- ✅ Coupon/discount system
- ✅ Analytics tracking
- ✅ SEO optimization
- ✅ Error handling & monitoring

**Remember:** Always test thoroughly in a staging environment before deploying to production!

For additional support or feature requests, please refer to the project documentation or create an issue in the repository.
