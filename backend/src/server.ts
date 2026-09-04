import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';




const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API Health Check available at http://localhost:${PORT}/api/v1/health`);
});
