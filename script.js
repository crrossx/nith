document.querySelector(".page-wrap").style.filter = "blur(5px)";
document.getElementById("loading-screen").style.display = "block";


const API_URL = "https://nith-results-api.deta.dev/students/";

const resultsTable = document.getElementById("results-table");
const resultsBody = document.getElementById("results-body");
const pagination = document.getElementById("pagination");
const pageNumber = document.getElementById("page-number");
const prevPageButton = document.getElementById("prev-page");
const nextPageButton = document.getElementById("next-page");
const searchInput = document.getElementById("search-input");
const departmentSelect = document.getElementById('department-select');
const semesterSelect = document.getElementById('semester-select');

let currentPage = 1;
let totalPages;
let resultsPerPage = 50;
let results;
let filteredResults;

let selectedDepartment = 'all';
let selectedSemester = 'all';

document.querySelector('.clickable').addEventListener('click', function () {
    location.reload();
});

const request = new XMLHttpRequest();
request.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
        results = JSON.parse(this.responseText);
        filteredResults = results;
        totalPages = Math.ceil(filteredResults.length / resultsPerPage);
        renderTable();
    }
};
request.open("GET", API_URL, true);
request.send();



departmentSelect.addEventListener('change', () => {
    selectedDepartment = departmentSelect.value;
    currentPage = 1;
    if (selectedDepartment !== 'all' || selectedSemester !== 'all') {
        searchInput.value = "";
    }
    filterResults();
});

semesterSelect.addEventListener('change', () => {
    selectedSemester = semesterSelect.value;
    currentPage = 1;
    if (selectedDepartment !== 'all' || selectedSemester !== 'all') {
        searchInput.value = "";
    }
    filterResults();
});


prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
});

nextPageButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
});

searchInput.addEventListener("input", () => {
    currentPage = 1;
    if (searchInput.value !== "") {
        departmentSelect.value = 'all';
        selectedDepartment = 'all';
        semesterSelect.value = 'all';
        selectedSemester = 'all';
    }
    filterResults();
});

function filterResults() {
    if (selectedDepartment === 'all' && selectedSemester === 'all') {
        filteredResults = results;
    } else if (selectedDepartment !== 'all' && selectedSemester === 'all') {
        filteredResults = results.filter(result => result.department === selectedDepartment);
    } else if (selectedDepartment === 'all' && selectedSemester !== 'all') {
        filteredResults = results.filter(result => result.semester === parseInt(selectedSemester));
    } else {
        filteredResults = results.filter(result => result.department === selectedDepartment && result.semester === parseInt(selectedSemester));
    }

    filteredResults = filteredResults.filter(result =>
        Object.values(result).some(value => value.toString().toLowerCase().includes(searchInput.value.toLowerCase()))
    );
    totalPages = Math.ceil(filteredResults.length / resultsPerPage);
    renderTable();
}



function renderTable() {
    resultsBody.innerHTML = "";
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const pageResults = filteredResults.slice(startIndex, endIndex);
    pageResults.forEach(result => {
        resultsBody.innerHTML += `
      <tr onclick="location.href='student.html?roll=${result.roll}';" style="cursor: pointer;">
        <td>${result.rank}</td>
        <td>${result.name}</td>
        <td>${result.roll}</td>
        <td>${result.batch_rank}</td>
        <td>${result.semester}</td>
        <td style="font-weight: normal">${result.department.toUpperCase()}</td>
        <td>${result.cgpi}</td>
      </tr>
    `;
    });
    pageNumber.textContent = currentPage;
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
    document.getElementById("loading-screen").style.display = "none";
    const loadingBox = document.querySelector(".loading-box");
    loadingBox.parentNode.removeChild(loadingBox);
    document.querySelector(".page-wrap").style.filter = "none";
}

function redirectToStudentPage(event, roll) {
    event.preventDefault();
    window.location = `student.html?roll=${roll}`;
}