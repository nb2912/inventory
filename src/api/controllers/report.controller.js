const db = require('../../config/db');

/**
 * Generate inventory value report
 */
exports.getInventoryValueReport = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        SUM(quantity * price) as total_value,
        COUNT(*) as total_items,
        AVG(price) as average_price,
        MAX(price) as highest_price,
        MIN(price) as lowest_price
      FROM items
    `);
    
    res.status(200).json({
      status: 'success',
      data: results[0]
    });
  } catch (error) {
    console.error("Error generating inventory value report:", error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while generating the report.' 
    });
  }
};

/**
 * Generate inventory movement report (items added/removed)
 */
exports.getInventoryMovementReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  
  try {
    // This assumes you have an inventory_movements table tracking changes
    // If not, you would need to create this table and update it when items change
    const [results] = await db.query(`
      SELECT 
        i.name,
        i.serial_no,
        m.quantity_change,
        m.movement_type,
        m.created_at
      FROM inventory_movements m
      JOIN items i ON m.item_id = i.id
      WHERE m.created_at BETWEEN ? AND ?
      ORDER BY m.created_at DESC
    `, [startDate || '1970-01-01', endDate || new Date().toISOString().split('T')[0]]);
    
    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    console.error("Error generating inventory movement report:", error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while generating the report.' 
    });
  }
};

/**
 * Generate category distribution report
 */
exports.getCategoryDistributionReport = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(quantity) as total_quantity,
        SUM(quantity * price) as category_value
      FROM items
      GROUP BY category
      ORDER BY category_value DESC
    `);
    
    res.status(200).json({
      status: 'success',
      data: results
    });
  } catch (error) {
    console.error("Error generating category distribution report:", error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while generating the report.' 
    });
  }
};

/**
 * Export inventory data to CSV format
 */
exports.exportInventoryData = async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM items');
    
    // Convert items to CSV format
    const fields = Object.keys(items[0] || {});
    const csv = [
      fields.join(','), // Header row
      ...items.map(item => fields.map(field => {
        // Handle values that might contain commas by wrapping in quotes
        const value = item[field] === null ? '' : String(item[field]);
        return value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory_export.csv');
    
    res.status(200).send(csv);
  } catch (error) {
    console.error("Error exporting inventory data:", error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while exporting the data.' 
    });
  }
};