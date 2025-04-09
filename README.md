 # lumelassessment
 Install XAPP Application
 In XAPP Applicaiton Start MySQL and Apache server
 Load you CSV file in Main Folder and renamme in "sales_data.csv"
 npm run migrate => This cmd to load all csv file to store in database
 npm start => To start the server. 
 The server will start in (http://localhost:4000) 

 Pass Qery params startDate, endDate in formatt matching date_of_sale in orders table.
 Revenue Calculation => http://localhost:4000/sales/revenue_calculation
 Top N Products  => http://localhost:4000/sales/top_prodcuts
 Customer Analysis => http://localhost:4000/sales/customer_analizies
 Other Calculations => http://localhost:4000/sales/other_calculation