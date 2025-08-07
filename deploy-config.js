// Deployment Configuration Helper
// This script helps generate the correct environment variables for deployment

const config = {
  development: {
    frontend: {
      VITE_API_URL: 'http://localhost:5000/api'
    },
    backend: {
      NODE_ENV: 'development',
      CLIENT_URL: 'http://localhost:5174',
      FRONTEND_URL: 'http://localhost:5174'
    }
  },
  production: {
    frontend: {
      VITE_API_URL: 'https://your-backend-api.herokuapp.com/api' // Replace with your backend URL
    },
    backend: {
      NODE_ENV: 'production',
      CLIENT_URL: 'https://your-frontend-app.vercel.app', // Replace with your Vercel URL
      FRONTEND_URL: 'https://your-frontend-app.vercel.app' // Replace with your Vercel URL
    }
  }
};

console.log('=== DEPLOYMENT CONFIGURATION ===\n');

console.log('For Vercel Frontend Deployment:');
console.log('Set these environment variables in Vercel dashboard:');
Object.entries(config.production.frontend).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('\nFor Backend Deployment (Heroku/Railway/Render):');
console.log('Set these environment variables:');
Object.entries(config.production.backend).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('\n=== IMPORTANT NOTES ===');
console.log('1. Replace placeholder URLs with your actual deployment URLs');
console.log('2. Set a strong JWT_SECRET for production');
console.log('3. Use MongoDB Atlas connection string for production database');
console.log('4. Registration links will automatically use the correct frontend URL'); 