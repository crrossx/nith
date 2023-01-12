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
    document.getElementById("loading-screen").style.display = "none";
    const loadingBox = document.querySelector(".loading-box");
    loadingBox.parentNode.removeChild(loadingBox);
    document.querySelector(".page-wrap").style.filter = "none";



    // FOR STUDENT INFO
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





    // FOR GRAPHS
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

    // FOR SEM RESULT INFO
    // Select the container element for the buttons
    const buttonDiv = document.querySelector('#button-div');
    const resultCon = document.querySelector('.resultCon');

    data.results.forEach((result, semesterIndex) => {
        // Adding the button element to the button container
        const semButton = document.createElement('button');
        semButton.innerHTML = `Semester ${semesterIndex + 1}`;
        semButton.setAttribute('data-semester', semesterIndex);
        semButton.addEventListener('click', () => {
            // Making the clicked button active
            document.querySelectorAll('.semester-button').forEach(button => {
                button.classList.remove('active');
            });
            semButton.classList.add('active');
            const clickedSemesterIndex = semButton.getAttribute('data-semester');
            // Hiding all other result containers
            document.querySelectorAll('.semester-result').forEach(container => {
                container.classList.add('hidden');
            });
            // Showing the result container corresponding to the clicked button
            const semResultContainer = document.querySelector(`.semester-result[data-semester="${clickedSemesterIndex}"]`);
            semResultContainer.classList.remove('hidden');
        });
        semButton.classList.add('semester-button');
        buttonDiv.appendChild(semButton);
    });

    data.results.forEach((result, semesterIndex) => {
        const semResult = document.createElement('div');
        semResult.setAttribute('data-semester', semesterIndex);
        semResult.classList.add('semester-result');
        // semResult.style.display = 'block'; // adding display:block to make the div visible 
        // Creating the table element to display the result
        const table = document.createElement('table');
        table.classList.add('result-table');
        table.innerHTML = `
        <tr>
            <th>SNo.</th>
            <th>Subject</th>
            <th>Grade</th>
        </tr>
    `;

        result.subjects.forEach((subject, subjectIndex) => {
            table.innerHTML += `
            <tr>
                <td>${subjectIndex + 1}</td>
                <td>${subject.name}</td>
                <td>${subject.grade}</td>
            </tr>
        `;
        });

        // Creating the element to display the SGPA, CGPA, etc.
        const credits = document.createElement('div');
        credits.classList.add('semester-results');
        credits.innerHTML = `
        <p>SGPA: ${result.sgpi}</p>
        <p>CGPA: ${result.cgpi}</p>
        <p>Semester Credits: ${result.sgpi_total}</p>
        <p>Total Credits: ${result.cgpi_total} </p>
    `;

        // Adding the table and credits element to the semResult container
        semResult.appendChild(table);
        semResult.appendChild(credits);
        resultCon.appendChild(semResult);
    });

    // Making the first button active by default when the page initially loads
    document.querySelector('.semester-button:first-child').classList.add('active');

    // Hide all the container elements that contain the results of the semesters, except for the first one
    const semesterResults = document.querySelectorAll('.semester-result');
    semesterResults.forEach((container, index) => {
        if (index !== 0) {
            container.classList.add('hidden');
        }
    });
}





//     //delete from here
//     // Create a container element for each semester
//     data.results.forEach((result, semesterIndex) => {
//         // Create a container element for the current semester
//         const semResult = document.createElement('div');
//         semResult.setAttribute('data-semester', semesterIndex);
//         semResult.classList.add('semester-result');
//         // Create a table for the current semester
//         const table = document.createElement('table');
//         table.classList.add('result-table');
//         table.innerHTML = `
//             <tr>
//               <th>SNo.</th>
//               <th>Subject</th>
//               <th>Grade</th>
//             </tr>
//           `;
//         // Add rows to the table for each subject in the current semester
//         result.subjects.forEach((subject, subjectIndex) => {
//             table.innerHTML += `
//             <tr>
//             <td>${subjectIndex + 1}</td>
//             <td>${subject.name}</td>
//             <td>${subject.grade}</td>
//           </tr>
//         `;
//         });


//         const credits = document.createElement('div');
//         credits.classList.add('semester-results');
//         credits.innerHTML = `
//             <p>SGPA  ${result.cgpi}</p>
//             <p>CGPA  ${result.cgpi}</p>
//             <p>Semester Credits = ${result.sgpi_total}</p>
//             <p>Total Credits = ${result.cgpi_total} </p>
//         `;

//         // Append the table to the container element
//         semResult.appendChild(table);
//         semResult.appendChild(credits);
//         // Append the container element to the result container
//         resultCon.appendChild(semResult);


//     });

//     // Make the first button active by default when the page initially loads
//     document.querySelector('.semester-button:first-child').classList.add('active');
//     // Hide all the container elements that contain the results of the semesters, except the first one
//     document.querySelectorAll('.semester-result:not(:first-child)').forEach(container => {
//         container.style.display = 'none';
//     });
// }

showData();