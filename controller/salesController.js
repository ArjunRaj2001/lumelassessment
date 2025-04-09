const getConnection = require('../middlewares/sqlConnection')

exports.totalRevenueCalculations = async (req, res) => {
  const { startDate, endDate } = req.query

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required.' })
  }

  try {
    const connection = await getConnection() 
    const [totalRevenueResult] = await connection.query(
      `
      SELECT 
        SUM((unit_price * quantity_sold) ) AS total_revenue
      FROM orders
      WHERE date_of_sale BETWEEN ? AND ?
      `,
      [startDate, endDate]
    )

    const [productRevenue] = await connection.query(
      `
      SELECT 
        p.name AS product_name,
        SUM((o.unit_price * o.quantity_sold) * (1 - o.discount)) AS revenue
      FROM orders o
      JOIN products p ON o.product_id = p.product_id
      WHERE o.date_of_sale BETWEEN ? AND ?
      GROUP BY p.product_id, p.name
      ORDER BY revenue DESC
      `,
      [startDate, endDate]
    )

    const [categoryRevenue] = await connection.query(
      `
      SELECT 
        p.category AS category,
        SUM((o.unit_price * o.quantity_sold) * (1 - o.discount)) AS revenue
      FROM orders o
      JOIN products p ON o.product_id = p.product_id
      WHERE o.date_of_sale BETWEEN ? AND ?
      GROUP BY p.category
      ORDER BY revenue DESC
      `,
      [startDate, endDate]
    )

    const [regionRevenue] = await connection.query(
      `
      SELECT 
        o.region AS region,
        SUM((o.unit_price * o.quantity_sold) * (1 - o.discount)) AS revenue
      FROM orders o
      WHERE o.date_of_sale BETWEEN ? AND ?
      GROUP BY o.region
      ORDER BY revenue DESC
      `,
      [startDate, endDate]
    )

    const [monthlyTrend] = await connection.query(
      `
      SELECT 
        DATE_FORMAT(o.date_of_sale, '%Y-%m') AS month,
        SUM((o.unit_price * o.quantity_sold) * (1 - o.discount)) AS revenue
      FROM orders o
      WHERE o.date_of_sale BETWEEN ? AND ?
      GROUP BY month
      ORDER BY month ASC
      `,
      [startDate, endDate]
    )

    await connection.end() 

    res.status(200).json({
      totalRevenue: totalRevenueResult[0].total_revenue || 0,
      productRevenue: productRevenue || 0,
      categoryRevenue: categoryRevenue || 0,
      regionRevenue: regionRevenue || 0,
      revenueTrend: monthlyTrend || 0
    })
  } catch (err) {
    console.error('Error fetching revenue data:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.topProducts = async (req, res) => {
  const { startDate, endDate } = req.query

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required.' })
  }

  try {
    const connection = await getConnection()

    const [overallQuantity] = await connection.query(
      `
      SELECT 
        SUM(quantity_sold) AS total_quantity_sold
      FROM orders
      WHERE date_of_sale BETWEEN ? AND ?
      `,
      [startDate, endDate]
    )

    const [categoryQuantity] = await connection.query(
      `
      SELECT 
        p.category AS category,
        SUM(o.quantity_sold) AS quantity_sold
      FROM orders o
      JOIN products p ON o.product_id = p.product_id
      WHERE o.date_of_sale BETWEEN ? AND ?
      GROUP BY p.category
      ORDER BY quantity_sold DESC
      `,
      [startDate, endDate]
    )

    const [regionQuantity] = await connection.query(
      `
      SELECT 
        o.region AS region,
        SUM(o.quantity_sold) AS quantity_sold
      FROM orders o
      WHERE o.date_of_sale BETWEEN ? AND ?
      GROUP BY o.region
      ORDER BY quantity_sold DESC
      `,
      [startDate, endDate]
    )

    await connection.end()

    res.status(200).json({
      totalQuantitySold: overallQuantity[0].total_quantity_sold || 0,
      quantityByCategory: categoryQuantity || 0,
      quantityByRegion: regionQuantity || 0
    })
  } catch (err) {
    console.error('Error fetching quantity data:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

exports.customerAnalizies = async (req, res) => {
  const { startDate, endDate } = req.query

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required.' })
  }

  try {
    const connection = await getConnection()

    const [customerCount] = await connection.query(
      `
      SELECT COUNT(DISTINCT customer_id) AS total_customers
      FROM orders
      WHERE date_of_sale BETWEEN ? AND ?
      `,
      [startDate, endDate]
    )

    const [orderCount] = await connection.query(
      `
      SELECT COUNT(*) AS total_orders
      FROM orders
      WHERE date_of_sale BETWEEN ? AND ?
      `,
      [startDate, endDate]
    )

    const [averageOrder] = await connection.query(
      `
      SELECT 
        AVG((unit_price * quantity_sold) * (1 - discount)) AS average_order_value
      FROM orders
      WHERE date_of_sale BETWEEN ? AND ?
      `,
      [startDate, endDate]
    )

    await connection.end()

    res.status(200).json({
      totalCustomers: customerCount[0].total_customers || 0,
      totalOrders: orderCount[0].total_orders || 0,
      averageOrderValue: parseFloat(averageOrder[0].average_order_value) || 0
    })
  } catch (err) {
    console.error('Error fetching quantity data:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}


exports.otherCalulation = async (req, res) => {
  const { startDate, endDate } = req.query

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required.' })
  }

  try {
    const connection = await getConnection()

    const [profitByProduct] = await connection.query(
      `
      SELECT 
        p.name AS product_name,
        SUM(((o.unit_price * o.quantity_sold) * (1 - o.discount)) - o.shipping_cost) AS profit
      FROM orders o
      JOIN products p ON o.product_id = p.product_id
      WHERE o.date_of_sale BETWEEN ? AND ?
      GROUP BY p.product_id, p.name
      ORDER BY profit DESC
      `,
      [startDate, endDate]
    )

    const [customerLifetimeValue] = await connection.query(
      `
      SELECT 
        c.customer_id,
        c.name AS customer_name,
        SUM((o.unit_price * o.quantity_sold) * (1 - o.discount)) AS lifetime_value
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.date_of_sale BETWEEN ? AND ?
      GROUP BY c.customer_id, c.name
      ORDER BY lifetime_value DESC
      `,
      [startDate, endDate]
    )

    const [customerSegmentation] = await connection.query(
      `
      SELECT 
        c.customer_id,
        c.name AS customer_name,
        SUM((o.unit_price * o.quantity_sold) * (1 - o.discount)) AS total_spent,
        CASE
          WHEN SUM((o.unit_price * o.quantity_sold) * (1 - o.discount)) >= 1000 THEN 'High Value'
          WHEN SUM((o.unit_price * o.quantity_sold) * (1 - o.discount)) BETWEEN 500 AND 999 THEN 'Mid Value'
          ELSE 'Low Value'
        END AS segment
      FROM orders o
      JOIN customers c ON o.customer_id = c.customer_id
      WHERE o.date_of_sale BETWEEN ? AND ?
      GROUP BY c.customer_id, c.name
      ORDER BY total_spent DESC
      `,
      [startDate, endDate]
    )

    await connection.end()

    res.status(200).json({
      profitByProduct,
      customerLifetimeValue,
      customerSegmentation
    })

  } catch (err) {
    console.error('Error fetching quantity data:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

