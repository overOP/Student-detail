// Initialize data structures in localStorage if they don't exist
function initializeStorage() {
  if (!localStorage.getItem("students")) {
    localStorage.setItem("students", JSON.stringify([]));
  }
  if (!localStorage.getItem("attendance")) {
    localStorage.setItem("attendance", JSON.stringify([]));
  }
  if (!localStorage.getItem("academicMarks")) {
    localStorage.setItem("academicMarks", JSON.stringify([]));
  }
}
//json is a javascript object notation

// DOM elements
const addStudentBtn = document.getElementById("addStudent");
const markAttendanceBtn = document.getElementById("markAttendance");
const viewAttendanceBtn = document.getElementById("viewAttendance");
const addMarksBtn = document.getElementById("addMarks");
const viewPerformanceBtn = document.getElementById("viewPerformance");
const viewAllMarksBtn = document.getElementById("viewAllMarks");
const formsContainer = document.getElementById("formsContainer");
const dataDisplay = document.getElementById("dataDisplay");

// Initialize storage
initializeStorage();

// Event listeners
addStudentBtn.addEventListener("click", () => showAddStudentForm());
markAttendanceBtn.addEventListener("click", showMarkAttendanceForm);
viewAttendanceBtn.addEventListener("click", showAttendanceRecords);
addMarksBtn.addEventListener("click", () => showAddMarksForm());
viewPerformanceBtn.addEventListener("click", showSortedPerformance);
viewAllMarksBtn.addEventListener("click", showAllMarks);

// Helper functions
function getStudents() {
  return JSON.parse(localStorage.getItem("students"));
}

function getAttendance() {
  return JSON.parse(localStorage.getItem("attendance"));
}

function getAcademicMarks() {
  return JSON.parse(localStorage.getItem("academicMarks"));
}

function saveStudents(students) {
  localStorage.setItem("students", JSON.stringify(students));
}

function saveAttendance(attendance) {
  localStorage.setItem("attendance", JSON.stringify(attendance));
}

function saveAcademicMarks(marks) {
  localStorage.setItem("academicMarks", JSON.stringify(marks));
}

function showMessage(message, type = "success") {
  formsContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
  setTimeout(() => {
    formsContainer.innerHTML = "";
  }, 3000);
}

// Student functions
function showAddStudentForm(editIndex = null) {
  let student = { id: "", name: "", class: "" };
  let formTitle = "Add New Student";

  if (editIndex !== null) {
    const students = getStudents();
    student = students[editIndex];
    formTitle = "Edit Student";
  }

  formsContainer.innerHTML = `
        <form id="studentForm">
            <h3>${formTitle}</h3>
            <div class="form-group">
                <label for="studentId">Student ID:</label>
                <input type="text" id="studentId" value="${
                  student.id
                }" required ${editIndex !== null ? "readonly" : ""}>
            </div>
            <div class="form-group">
                <label for="studentName">Name:</label>
                <input type="text" id="studentName" value="${
                  student.name
                }" required>
            </div>
            <div class="form-group">
                <label for="studentClass">Class/Grade:</label>
                <input type="text" id="studentClass" value="${
                  student.class
                }" required>
            </div>
            <div class="form-actions">
                <button type="submit">${
                  editIndex !== null ? "Update" : "Save"
                } Student</button>
                ${
                  editIndex !== null
                    ? '<button type="button" onclick="cancelEdit()">Cancel</button>'
                    : ""
                }
            </div>
        </form>
    `;

  document
    .getElementById("studentForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const studentId = document.getElementById("studentId").value;
      const name = document.getElementById("studentName").value;
      const studentClass = document.getElementById("studentClass").value;

      const students = getStudents();

      if (editIndex !== null) {
        // Update existing student
        students[editIndex] = { id: studentId, name, class: studentClass };
        showMessage("Student updated successfully!");
      } else {
        // Add new student - check if ID already exists
        if (students.some((s) => s.id === studentId)) {
          showMessage("Student ID already exists!", "error");
          return;
        }
        students.push({ id: studentId, name, class: studentClass });
        showMessage("Student added successfully!");
      }

      saveStudents(students);
      showAllStudents();
    });
}

