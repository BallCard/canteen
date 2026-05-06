// Vercel serverless function: catch-all API fallback
// Returns JSON so the frontend can gracefully fall back to mock data
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(503).json({
    error: "Backend not deployed on Vercel",
    message: "Frontend will use local mock data",
    status: "fallback"
  });
};
