const db = require('../../config/db');

exports.addItem = async (req, res) => {
  const { serial_no, name, quantity, price } = req.body;

  if (!serial_no || !name || !quantity || !price) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO items (serial_no, name, quantity, price) VALUES (?, ?, ?, ?)',
      [serial_no, name, quantity, price]
    );

    res.status(201).json({ message: 'Item added successfully!', itemId: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Serial number already exists.' });
    }
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'An error occurred while adding the item.' });
  }
};

// Get all items logic
exports.getAllItems = async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM items');
    
    res.status(200).json({
      status: 'success',
      results: items.length,
      data: {
        items
      }
    });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: 'An error occurred while fetching items.' });
  }
};