function showAllStudents() {
  const students = getStudents();

  if (students.length === 0) {
    dataDisplay.innerHTML = "<p>No students available.</p>";
    return;
  }

  let tableHTML = `
        <h3>Student List</h3>
        <table>
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Class/Grade</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  students.forEach((student, index) => {
    tableHTML += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editStudent(${index})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteStudent(${index})">Delete</button>
                </td>
            </tr>
        `;
  });

  tableHTML += `
            </tbody>
        </table>
    `;

  dataDisplay.innerHTML = tableHTML;
}

// Attendance functions
function showMarkAttendanceForm() {
  const students = getStudents();

  if (students.length === 0) {
    showMessage("No students available. Please add students first.", "error");
    return;
  }

  let options = students
    .map(
      (student) =>
        `<option value="${student.id}">${student.name} (${student.id})</option>`
    )
    .join("");

  formsContainer.innerHTML = `
        <form id="attendanceForm">
            <h3>Mark Attendance</h3>
            <div class="form-group">
                <label for="attendanceStudentId">Student:</label>
                <select id="attendanceStudentId" required>
                    ${options}
                </select>
            </div>
            <div class="form-group">
                <label for="attendanceDate">Date:</label>
                <input type="date" id="attendanceDate" required>
            </div>
            <div class="form-group">
                <label for="attendanceStatus">Status:</label>
                <select id="attendanceStatus" required>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="submit">Save Attendance</button>
            </div>
        </form>
    `;

  // Set default date to today
  document.getElementById("attendanceDate").valueAsDate = new Date();

  document
    .getElementById("attendanceForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const studentId = document.getElementById("attendanceStudentId").value;
      const date = document.getElementById("attendanceDate").value;
      const status = document.getElementById("attendanceStatus").value;

      const attendance = getAttendance();
      attendance.push({ studentId, date, status });
      saveAttendance(attendance);

      showMessage("Attendance marked successfully!");
      showAttendanceRecords();
    });
}

