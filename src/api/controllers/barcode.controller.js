const db = require('../../config/db');

/**
 * Find item by barcode/serial number
 */
exports.findByBarcode = async (req, res) => {
  const { barcode } = req.params;
  
  try {
    const [items] = await db.query(
      'SELECT * FROM items WHERE serial_no = ?',
      [barcode]
    );
    
    if (items.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No item found with this barcode/serial number.'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        item: items[0]
      }
    });
  } catch (error) {
    console.error("Error finding item by barcode:", error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while finding the item.' 
    });
  }
};

/**
 * Update item quantity by barcode (for quick inventory updates)
 */
exports.updateQuantityByBarcode = async (req, res) => {
  const { barcode } = req.params;
  const { quantity, operation } = req.body;
  
  if (!quantity || isNaN(parseInt(quantity)) || parseInt(quantity) < 0) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Valid quantity value is required.' 
    });
  }
  
  try {
    // First, get the current item to check if it exists
    const [items] = await db.query(
      'SELECT * FROM items WHERE serial_no = ?',
      [barcode]
    );
    
    if (items.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No item found with this barcode/serial number.'
      });
    }
    
    const item = items[0];
    let newQuantity;
    
    // Determine the new quantity based on the operation
    if (operation === 'add') {
      newQuantity = item.quantity + parseInt(quantity);
    } else if (operation === 'subtract') {
      newQuantity = Math.max(0, item.quantity - parseInt(quantity));
    } else if (operation === 'set') {
      newQuantity = parseInt(quantity);
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid operation. Use "add", "subtract", or "set".'
      });
    }
    
    // Update the item quantity
    const [result] = await db.query(
      'UPDATE items SET quantity = ? WHERE serial_no = ?',
      [newQuantity, barcode]
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Item quantity updated successfully.',
      data: {
        previousQuantity: item.quantity,
        newQuantity: newQuantity
      }
    });
  } catch (error) {
    console.error("Error updating item quantity:", error);
    res.status(500).json({ 
      status: 'error',
      message: 'An error occurred while updating the item quantity.' 
    });
  }
};