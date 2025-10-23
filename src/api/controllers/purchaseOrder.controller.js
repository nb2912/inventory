// src/api/controllers/purchaseOrder.controller.js
const db = require('../../config/db');

// @desc    Create a new purchase order
// @route   POST /api/purchase-orders
exports.createPurchaseOrder = async (req, res) => {
  const { supplier_id, order_date, expected_delivery_date, items } = req.body;

  if (!supplier_id || !order_date || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Insert the main purchase order
    const [poResult] = await connection.query(
      'INSERT INTO purchase_orders (supplier_id, order_date, expected_delivery_date) VALUES (?, ?, ?)',
      [supplier_id, order_date, expected_delivery_date]
    );
    const purchaseOrderId = poResult.insertId;

    // Prepare items for batch insert
    const poItems = items.map(item => [purchaseOrderId, item.item_id, item.quantity, item.price]);

    // Insert all items linked to the purchase order
    await connection.query(
      'INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, price) VALUES ?',
      [poItems]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: 'Purchase order created successfully', data: { id: purchaseOrderId } });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating purchase order:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    connection.release();
  }
};

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const [orders] = await db.query(`
      SELECT po.id, s.name as supplier_name, po.order_date, po.status 
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      ORDER BY po.order_date DESC
    `);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get a single purchase order with its items
// @route   GET /api/purchase-orders/:id
exports.getPurchaseOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const [order] = await db.query(`
            SELECT po.*, s.name as supplier_name 
            FROM purchase_orders po
            JOIN suppliers s ON po.supplier_id = s.id
            WHERE po.id = ?
        `, [id]);

        if (order.length === 0) {
            return res.status(404).json({ success: false, message: 'Purchase order not found' });
        }

        const [items] = await db.query(`
            SELECT i.name, i.serial_no, poi.quantity, poi.price
            FROM purchase_order_items poi
            JOIN items i ON poi.item_id = i.id
            WHERE poi.purchase_order_id = ?
        `, [id]);

        res.status(200).json({ success: true, data: { ...order[0], items } });
    } catch (error) {
        console.error('Error fetching purchase order details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc    Update the status of a purchase order
// @route   PATCH /api/purchase-orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['Pending', 'Sent', 'Partially Received', 'Received'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status provided.' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update the PO status
    const [result] = await connection.query(
      'UPDATE purchase_orders SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Purchase order not found.' });
    }

    // 2. If status is "Received", update inventory
    if (status === 'Received') {
      const [items] = await connection.query(
        'SELECT item_id, quantity FROM purchase_order_items WHERE purchase_order_id = ?',
        [id]
      );

      // This is a critical loop. Each item's quantity needs to be updated.
      for (const item of items) {
        await connection.query(
          'UPDATE items SET quantity = quantity + ? WHERE id = ?',
          [item.quantity, item.item_id]
        );
        // We will add the audit trail logic here in a future step
      }
    }

    await connection.commit();
    res.status(200).json({ success: true, message: `Purchase order status updated to ${status}` });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating PO status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  } finally {
    connection.release();
  }
};