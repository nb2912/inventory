// src/api/controllers/supplier.controller.js
const db = require('../../config/db');

// @desc    Get all suppliers
// @route   GET /api/suppliers
exports.getAllSuppliers = async (req, res) => {
  try {
    const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY name ASC');
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
exports.getSupplierById = async (req, res) => {
  try {
    const [supplier] = await db.query('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (supplier.length === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.status(200).json({ success: true, data: supplier[0] });
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create a new supplier
// @route   POST /api/suppliers
exports.createSupplier = async (req, res) => {
  const { name, contact_person, email, phone, address } = req.body;

  if (!name) {
    return res.status(400).json({ success: false, message: 'Supplier name is required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, contact_person, email, phone, address]
    );
    res.status(201).json({ success: true, data: { id: result.insertId, ...req.body } });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update a supplier
// @route   PUT /api/suppliers/:id
exports.updateSupplier = async (req, res) => {
  const { name, contact_person, email, phone, address } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, contact_person, email, phone, address, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.status(200).json({ success: true, data: req.body });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete a supplier
// @route   DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res) => {
  try {
    // Before deleting, check if any items are linked to this supplier.
    const [items] = await db.query('SELECT id FROM items WHERE supplier_id = ?', [req.params.id]);
    if (items.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete supplier. Reassign items linked to this supplier first.',
      });
    }

    const [result] = await db.query('DELETE FROM suppliers WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};