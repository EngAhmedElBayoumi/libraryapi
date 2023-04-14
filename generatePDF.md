const pdf = require('html-pdf');
const options = { format: 'Letter', open:true };
pdf.create(`<!DOCTYPE html>
<html>

<head>
<title>Monthly Transaction Report</title>
</head>

<body style="font-family: Arial, sans-serif; ">
<div style="text-align: center; margin: 50px 0;">
<h1 style="font-size: 36px; margin-bottom: 10px;">Monthly Report</h1>
<h2 style="font-size: 24px; margin-bottom: 20px;">January 2022</h2>
</div>

<div style="margin-top: 50px; ">
<h2 style="font-size: 24px; margin-bottom: 10px;" id="transactions">Transactions</h2>
<div style="margin-top: 50px;">
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec tristique sapien in massa molestie
        bibendum. Sed iaculis sapien sed velit accumsan, vel euismod eros bibendum. Proin in ex sed quam
        fermentum pharetra.</p>
</div>
<div >
    <table style="border-collapse: collapse;text-align: center; width: 100%;">
        <thead>
            <tr>
                <th style="text-align: center; padding: 10px; background-color: #eee; border: 1px solid #ccc;">
                    title</th>
                <th style="text-align: center; padding: 10px; background-color: #eee; border: 1px solid #ccc;">
                    Result</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="padding: 10px; border: 1px solid #ccc;">1/1/2022</td>
                <td style="padding: 10px; border: 1px solid #ccc;">Lorem ipsum dolor sit amet</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ccc;">1/10/2022</td>
                <td style="padding: 10px; border: 1px solid #ccc;">Consectetur adipiscing elit</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ccc;">1/15/2022</td>
                <td style="padding: 10px; border: 1px solid #ccc;">Donec tristique sapien in massa molestie
                    bibendum</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #ccc;">1/25/2022</td>
                <td style="padding: 10px; border: 1px solid #ccc;">Sed iaculis sapien sed velit accumsan</td>
            </tr>
        </tbody>
    </table>
    <div style="text-align: center;">
        <canvas id="chart" width="500" height="500" style="margin: 0 auto;"></canvas>
    </div>
    </div>
</div>

<script>
// Define your data in a JSON object
var data = {
    "zfbsj": 10,
    "snv": 20,
    "z,onbe": 30,
    "z,nszglz": 15
  
};
// Get the canvas element and its drawing context
var canvas = document.getElementById('chart');
var ctx = canvas.getContext('2d');
// Calculate the total value of the data
var total = 0;
for (var key in data) {
    total += data[key];
}
// Set up some variables for drawing the chart
var cx = canvas.width / 2;
var cy = canvas.height / 2;
var radius = Math.min(cx, cy) * 0.8;
// Loop through the data and draw each slice of the pie chart
var startAngle = 0;
for (var key in data) {
    var sliceAngle = 2 * Math.PI * data[key] / total;
    var endAngle = startAngle + sliceAngle;
    // Draw the slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.fillStyle = getRandomColor(); // for example, you can define this function to generate random colors
    ctx.fill();
    // Draw the label and percentage
    var midAngle = startAngle + sliceAngle / 2;
    var labelRadius = radius * 0.7;
    var dx = Math.cos(midAngle) * labelRadius;
    var dy = Math.sin(midAngle) * labelRadius;
    var labelX = cx + dx;
    var labelY = cy + dy;
    ctx.fillStyle = 'black';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(key + ' (' + Math.round(data[key] / total * 100) + '%)', labelX, labelY);
    startAngle = endAngle;
}

// Helper function to generate random colors
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
</script>

</body>

</html>`
, options).toFile(`./pdf/${reportdate} Monthly Report.pdf`, function(err, res) {
    if (err) return console.log(err);
});