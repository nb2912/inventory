const db = require('../../config/db');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const [categories] = await db.query('SELECT DISTINCT category FROM items WHERE category IS NOT NULL');
    
    res.status(200).json({
      status: 'success',
      data: {
        categories: categories.map(item => item.category)
      }
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: 'An error occurred while fetching categories.' });
  }
};

// Get items by category
exports.getItemsByCategory = async (req, res) => {
  const { category } = req.params;
  
  try {
    const [items] = await db.query('SELECT * FROM items WHERE category = ?', [category]);
    
    res.status(200).json({
      status: 'success',
      results: items.length,
      data: {
        items
      }
    });
  } catch (error) {
    console.error("Error fetching items by category:", error);
    res.status(500).json({ message: 'An error occurred while fetching items.' });
  }
};