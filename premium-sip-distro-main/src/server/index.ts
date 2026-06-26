
import app from "./app";
import connectDB from "./config/database";

const PORT = process.env.PORT || 5002;

// Connect to database
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Auth server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
