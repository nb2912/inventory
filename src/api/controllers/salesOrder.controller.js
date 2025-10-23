// src/api/controllers/salesOrder.controller.js
const db = require('../../config/db');

// @desc    Create a new sales order
// @route   POST /api/sales-orders
exports.createSalesOrder = async (req, res) => {
  const { customer_name, order_date, items } = req.body;

  if (!customer_name || !order_date || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // --- Stock Availability Check ---
    for (const item of items) {
      const [[currentItem]] = await connection.query('SELECT quantity FROM items WHERE id = ? FOR UPDATE', [item.item_id]);
      if (!currentItem || currentItem.quantity < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Not enough stock for item ID ${item.item_id}.` });
      }
    }

    // Insert the main sales order
    const [soResult] = await connection.query(
      'INSERT INTO sales_orders (customer_name, order_date, status) VALUES (?, ?, ?)',
      [customer_name, order_date, 'Fulfilled'] // Defaulting to Fulfilled for simplicity
    );
    const salesOrderId = soResult.insertId;

    // Deduct stock and prepare items for batch insert
    const soItems = [];
    for (const item of items) {
      soItems.push([salesOrderId, item.item_id, item.quantity, item.price]);
      await connection.query(
        'UPDATE items SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.item_id]
      );
      // We will add the audit trail logic here in a future step
    }

    // Insert all items linked to the sales order
    await connection.query(
      'INSERT INTO sales_order_items (sales_order_id, item_id, quantity, price) VALUES ?',
      [soItems]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: 'Sales order created successfully', data: { id: salesOrderId } });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating sales order:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    connection.release();
  }
};

// @desc    Get all sales orders
// @route   GET /api/sales-orders
exports.getAllSalesOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT id, customer_name, order_date, status FROM sales_orders ORDER BY order_date DESC'
    );
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a single sales order with its items
// @route   GET /api/sales-orders/:id
exports.getSalesOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const [order] = await db.query('SELECT * FROM sales_orders WHERE id = ?', [id]);

        if (order.length === 0) {
            return res.status(404).json({ success: false, message: 'Sales order not found' });
        }

        const [items] = await db.query(`
            SELECT i.name, i.serial_no, soi.quantity, soi.price
            FROM sales_order_items soi
            JOIN items i ON soi.item_id = i.id
            WHERE soi.sales_order_id = ?
        `, [id]);

        res.status(200).json({ success: true, data: { ...order[0], items } });
    } catch (error) {
        console.error('Error fetching sales order details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};