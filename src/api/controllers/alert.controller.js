const db = require('../../config/db');

/**
 * Get all low stock alerts
 * Returns items with quantity below threshold
 */
exports.getLowStockAlerts = async (req, res) => {
  try {
    // Default threshold is 10 if not specified
    const threshold = req.query.threshold ? parseInt(req.query.threshold) : 10;
    
    const [lowStockItems] = await db.query(
      'SELECT * FROM items WHERE quantity < ? ORDER BY quantity ASC',
      [threshold]
    );
    
    res.status(200).json({
      status: 'success',
      results: lowStockItems.length,
      data: {
        alerts: lowStockItems
      }
    });
  } catch (error) {
    console.error("Error fetching low stock alerts:", error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while fetching low stock alerts.' 
    });
  }
};

/**
 * Set alert threshold for an item
 */
exports.setAlertThreshold = async (req, res) => {
  const { itemId } = req.params;
  const { threshold } = req.body;
  
  if (!threshold || isNaN(parseInt(threshold)) || parseInt(threshold) < 0) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Valid threshold value is required.' 
    });
  }
  
  try {
    const [result] = await db.query(
      'UPDATE items SET alert_threshold = ? WHERE id = ?',
      [parseInt(threshold), itemId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        status: 'error',
        message: 'Item not found.' 
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Alert threshold updated successfully.'
    });
  } catch (error) {
    console.error("Error setting alert threshold:", error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while setting alert threshold.' 
    });
  }
};

/**
 * Get custom alerts based on item-specific thresholds
 */
exports.getCustomAlerts = async (req, res) => {
  try {
    const [customAlerts] = await db.query(`
      SELECT * FROM items 
      WHERE quantity < alert_threshold 
      AND alert_threshold IS NOT NULL
      ORDER BY (alert_threshold - quantity) DESC
    `);
    
    res.status(200).json({
      status: 'success',
      results: customAlerts.length,
      data: {
        alerts: customAlerts
      }
    });
  } catch (error) {
    console.error("Error fetching custom alerts:", error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while fetching custom alerts.' 
    });
  }
};