const db = require('../../config/db');

exports.addItem = async (req, res) => {
  const { serial_no, name, quantity, price, category, description } = req.body;

  if (!serial_no || !name || !quantity || !price) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO items (serial_no, name, quantity, price, category, description) VALUES (?, ?, ?, ?, ?, ?)',
      [serial_no, name, quantity, price, category || null, description || null]
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

// Get all items logic with filtering
exports.getAllItems = async (req, res) => {
  try {
    let query = 'SELECT * FROM items';
    const queryParams = [];
    
    // Build query based on filters
    if (Object.keys(req.query).length > 0) {
      const filters = [];
      
      // Filter by category
      if (req.query.category) {
        filters.push('category = ?');
        queryParams.push(req.query.category);
      }
      
      // Filter by name (partial match)
      if (req.query.name) {
        filters.push('name LIKE ?');
        queryParams.push(`%${req.query.name}%`);
      }
      
      // Filter by min quantity
      if (req.query.minQuantity) {
        filters.push('quantity >= ?');
        queryParams.push(parseInt(req.query.minQuantity));
      }
      
      // Filter by max quantity
      if (req.query.maxQuantity) {
        filters.push('quantity <= ?');
        queryParams.push(parseInt(req.query.maxQuantity));
      }
      
      // Add WHERE clause if filters exist
      if (filters.length > 0) {
        query += ' WHERE ' + filters.join(' AND ');
      }
    }
    
    // Add sorting if specified
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith('-') ? 
        req.query.sort.substring(1) : req.query.sort;
      const sortOrder = req.query.sort.startsWith('-') ? 'DESC' : 'ASC';
      
      // Validate sort field to prevent SQL injection
      const validSortFields = ['name', 'price', 'quantity', 'category', 'created_at'];
      if (validSortFields.includes(sortField)) {
        query += ` ORDER BY ${sortField} ${sortOrder}`;
      }
    }
    
    const [items] = await db.query(query, queryParams);
    
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
