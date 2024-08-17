const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const moment = require('moment');

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You need to be logged in to access this page.');
  res.redirect('/users/login');
}

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

    // Group by month/year and sum amounts
    const monthlyTotals = {};
    const yearlyTotals = {};

    expenses.forEach(expense => {
      const monthYear = moment(expense.date).format('MMM YYYY');
      const year = moment(expense.date).format('YYYY'); 

      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = 0;
      }
      if (!yearlyTotals[year]) {
        yearlyTotals[year] = 0;
      }

      monthlyTotals[monthYear] += expense.amount;
      yearlyTotals[year] += expense.amount;
    });

    // Calculate average spending per month
    const numberOfMonths = Object.keys(monthlyTotals).length;
    const averageSpendingPerMonth = numberOfMonths > 0 ? totalExpenses / numberOfMonths : 0;

    res.render('statistics', {
      totalExpenses,
      categoryBreakdown,
      highestExpense: expenses.length ? expenses.reduce((max, expense) => (expense.amount > max.amount ? expense : max), expenses[0]) : null,
      lowestExpense: expenses.length ? expenses.reduce((min, expense) => (expense.amount < min.amount ? expense : min), expenses[0]) : null,
      averageSpendingPerMonth,
      monthlyTotals,
      yearlyTotals
    });
  } catch (err) {
    console.error('Error retrieving statistics:', err); 
    req.flash('error', 'Could not retrieve statistics.');
    res.redirect('/expenses');
  }
});

module.exports = router;
