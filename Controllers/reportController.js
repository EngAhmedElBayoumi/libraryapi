const mongoose = require("mongoose");
const puppeteer = require('puppeteer');
const fs = require('fs');
require("../Models/adminModel");
require("../Models/basicAdminModel");
require("../Models/employeeModel");
require("../Models/memberModel");
require("../Models/bookModel");
require("../Models/transactionModel");
const BookSchema = mongoose.model("books");
const AdminSchema = mongoose.model("admin");
const BAdminSchema = mongoose.model("basicAdmins");
const TransactSchema = mongoose.model("transactions");
const EmpsSchema = mongoose.model("employees");
const MembersSchema = mongoose.model("members");

exports.generalReport1 = async (request, response, next) => {
	let GeneralFinalReport = {};
	let BooksReport = {};
	let TransactionsReport = {};
	let HReport = {};

	const booksData = await BookSchema.aggregate([
		{
			$group: {
				_id: "$id",
				Total_Number_Of_All_Books: { $sum: "$NoOfCopies" },
				All_Available_Books_Now: { $sum: "$Avilable" }, // Add Avaialble Together  ,
				Total_Number_Of_Uniuqe_Books: { $sum: 1 }, // Count the Number of the Docs
			},
		},
		{ $project: { _id: 0 } },
	]);

	const booksCategories = await BookSchema.aggregate([
		// Report.Data2 >> For Categories  ;
		{
			$group: {
				_id: "$Category",
				// Aggregate Books By the Category  ;
				Total_Number_Of_Books: { $sum: 1 },
			},
		},
	]);

	const totalNumberOfTransactions = await TransactSchema.aggregate([
		{ $group: { _id: null, Total_Transactions: { $sum: 1 } } },
		{ $project: { _id: 0 } },
	]);

	const transactionTypesStats = await TransactSchema.aggregate([
		{
			$group: {
				_id: "$status",
				Total_Number_Of_Operation: { $sum: 1 },
			},
		},
	]);

	const topThreeReadingBooks = await TransactSchema.aggregate([
		{
			$match: {
				status: "read",
			},
		},
		{
			$group: {
				_id: "$bookId",
				Total_Number_Of_Operation: { $sum: 1 },
			},
		},
		{
			$lookup: {
				from: "books",
				localField: "_id",
				foreignField: "_id",
				as: "title",
			},
		},
		{
			$sort: { Total_Number_Of_Operation: 1 },
		},
		{
			$project: {
				_id: 0,
				title: { $arrayElemAt: ["$title.title", 0] },
			},
		},
		{
			$limit: 3,
		},
	]);

	const topThreeBorrowBooks = await TransactSchema.aggregate([
		{
			$match: {
				status: "borrow",
			},
		},
		{
			$group: {
				_id: "$bookId",
				Total_Number_Of_Operation: { $sum: 1 },
			},
		},
		{
			$lookup: {
				from: "books",
				localField: "_id",
				foreignField: "_id",
				as: "title",
			},
		},
		// TODO Looup To get the Name , Filter
		{
			$sort: { Total_Number_Of_Operation: 1 },
		},
		{
			$limit: 3,
		},
		{
			$project: {
				_id: 0,
				title: { $arrayElemAt: ["$title.title", 0] },
			},
		},
	]);

	const totalEmps = await EmpsSchema.aggregate([
		{ $group: { _id: null, Total_Number: { $sum: 1 } } },
		{ $project: { _id: 0 } },
	]);
	const totalAdmins = await AdminSchema.aggregate([
		{ $group: { _id: null, Total_Number: { $sum: 1 } } },
		{ $project: { _id: 0 } },
	]);
	const totalBadmins = await BAdminSchema.aggregate([
		{ $group: { _id: null, Total_Number: { $sum: 1 } } },
		{ $project: { _id: 0 } },
	]);
	const totalMembers = await MembersSchema.aggregate([
		{ $group: { _id: null, Total_Number: { $sum: 1 } } },
		{ $project: { _id: 0 } },
	]);

	// const nonReturnedBooks  = await BookSchema.aggregate([
	// 	{
	// 		$match: {
	// 			isReturned: false,
	// 			endDate : {$lt Date.now() }
	// 		},
	// 	},
	// ]) ;
	BooksReport.BooksStatistics = booksData;
	BooksReport.BooksCategoriesStatistics = booksCategories;
	TransactionsReport.TransactionsStatistics = totalNumberOfTransactions;
	TransactionsReport.OperationsStatistics = transactionTypesStats;
	TransactionsReport.MostReadBooks = topThreeReadingBooks;
	TransactionsReport.MostBorrowedBooks = topThreeBorrowBooks;
	HReport.TotalEmployees = totalEmps;
	HReport.TotalAdmins = totalAdmins;
	HReport.TotalBasicAdmins = totalBadmins;
	HReport.TotalMembers = totalMembers;
	// TODO populate the
	// FIXME Populate the ID with Book Name
	GeneralFinalReport.HR_Report = HReport;
	GeneralFinalReport.Books_Report = BooksReport;
	GeneralFinalReport.Transactions_Report = TransactionsReport;
	response.status(200).json({ GeneralFinalReport });
};


