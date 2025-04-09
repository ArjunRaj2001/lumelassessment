const fs = require('fs')
const csv = require('csv-parser')
const getConnection = require('../middlewares/sqlConnection') 
const path = require('path')
const customersMap = new Map()
const productsMap = new Map()
const orders = []

async function main() {
  const connection = await getConnection() 

  await connection.query(`DROP TABLE IF EXISTS orders`)
  await connection.query(`DROP TABLE IF EXISTS products`)
  await connection.query(`DROP TABLE IF EXISTS customers`)

  await connection.query(`
    CREATE TABLE customers (
      customer_id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100),
      address TEXT
    )
  `)

  await connection.query(`
    CREATE TABLE products (
      product_id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(100),
      category VARCHAR(50)
    )
  `)

  await connection.query(`
    CREATE TABLE orders (
      order_id INT PRIMARY KEY,
      product_id VARCHAR(10),
      customer_id VARCHAR(10),
      region VARCHAR(50),
      date_of_sale DATETIME,
      quantity_sold INT,
      unit_price DECIMAL(10, 2),
      discount DECIMAL(5, 2),
      shipping_cost DECIMAL(10, 2),
      payment_method VARCHAR(50),
      FOREIGN KEY (product_id) REFERENCES products(product_id),
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    )
  `)
  const csvFilePath = path.join(__dirname, '../sales_data.csv')
  fs.createReadStream(csvFilePath)
  
    .pipe(csv())
    .on('data', (row) => {
      const customer_id = row['Customer ID']
      const product_id = row['Product ID']

      if (!customersMap.has(customer_id)) {
        customersMap.set(customer_id, [
          customer_id,
          row['Customer Name'],
          row['Customer Email'],
          row['Customer Address']
        ])
      }

      if (!productsMap.has(product_id)) {
        productsMap.set(product_id, [
          product_id,
          row['Product Name'],
          row['Category']
        ])
      }

      orders.push([
        parseInt(row['Order ID']),
        product_id,
        customer_id,
        row['Region'],
        row['Date of Sale'],
        parseInt(row['Quantity Sold']),
        parseFloat(row['Unit Price']),
        parseFloat(row['Discount']),
        parseFloat(row['Shipping Cost']),
        row['Payment Method']
      ])
    })
    .on('end', async () => {
      console.log('CSV processed.')

      await connection.query(
        `INSERT INTO customers (customer_id, name, email, address) VALUES ?`,
        [Array.from(customersMap.values())]
      )

      await connection.query(
        `INSERT INTO products (product_id, name, category) VALUES ?`,
        [Array.from(productsMap.values())]
      )

      await connection.query(
        `INSERT INTO orders (order_id, product_id, customer_id, region, date_of_sale, quantity_sold, unit_price, discount, shipping_cost, payment_method) VALUES ?`,
        [orders]
      )

      console.log('Data inserted.')
      await connection.end()
    })
}

main().catch((err) => {
  console.error('❌ Error:', err)
})
