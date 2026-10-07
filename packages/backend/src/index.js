const { app } = require('./app');

const PORT = process.env.PORT || 3030;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/items`);
});