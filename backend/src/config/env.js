// Load local environment variables only outside production.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