function showAttendanceRecords() {
  const attendance = getAttendance();
  const students = getStudents();

  if (attendance.length === 0) {
    dataDisplay.innerHTML = "<p>No attendance records available.</p>";
    return;
  }

  // Create a map of student IDs to names for quick lookup
  const studentMap = {};
  students.forEach((student) => {
    studentMap[student.id] = student.name;
  });

  let tableHTML = `
        <h3>Attendance Records</h3>
        <table>
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  attendance.forEach((record, index) => {
    tableHTML += `
            <tr>
                <td>${record.studentId}</td>
                <td>${studentMap[record.studentId] || "Unknown"}</td>
                <td>${record.date}</td>
                <td>${record.status}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editAttendance(${index})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteAttendance(${index})">Delete</button>
                </td>
            </tr>
        `;
  });

  tableHTML += `
            </tbody>
        </table>
    `;

  dataDisplay.innerHTML = tableHTML;
}

// Marks functions
function showAddMarksForm(editIndex = null) {
  const students = getStudents();

  if (students.length === 0) {
    showMessage("No students available. Please add students first.", "error");
    return;
  }

  let options = students
    .map(
      (student) =>
        `<option value="${student.id}">${student.name} (${student.id})</option>`
    )
    .join("");

  let markData = { studentId: students[0].id, subject: "", score: "" };
  let formTitle = "Add Academic Marks";

  if (editIndex !== null) {
    const marks = getAcademicMarks();
    markData = marks[editIndex];
    formTitle = "Edit Academic Marks";
  }

  formsContainer.innerHTML = `
        <form id="marksForm">
            <h3>${formTitle}</h3>
            <div class="form-group">
                <label for="marksStudentId">Student:</label>
                <select id="marksStudentId" required>
                    ${options}
                </select>
            </div>
            <div class="form-group">
                <label for="marksSubject">Subject:</label>
                <input type="text" id="marksSubject" value="${
                  markData.subject
                }" required>
            </div>
            <div class="form-group">
                <label for="marksScore">Marks (out of 100):</label>
                <input type="number" id="marksScore" min="0" max="100" value="${
                  markData.score
                }" required>
            </div>
            <div class="form-actions">
                <button type="submit">${
                  editIndex !== null ? "Update" : "Save"
                } Marks</button>
                ${
                  editIndex !== null
                    ? '<button type="button" onclick="cancelEdit()">Cancel</button>'
                    : ""
                }
            </div>
        </form>
    `;

  // Set the selected student if editing
  if (editIndex !== null) {
    document.getElementById("marksStudentId").value = markData.studentId;
  }

  document.getElementById("marksForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const studentId = document.getElementById("marksStudentId").value;
    const subject = document.getElementById("marksSubject").value;
    const score = parseInt(document.getElementById("marksScore").value);

    const marks = getAcademicMarks();

    if (editIndex !== null) {
      // Update existing mark
      marks[editIndex] = { studentId, subject, score };
      showMessage("Marks updated successfully!");
    } else {
      // Add new mark
      marks.push({ studentId, subject, score });
      showMessage("Marks added successfully!");
    }

    saveAcademicMarks(marks);
    showAllMarks();
  });
}

function showAllMarks() {
  const marks = getAcademicMarks();
  const students = getStudents();

  if (marks.length === 0) {
    dataDisplay.innerHTML = "<p>No academic marks available.</p>";
    return;
  }

  // Create a map of student IDs to names for quick lookup
  const studentMap = {};
  students.forEach((student) => {
    studentMap[student.id] = student.name;
  });

  let tableHTML = `
        <h3>Academic Marks</h3>
        <table>
            <thead>
                <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Subject</th>
                    <th>Marks</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

  marks.forEach((mark, index) => {
    tableHTML += `
            <tr>
                <td>${mark.studentId}</td>
                <td>${studentMap[mark.studentId] || "Unknown"}</td>
                <td>${mark.subject}</td>
                <td>${mark.score}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editMark(${index})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteMark(${index})">Delete</button>
                </td>
            </tr>
        `;
  });

  tableHTML += `
            </tbody>
        </table>
    `;

  dataDisplay.innerHTML = tableHTML;
}

function showSortedPerformance() {
  const marks = getAcademicMarks();
  const students = getStudents();

  if (marks.length === 0) {
    dataDisplay.innerHTML = "<p>No academic marks available.</p>";
    return;
  }

  // Create a map of student IDs to names for quick lookup
  const studentMap = {};
  students.forEach((student) => {
    studentMap[student.id] = student.name;
  });

  // Calculate average scores per student and collect subjects
  const studentScores = {};
  const studentSubjects = {};

  marks.forEach((mark) => {
    if (!studentScores[mark.studentId]) {
      studentScores[mark.studentId] = { total: 0, count: 0 };
      studentSubjects[mark.studentId] = new Set();
    }
    studentScores[mark.studentId].total += mark.score;
    studentScores[mark.studentId].count++;
    studentSubjects[mark.studentId].add(mark.subject);
  });

  // Create array of students with their average scores and subjects
  const performanceData = [];
  for (const studentId in studentScores) {
    const avgScore =
      studentScores[studentId].total / studentScores[studentId].count;
    performanceData.push({
      studentId,
      name: studentMap[studentId] || "Unknown",
      averageScore: avgScore.toFixed(2),
      subjects: Array.from(studentSubjects[studentId]).join(", "),
    });
  }

  // Sort by average score (descending)
  performanceData.sort((a, b) => b.averageScore - a.averageScore);

  // Generate table HTML
  let tableHTML = `
        <h3>Sorted Academic Performance</h3>
        <table>
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Subjects</th>
                    <th>Average Score</th>
                </tr>
            </thead>
            <tbody>
    `;

  performanceData.forEach((student, index) => {
    tableHTML += `
            <tr>
                <td>${index + 1}</td>
                <td>${student.studentId}</td>
                <td>${student.name}</td>
                <td>${student.subjects}</td>
                <td>${student.averageScore}</td>
            </tr>
        `;
  });

  tableHTML += `
            </tbody>
        </table>
    `;

  dataDisplay.innerHTML = tableHTML;
}