exports.currentMonthReading = async (request, response, next) => {
	let reportData = {};
	let monthObj = {};
	const d = new Date();
	let month = d.getMonth(); // 2 For March ,we will need to add One  ;
	let year = d.getFullYear(); // 2023  ;
	month = month + 1;

	const monthReading = await TransactSchema.aggregate([
		{
			$match: {
				status: "read",
			},
		},
		{
			$project: { month: "$startDate" },
		},
	]); // Report Piece 1

	const monthBorrow = await TransactSchema.aggregate([
		{
			$match: {
				status: "borrow",
			},
		},
		{
			$project: { month: "$startDate" },
		},
	]); // Report Piece 2

	let readArrMonth = [];
	let borrowArrMonth = [];
	monthReading.forEach((element) => {
		if (element.month.getMonth() == month) {
			readArrMonth.push(element);
		}
	});
	monthBorrow.forEach((element) => {
		if (element.month.getMonth() == month) {
			borrowArrMonth.push(element);
		}
	});

	monthObj.readData = readArrMonth;
	monthObj.borrowData = borrowArrMonth;

	reportData.CurrentMonthReport = monthObj;
	response.status(200).json({ reportData });
	// TODO: need to be optimized , Just to prove the Idea ; 
};



exports.currentYearReading = async (request, response, next) => {
	let reportData = {};
	let yearObj = {};
	const d = new Date();
	let year = d.getFullYear(); // 2023  ;

	const yearReading = await TransactSchema.aggregate([
		{
			$match: {
				status: "read",
			},
		},
		{
			$project: { year: "$startDate" },
		},
	]); // Report Piece 1

	const yearBorrow = await TransactSchema.aggregate([
		{
			$match: {
				status: "borrow",
			},
		},
		{
			$project: { year: "$startDate" },
		},
	]); // Report Piece 2

	let readArrYear = [];
	let borrowArrYear = [];
	yearReading.forEach((element) => {
		if (element.year.getFullYear() == year) {
			readArrYear.push(element);
		}
	});
	yearBorrow.forEach((element) => {
		if (element.year.getFullYear() == year) {
			borrowArrYear.push(element);
		}
	});

	yearObj.readData = readArrYear;
	yearObj.borrowData = borrowArrYear;

	reportData.CurrentYearReport = yearObj;
	response.status(200).json({ reportData });
	// TODO: need to be optimized , Just to prove the Idea ; 
};

// report by ahmed Tarek 


async function generatePDF(html) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.setContent(html, { waitUntil: 'networkidle0' });
	const pdf = await page.pdf({ format: 'A4' });
	await browser.close();
	//create virable with value GeneralReport-date.now.year-date.now.month
	//get date.now.year
	const year = new Date().getFullYear();
	//get date.now.month long format
	const month = new Date().toLocaleString('default', { month: 'long' });
	//create virable with value GeneralReport-date.now.year-date.now.month
	const fileName = `GeneralReport-${year}-${month}.pdf`;
	
	fs.writeFileSync(fileName, pdf);
  }


// export createReport 
GeneralReport = async(request, response,next) => {
	// create GReportboject 
	const GReport = {}

	// get all employee
	const employees = await EmpsSchema.find();
	// get all members
	const members = await MembersSchema.find();
	// get all books
	const books = await BookSchema.find();
	//get avilable book
	const avilableBooks = await BookSchema.find({status: "avilable"});
	// get total admin
	const admin = await AdminSchema.find();
	// get total basic admin
	const Basicadmin = await BAdminSchema.find();
	// get all transactions
	const transactions = await TransactSchema.find();
	//get  number of  transactions that status = status
	const borrowTransactions= await TransactSchema.find({status:"borrow"})
	// get number of transactions that status read
	const ReadTransactions= await TransactSchema.find({status:"read"})
	// get top five read transactions for the 
	const topFiveReadTransactions = await TransactSchema.find({status:"read"}).sort().limit(5);
	// get top five borrow transactions in this month
	const topFiveBorrowTransactions = await TransactSchema.find({status:"borrow"}).sort().limit(5);
	// put data in GReport object
	GReport.employees = employees.length;
	GReport.members = members.length;
	GReport.books = books.length;
	GReport.avilableBooks = avilableBooks.length;
	GReport.admin = admin.length;
	GReport.Basicadmin = Basicadmin.length;
	GReport.transactions = transactions.length;
	GReport.borrowTransactions = borrowTransactions.length;
	GReport.ReadTransactions = ReadTransactions.length;
	GReport.topFiveReadTransactions = topFiveReadTransactions;
	GReport.topFiveBorrowTransactions = topFiveBorrowTransactions;

	return GReport;
}

