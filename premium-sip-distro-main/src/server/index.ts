import app from './app.ts';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
