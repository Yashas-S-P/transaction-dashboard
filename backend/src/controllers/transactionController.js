const Transaction = require('../models/Transaction');
const axios = require('axios');

// Initialize Database
exports.initializeDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions.map(transaction => ({
      ...transaction,
      dateOfSale: new Date(transaction.dateOfSale)
    })));

    res.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Transactions with search and pagination
exports.getTransactions = async (req, res) => {
  try {
    const { month, search = '', page = 1, perPage = 10 } = req.query;
    const monthNumber = new Date(`${month} 1`).getMonth() + 1;

    const query = {
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] }
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: isNaN(search) ? undefined : Number(search) }
      ].filter(Boolean);
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));

    res.json({
      success: true,
      data: {
        transactions,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / perPage)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Statistics
exports.getStatistics = async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = new Date(`${month} 1`).getMonth() + 1;

    const query = {
      $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] }
    };

    const [totalSales] = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const soldItems = await Transaction.countDocuments({ ...query, sold: true });
    const notSoldItems = await Transaction.countDocuments({ ...query, sold: false });

    res.json({
      success: true,
      data: {
        totalSaleAmount: totalSales?.total || 0,
        totalSoldItems: soldItems,
        totalNotSoldItems: notSoldItems
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Bar Chart Data
exports.getBarChartData = async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = new Date(`${month} 1`).getMonth() + 1;

    const ranges = [
      { min: 0, max: 100 },
      { min: 101, max: 200 },
      { min: 201, max: 300 },
      { min: 301, max: 400 },
      { min: 401, max: 500 },
      { min: 501, max: 600 },
      { min: 601, max: 700 },
      { min: 701, max: 800 },
      { min: 801, max: 900 },
      { min: 901, max: Infinity }
    ];

    const result = await Promise.all(
      ranges.map(async ({ min, max }) => {
        const count = await Transaction.countDocuments({
          $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] },
          price: { $gte: min, $lt: max === Infinity ? 1000000 : max }
        });

        return {
          range: max === Infinity ? `${min}-above` : `${min}-${max}`,
          count
        };
      })
    );

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Pie Chart Data
exports.getPieChartData = async (req, res) => {
  try {
    const { month } = req.query;
    const monthNumber = new Date(`${month} 1`).getMonth() + 1;

    const result = await Transaction.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: '$dateOfSale' }, monthNumber] }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: result.map(item => ({
        category: item._id,
        count: item.count
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get Combined Data
exports.getCombinedData = async (req, res) => {
  try {
    const { month } = req.query;
    
    const [statistics, barChart, pieChart] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            $expr: { $eq: [{ $month: '$dateOfSale' }, Number(new Date(`${month} 1`).getMonth() + 1)] }
          }
        },
        {
          $group: {
            _id: null,
            totalSaleAmount: { $sum: '$price' },
            totalSoldItems: { 
              $sum: { $cond: [{ $eq: ['$sold', true] }, 1, 0] }
            },
            totalNotSoldItems: {
              $sum: { $cond: [{ $eq: ['$sold', false] }, 1, 0] }
            }
          }
        }
      ]),
    ]);

    res.json({
      success: true,
      data: {
        statistics: statistics[0] || {
          totalSaleAmount: 0,
          totalSoldItems: 0,
          totalNotSoldItems: 0
        },
        barChart: barChart,
        pieChart: pieChart
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};