const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const isAuthenticated = require('../middleware/auth');

// Show all expenses
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.find({ author: req.user._id }).sort({ date: -1 });
    res.render('dashboard', { expenses });
  } catch (err) {
    req.flash('error', 'Could not retrieve expenses.');
    res.redirect('/');
  }
});

// Show form to create a new expense
router.get('/new', isAuthenticated, (req, res) => {
  res.render('addExpense');
});

// Create a new expense
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { description, amount, date, category } = req.body;
    const adjustedDate = new Date(date);
    adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset());

    const expense = new Expense({
      description,
      amount,
      date: adjustedDate,
      category,
      author: req.user._id,
    });
    await expense.save();
    req.flash('success', 'Expense added successfully.');
    res.redirect('/expenses');
  } catch (err) {
    req.flash('error', 'Error adding expense.');
    res.redirect('/expenses/new');
  }
});

// Show form to edit an expense
router.get('/:id/edit', isAuthenticated, async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || !expense.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to edit this expense.');
      return res.redirect('/expenses');
    }
    res.render('editExpense', { expense });
  } catch (err) {
    req.flash('error', 'Error fetching expense.');
    res.redirect('/expenses');
  }
});

// Update an expense
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { description, amount, date, category } = req.body;
    const expense = await Expense.findById(req.params.id);
    
    if (!expense || !expense.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to update this expense.');
      return res.redirect('/expenses');
    }

    const adjustedDate = new Date(date);
    adjustedDate.setMinutes(adjustedDate.getMinutes() + adjustedDate.getTimezoneOffset());

    expense.description = description;
    expense.amount = amount;
    expense.date = adjustedDate;
    expense.category = category;
    await expense.save();

    req.flash('success', 'Expense updated successfully.');
    res.redirect('/expenses');
  } catch (err) {
    req.flash('error', 'Error updating expense.');
    res.redirect(`/expenses/${req.params.id}/edit`);
  }
});

// Delete an expense
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    req.flash('success', 'Expense deleted successfully.');
    res.redirect('/expenses');
  } catch (err) {
    req.flash('error', 'Error deleting expense.');
    res.redirect('/expenses');
  }
});

module.exports = router;
