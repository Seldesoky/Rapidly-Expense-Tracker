const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const moment = require('moment');
const isAuthenticated = require('../middleware/auth'); 

// Show expense statistics at /statistics
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const expenses = await Expense.find({ author: req.user._id });

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Group by category and sum amounts
    const categoryBreakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    // Calculate total by month and year
    const monthlyTotals = expenses.reduce((acc, expense) => {
      const monthYear = moment(expense.date).format('MMMM YYYY');
      acc[monthYear] = (acc[monthYear] || 0) + expense.amount;
      return acc;
    }, {});

    // Calculate average spending per month
    const numberOfMonths = Object.keys(monthlyTotals).length;
    const averageSpendingPerMonth = numberOfMonths > 0 ? totalExpenses / numberOfMonths : 0;

    res.render('statistics', {
      totalExpenses,
      categoryBreakdown,
      highestExpense: expenses.length ? expenses.reduce((max, expense) => (expense.amount > max.amount ? expense : max), expenses[0]) : null,
      lowestExpense: expenses.length ? expenses.reduce((min, expense) => (expense.amount < min.amount ? expense : min), expenses[0]) : null,
      averageSpendingPerMonth,
      monthlyTotals
    });
  } catch (err) {
    console.error('Error retrieving statistics:', err); 
    req.flash('error', 'Could not retrieve statistics.');
    res.redirect('/expenses');
  }
});

module.exports = router;
