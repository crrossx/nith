let lineGraph = document.querySelector(".line-graph");

var studentCard = document.getElementById('student-info');
const resultCon = document.getElementById('result');


var ctx1 = document.getElementById('chart1').getContext('2d');
var ctx2 = document.getElementById('chart2').getContext('2d');
var gradient1 = ctx1.createLinearGradient(0, 0, 0, 300);
var gradient2 = ctx2.createLinearGradient(0, 0, 0, 300);
gradient1.addColorStop(0, '#5055CB');
gradient1.addColorStop(1, 'rgba(80, 85, 203, 0)');
gradient2.addColorStop(0, '#5055CB');
gradient2.addColorStop(1, 'rgba(80, 85, 203, 0)');



const urlParams = new URLSearchParams(window.location.search);
const roll = urlParams.get('roll');


const lineGrapOptions = {
    aspectRatio: 1.5,
    scales: {
        y: {
            ticks: {
                beginAtZero: false,
                padding: 12,
                maxTicksLimit: 6,
            },
            gridLines: {
                display: true,
            },
        },
        x: {
            ticks: {
                padding: 12,
                maxTicksLimit: 10,
            },
            gridLines: {
                display: true,
            },
        },
    },
    legend: {
        display: false,
    },
    animation: {
        duration: 500,
        easing: "easeOutQuad",
        startValue: 10,
    },
};

const chart1 = new Chart(document.getElementById('chart1'), {
    type: "line",
    data: {
        labels: [], // labels will be set later
        datasets: [{
            data: [], // data will be set later
            label: 'SGPA',
            borderColor: "#5055CB",
            pointBorderColor: "#ADD8E6",
            pointBackgroundColor: "#ADD8E6",
            borderWidth: 3,
            lineTension: 0,
            fill: true,
            backgroundColor: gradient1,
        }, ],
    },
    options: lineGrapOptions,
});

const chart2 = new Chart(document.getElementById('chart2'), {
    type: "line",
    data: {
        labels: [], // labels will be set later
        datasets: [{
            data: [], // data will be set later
            label: 'CGPA',
            borderColor: "#5055CB",
            pointBorderColor: "#ADD8E6",
            pointBackgroundColor: "#ADD8E6",
            borderWidth: 3,
            lineTension: 0,
            fill: true,
            backgroundColor: gradient2,
        }, ],
    },
    options: lineGrapOptions,
});

async function getData(roll) {
    const response = await fetch(`https://nith-results-api.deta.dev/student/${roll}`);
    const data = await response.json();
    return data;
}

async function showData() {

    document.querySelector(".page-wrap").style.filter = "blur(5px)";
    document.getElementById("loading-screen").style.display = "block";
    const data = await getData(roll);
    document.querySelector(".page-wrap").style.filter = "none";
    document.getElementById("loading-screen").style.display = "none";
    document.body.style.filter = "none";

    studentCard.innerHTML += `
        <div class="card-inner1">
        <h1>${data.name}</h1> 
        <h3>${data.roll}</h3>
        </div>
        <div class = "card-inner2">
        <h4> CGPA: ${data.cgpi}</h3>
        <h4> College Rank: ${data.rank}</h4>
        <h4> Class Rank: ${data.batch_rank}</h4>
        <h4> Branch Rank: ${data.branch_rank}</h4>
        </div>
        `;

    data.results.forEach((result) => {
        // Create a container element for the current semester
        const semResult = document.createElement('div');
        semResult.classList.add('container2');

        // Create a table for the current semester
        const table = document.createElement('table');
        table.classList.add('result-table');
        table.innerHTML = `
              <tr>
                <th>SNo.</th>
                <th>Subject</th>
                <th>Grade</th>
              </tr>
            `;

        // Add rows to the table for each subject in the current semester
        result.subjects.forEach((subject, index) => {
            table.innerHTML += `
                <tr>
                  <td>${index + 1}</td>
                  <td>${subject.name}</td>
                  <td>${subject.grade}</td>
                </tr>
              `;
        });

        // Append the table to the container element
        semResult.appendChild(table);

        // Append the container element to the result element
        resultCon.appendChild(semResult);
    });

    // Extract the labels and data from the response object
    const labels = data.results.map((result) => result.sem_no);
    const sgpaData = data.results.map((result) => {
        // Split the sgpa string on "=" and return the float value
        const sgpa = result.sgpi.split("=")[1];
        return parseFloat(sgpa);
    });
    const cgpaData = data.results.map((result) => {
        // Split the cgpa string on "=" and return the float value
        const cgpa = result.cgpi.split("=")[1];
        return parseFloat(cgpa);
    });

    // Update the chart data and redraw the chart
    chart1.data.labels = labels;
    chart1.data.datasets[0].data = sgpaData;
    chart1.update();

    chart2.data.labels = labels;
    chart2.data.datasets[0].data = cgpaData;
    chart2.update();
}

showData();