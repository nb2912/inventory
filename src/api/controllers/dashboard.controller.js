const db = require('../../config/db');

/**
 * Get dashboard statistics
 * Provides summary statistics for the inventory system
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total number of items
    const [totalItems] = await db.query('SELECT COUNT(*) as count FROM items');
    
    // Get total inventory value
    const [inventoryValue] = await db.query('SELECT SUM(quantity * price) as total_value FROM items');
    
    // Get low stock items (items with quantity less than 10)
    const [lowStockItems] = await db.query('SELECT COUNT(*) as count FROM items WHERE quantity < 10');
    
    // Get items by category (if category field exists)
    const [itemsByCategory] = await db.query(`
      SELECT category, COUNT(*) as count 
      FROM items 
      GROUP BY category
    `);
    
    // Get recently added items (last 5)
    const [recentItems] = await db.query(`
      SELECT * FROM items 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    // Get top valuable items (top 5 by total value)
    const [valuableItems] = await db.query(`
      SELECT *, (quantity * price) as total_value 
      FROM items 
      ORDER BY total_value DESC 
      LIMIT 5
    `);

    res.status(200).json({
      status: 'success',
      data: {
        totalItems: totalItems[0].count,
        inventoryValue: inventoryValue[0].total_value || 0,
        lowStockItems: lowStockItems[0].count,
        itemsByCategory,
        recentItems,
        valuableItems
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while fetching dashboard statistics.' 
    });
  }
};

/**
 * Get inventory activity
 * Returns recent activity in the inventory system
 */
exports.getInventoryActivity = async (req, res) => {
  try {
    // This would typically connect to an activity log table
    // For now, we'll simulate with recent changes to items
    const [recentActivity] = await db.query(`
      SELECT * FROM items 
      ORDER BY updated_at DESC 
      LIMIT 10
    `);
    
    res.status(200).json({
      status: 'success',
      data: {
        activities: recentActivity
      }
    });
  } catch (error) {
    console.error("Error fetching inventory activity:", error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while fetching inventory activity.' 
    });
  }
};