// Global functions for button actions
window.editStudent = function (index) {
  showAddStudentForm(index);
};

window.deleteStudent = function (index) {
  if (
    confirm(
      "Are you sure you want to delete this student? This will also delete all related attendance and marks records."
    )
  ) {
    const students = getStudents();
    const studentId = students[index].id;

    // Delete student
    students.splice(index, 1);
    saveStudents(students);

    // Delete related attendance records
    const attendance = getAttendance().filter(
      (record) => record.studentId !== studentId
    );
    saveAttendance(attendance);

    // Delete related academic marks
    const marks = getAcademicMarks().filter(
      (mark) => mark.studentId !== studentId
    );
    saveAcademicMarks(marks);

    showMessage("Student deleted successfully!");
    showAllStudents();
  }
};

window.editMark = function (index) {
  showAddMarksForm(index);
};

window.deleteMark = function (index) {
  if (confirm("Are you sure you want to delete these marks?")) {
    const marks = getAcademicMarks();
    marks.splice(index, 1);
    saveAcademicMarks(marks);
    showMessage("Marks deleted successfully!");
    showAllMarks();
  }
};

window.cancelEdit = function () {
  formsContainer.innerHTML = "";
};

window.editAttendance = function (index) {
  const attendance = getAttendance();
  const record = attendance[index];
  const students = getStudents();

  let options = students
    .map(
      (student) =>
        `<option value="${student.id}" ${
          student.id === record.studentId ? "selected" : ""
        }>${student.name} (${student.id})</option>`
    )
    .join("");

  formsContainer.innerHTML = `
        <form id="editAttendanceForm">
            <h3>Edit Attendance Record</h3>
            <div class="form-group">
                <label for="editAttendanceStudentId">Student:</label>
                <select id="editAttendanceStudentId" required>
                    ${options}
                </select>
            </div>
            <div class="form-group">
                <label for="editAttendanceDate">Date:</label>
                <input type="date" id="editAttendanceDate" value="${
                  record.date
                }" required>
            </div>
            <div class="form-group">
                <label for="editAttendanceStatus">Status:</label>
                <select id="editAttendanceStatus" required>
                    <option value="present" ${
                      record.status === "present" ? "selected" : ""
                    }>Present</option>
                    <option value="absent" ${
                      record.status === "absent" ? "selected" : ""
                    }>Absent</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="submit">Update Attendance</button>
                <button type="button" onclick="cancelEdit()">Cancel</button>
            </div>
        </form>
    `;

  document
    .getElementById("editAttendanceForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      const studentId = document.getElementById(
        "editAttendanceStudentId"
      ).value;
      const date = document.getElementById("editAttendanceDate").value;
      const status = document.getElementById("editAttendanceStatus").value;

      attendance[index] = { studentId, date, status };
      saveAttendance(attendance);

      showMessage("Attendance updated successfully!");
      showAttendanceRecords();
    });
};

window.deleteAttendance = function (index) {
  if (confirm("Are you sure you want to delete this attendance record?")) {
    const attendance = getAttendance();
    attendance.splice(index, 1);
    saveAttendance(attendance);
    showMessage("Attendance record deleted successfully!");
    showAttendanceRecords();
  }
};

// Initialize by showing all students
showAllStudents();
