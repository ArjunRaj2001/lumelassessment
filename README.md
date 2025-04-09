# LumelAssessment

### Setup Instructions

1. **Install XAMPP Application**  
2. In XAMPP, start both **MySQL** and **Apache Server**  
3. Place your CSV file in the project’s main folder and rename it to **`sales_data.csv`**  
4. Run the following command to load CSV data into MySQL:  **npm run migrate**


5. To start the server: **npm start**


The server will start at: **(http://localhost:4000)**

---

### API Usage

Pass query parameters `startDate` and `endDate` in a format matching `date_of_sale` in the `orders` table.

- **Revenue Calculation**  
`GET http://localhost:4000/sales/revenue_calculation`

- **Top N Products**  
`GET http://localhost:4000/sales/top_products`

- **Customer Analysis**  
`GET http://localhost:4000/sales/customer_analizies`

- **Other Calculations**  
`GET http://localhost:4000/sales/other_calculation`