// generate report pdf 
exports.generateReport = async(request, response,next) => {
	// get the data that return from GeneralReport function
	const GReport = await GeneralReport();
	const html =` <!DOCTYPE html>
  <html>
  
  <head>
    <title>Report Data</title>
    <!--import bootstrap css cdn -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css"
      integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
      table {
        border-collapse: collapse;
        width: 100%;
      }
  
      th,
      td {
        text-align: left;
        padding: 8px;
      }
  
      th {
        background-color: #ddd;
      }
  
      tr:nth-child(even) {
        background-color: #f2f2f2;
      }
  
      .chart-container {
        width: 600px;
        height: 400px;
        margin: auto;
      }
  
      .canvas {
        margin-top: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      /* make this page come from one page when print */
      @media print {
        .report-container {
          page-break-inside: avoid;
        }
      }
    </style>
  </head>
  
  <body class=".report-container">
    <h1 class="header text-center mt-5">
      General Report
    </h1>
    <div class="container mb-5">
      <div class="report-container">
        <div class="row">
          <div class="col-8">
            <div class="report-section">
              <h2 class="mt-5">HR Report</h2>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Number</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Employees</td>
                    <td id="total-employees">${GReport.employees}</td>
                  </tr>
                  <tr>
                    <td>Total Admins</td>
                    <td id="total-admins">${GReport.admin}</td>
                  </tr>
                  <tr>
                    <td>Total Basic Admins</td>
                    <td id="total-basic-admins">${GReport.Basicadmin}</td>
                  </tr>
                  <tr>
                    <td>Total Members</td>
                    <td id="total-members">${GReport.members}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="col-4 canvas">
            <canvas id="HR" width="100" height="100"></canvas>
          </div>
        </div>
        <div class="row">
  
          <div class="col-8">
            <div class="report-section">
              <h2 class="mt-5">Books Report</h2>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Number</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Number of All Books</td>
                    <td id="total-number-of-all-books">${GReport.books}</td>
                  </tr>
                  <tr>
                    <td>All Available Books Now</td>
                    <td id="all-available-books-now">${GReport.avilableBooks}</td>
                  </tr>
                </tbody>
              </table>
              <div id="books-categories-chart"></div>
            </div>
          </div>
          <div class="col-4 canvas">
            <canvas id="books" width="100" height="100"></canvas>
          </div>
        </div>
        <div class="row">
          <div class="col-8">
            <div class="report-section">
              <h2 class="mt-5">Transactions Report</h2>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Total Number</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Transactions</td>
                    <td id="total-transactions">${GReport.transactions}</td>
                  </tr>
                  <tr>
                    <td>Most Borrowed Books</td>
                    <td id="most-borrowed-books">${GReport.borrowTransactions}</td>
                  </tr>
                  <tr>
                    <td>Most Read Books</td>
                    <td id="most-read-books">${GReport.ReadTransactions}</td>
                  </tr>
                </tbody>
              </table>
              <div id="operations-chart"></div>
            </div>
  
          </div>
          <div class="col-4 canvas">
            <canvas id="transactions" width="100" height="100"></canvas>
          </div>
        </div>
      </div>
      <script>
      

        const reportData = ${GReport};
		const ctx = document.getElementById('HR').getContext('2d');
        const myChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Total Employees', 'Total Admins', 'Total Basic Admins', 'Total Members'],
            datasets: [{
              label: 'Numbers',
              data: [15, 16, 20, 1],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
		//pie chart for transactions report in canvas with id transactions
        const ctx1 = document.getElementById('transactions').getContext('2d');
        const myChart1 = new Chart(ctx1, {
          type: 'pie',
          data: {
            labels: ['Borrow', 'Read'],
            datasets: [{
              label: 'Numbers',
              data: [2, 6],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
		// bar chart
        const ctx2 = document.getElementById('books').getContext('2d');
        const myChart2 = new Chart(ctx2, {
          type: 'bar',
          data: {
            labels: ['Total Number Of All Books', 'All Available Books Now', 'Total Number Of Uniuqe Books'],
            datasets: [{
              label: 'Numbers',
              data: [12, 6, 2],
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)'
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)'
              ],
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
		


        // put the data in his place in report.html
  
        // hr report
        document.getElementById('total-employees').innerHTML = totalEmployees;
        document.getElementById('total-admins').innerHTML = totalAdmins;
        document.getElementById('total-basic-admins').innerHTML = totalBasicAdmins;
        document.getElementById('total-members').innerHTML = totalMembers;
  
  
        // books report
        document.getElementById('total-number-of-all-books').innerHTML = totalNumberOfAllBooks;
        document.getElementById('all-available-books-now').innerHTML = allAvailableBooksNow;
        document.getElementById('total-number-of-uniuqe-books').innerHTML = totalNumberOfUniuqeBooks;
  
        // transactions report
        document.getElementById('total-transactions').innerHTML = transactionsStatistics.Total_Transactions;
        document.getElementById('most-borrowed-books').innerHTML = operationsStatistics[0].Total_Number_Of_Operation;
        document.getElementById('most-read-books').innerHTML = operationsStatistics[1].Total_Number_Of_Operation;
      </script>
  </body>
  
  </html>
  `;

  generatePDF(html);

  response.status(200).json({ message: 'Report Generated Successfully',GReport:GReport });

}

