// Database simulation using localStorage
class HRMSDatabase {
    constructor() {
        this.initializeDatabase();
    }
    
    initializeDatabase() {
        if (!localStorage.getItem('hrms_users')) {
            const defaultUsers = [
                {
                    id: 'anshbhadana@unified.com',
                    password: '12345678',
                    name: 'Ansh Bhadana',
                    email: 'anshbhadana@unified.com',
                    role: 'HR',
                    department: 'Management',
                    position: 'HR Manager'
                }
            ];
            localStorage.setItem('hrms_users', JSON.stringify(defaultUsers));
        }
        
        if (!localStorage.getItem('hrms_attendance')) {
            localStorage.setItem('hrms_attendance', JSON.stringify([]));
        }
    }
    
    getUsers() {
        return JSON.parse(localStorage.getItem('hrms_users') || '[]');
    }
    
    addUser(user) {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem('hrms_users', JSON.stringify(users));
        return true;
    }
    
    getUser(userId) {
        const users = this.getUsers();
        return users.find(u => u.id === userId || u.email === userId);
    }
    
    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId || u.email === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('hrms_users', JSON.stringify(users));
            return true;
        }
        return false;
    }
    
    deleteUser(userId) {
        const users = this.getUsers();
        const filteredUsers = users.filter(u => u.id !== userId && u.email !== userId);
        localStorage.setItem('hrms_users', JSON.stringify(filteredUsers));
        return true;
    }
    
    getAttendance() {
        return JSON.parse(localStorage.getItem('hrms_attendance') || '[]');
    }
    
    addAttendance(record) {
        const attendance = this.getAttendance();
        attendance.push(record);
        localStorage.setItem('hrms_attendance', JSON.stringify(attendance));
        return true;
    }
    
    getTodayAttendance() {
        const attendance = this.getAttendance();
        const today = new Date().toDateString();
        return attendance.filter(a => new Date(a.date).toDateString() === today);
    }
    
    updateAttendance(updatedRecord) {
        const attendance = this.getAttendance();
        const index = attendance.findIndex(a => 
            a.employeeId === updatedRecord.employeeId && 
            new Date(a.date).toDateString() === new Date(updatedRecord.date).toDateString()
        );
        if (index !== -1) {
            attendance[index] = updatedRecord;
            localStorage.setItem('hrms_attendance', JSON.stringify(attendance));
            return true;
        }
        return false;
    }
}

const db = new HRMSDatabase();
let currentUser = null;

// Unified login functionality
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const userId = document.getElementById('userId').value;
    const password = document.getElementById('password').value;
    
    const user = db.getUser(userId);
    if (user && user.password === password) {
        currentUser = user;
        
        // Check role and redirect accordingly
        if (user.role === 'HR') {
            showHRDashboard();
        } else {
            showEmployeeDashboard();
        }
    } else {
        showAlert('Invalid credentials', 'danger');
    }
});

// Show HR Dashboard
function showHRDashboard() {
    document.getElementById('loginSection').classList.add('d-none');
    document.getElementById('hrDashboard').classList.remove('d-none');
    document.getElementById('hrName').textContent = `Welcome, ${currentUser.name}`;
    loadEmployees();
    loadAttendance();
    updateReports();
}

// Show Employee Dashboard
function showEmployeeDashboard() {
    document.getElementById('loginSection').classList.add('d-none');
    document.getElementById('employeeDashboard').classList.remove('d-none');
    document.getElementById('employeeName').textContent = `Welcome, ${currentUser.name}`;
    updateDateTime();
    setInterval(updateDateTime, 1000);
    loadEmployeeAttendanceHistory();
    checkTodayAttendance();
}

// Add Employee
document.getElementById('addEmployeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newUser = {
        id: document.getElementById('newEmployeeId').value,
        password: 'password123',
        name: `${document.getElementById('newEmployeeFirstName').value} ${document.getElementById('newEmployeeLastName').value}`,
        email: document.getElementById('newEmployeeEmail').value,
        firstName: document.getElementById('newEmployeeFirstName').value,
        lastName: document.getElementById('newEmployeeLastName').value,
        department: document.getElementById('newEmployeeDepartment').value,
        position: document.getElementById('newEmployeePosition').value,
        phone: document.getElementById('newEmployeePhone').value,
        role: 'Employee',
        status: 'Active'
    };
    
    if (db.getUser(newUser.id)) {
        showAlert('Employee ID already exists', 'danger');
        return;
    }
    
    if (db.getUser(newUser.email)) {
        showAlert('Email already exists', 'danger');
        return;
    }
    
    db.addUser(newUser);
    showAlert('Employee added successfully! Default password: password123', 'success');
    document.getElementById('addEmployeeForm').reset();
    loadEmployees();
    updateReports();
});

// Load Employees
function loadEmployees() {
    const employees = db.getUsers().filter(u => u.role === 'Employee');
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '';
    
    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No employees found</td></tr>';
        return;
    }
    
    employees.forEach(emp => {
        const row = `
            <tr>
                <td>${emp.id}</td>
                <td>${emp.name}</td>
                <td>${emp.email}</td>
                <td>${emp.department}</td>
                <td>${emp.position}</td>
                <td><span class="badge bg-success">${emp.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="resetPassword('${emp.id}')" title="Reset Password">
                        <i class="fas fa-key"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="editEmployee('${emp.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${emp.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Load Attendance
function loadAttendance() {
    const attendance = db.getTodayAttendance();
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';
    
    if (attendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No attendance records for today</td></tr>';
        return;
    }
    
    attendance.forEach(record => {
        const row = `
            <tr>
                <td>${record.employeeId}</td>
                <td>${record.employeeName}</td>
                <td>${record.checkIn || '-'}</td>
                <td>${record.checkOut || '-'}</td>
                <td><span class="badge bg-${record.status === 'Present' ? 'success' : 'warning'}">${record.status}</span></td>
                <td>${record.location || '-'}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Update Reports
function updateReports() {
    const employees = db.getUsers().filter(u => u.role === 'Employee');
    const attendance = db.getTodayAttendance();
    
    document.getElementById('totalEmployees').textContent = employees.length;
    document.getElementById('presentToday').textContent = attendance.filter(a => a.status === 'Present').length;
    document.getElementById('absentToday').textContent = employees.length - attendance.length;
    document.getElementById('lateToday').textContent = attendance.filter(a => a.status === 'Late').length;
}

// Employee Check In
function checkIn() {
    const now = new Date();
    const attendance = {
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        date: now.toDateString(),
        checkIn: now.toLocaleTimeString(),
        checkOut: null,
        status: now.getHours() >= 9 ? 'Late' : 'Present',
        location: 'Office Building'
    };
    
    // Check if already checked in today
    const existingAttendance = db.getTodayAttendance().find(a => a.employeeId === currentUser.id);
    if (existingAttendance && existingAttendance.checkIn && !existingAttendance.checkOut) {
        showAlert('You have already checked in today', 'warning');
        return;
    }
    
    if (existingAttendance) {
        // Update existing record
        attendance.checkIn = existingAttendance.checkIn;
        attendance.status = existingAttendance.status;
    }
    
    db.addAttendance(attendance);
    document.getElementById('checkInBtn').disabled = true;
    document.getElementById('checkOutBtn').disabled = false;
    document.getElementById('attendanceStatus').innerHTML = '<span class="badge bg-success">Checked In</span>';
    showAlert('Checked in successfully!', 'success');
}

// Employee Check Out
function checkOut() {
    const now = new Date();
    const attendance = db.getTodayAttendance().find(a => a.employeeId === currentUser.id);
    
    if (!attendance || !attendance.checkIn) {
        showAlert('Please check in first', 'warning');
        return;
    }
    
    if (attendance.checkOut) {
        showAlert('You have already checked out today', 'warning');
        return;
    }
    
    attendance.checkOut = now.toLocaleTimeString();
    db.updateAttendance(attendance);
    document.getElementById('checkInBtn').disabled = false;
    document.getElementById('checkOutBtn').disabled = true;
    document.getElementById('attendanceStatus').innerHTML = '<span class="badge bg-secondary">Checked Out</span>';
    showAlert('Checked out successfully!', 'success');
}

// Update Date and Time
function updateDateTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleTimeString();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Check Today's Attendance
function checkTodayAttendance() {
    const attendance = db.getTodayAttendance().find(a => a.employeeId === currentUser.id);
    if (attendance) {
        if (attendance.checkIn && !attendance.checkOut) {
            document.getElementById('checkInBtn').disabled = true;
            document.getElementById('checkOutBtn').disabled = false;
            document.getElementById('attendanceStatus').innerHTML = '<span class="badge bg-success">Checked In</span>';
        } else if (attendance.checkOut) {
            document.getElementById('checkInBtn').disabled = true;
            document.getElementById('checkOutBtn').disabled = true;
            document.getElementById('attendanceStatus').innerHTML = '<span class="badge bg-secondary">Checked Out</span>';
        }
    }
}

// Load Employee Attendance History
function loadEmployeeAttendanceHistory() {
    const attendance = db.getAttendance().filter(a => a.employeeId === currentUser.id);
    const tbody = document.getElementById('employeeAttendanceHistory');
    tbody.innerHTML = '';
    
    if (attendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No attendance records found</td></tr>';
        return;
    }
    
    attendance.slice(-10).reverse().forEach(record => {
        const row = `
            <tr>
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${record.checkIn || '-'}</td>
                <td>${record.checkOut || '-'}</td>
                <td><span class="badge bg-${record.status === 'Present' ? 'success' : 'warning'}">${record.status}</span></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Reset Password
function resetPassword(employeeId) {
    if (confirm('Reset password to default (password123)?')) {
        db.updateUser(employeeId, { password: 'password123' });
        showAlert('Password reset successfully!', 'success');
    }
}

// Edit Employee
function editEmployee(employeeId) {
    const employee = db.getUser(employeeId);
    if (!employee) return;
    
    // Populate form with employee data
    document.getElementById('newEmployeeId').value = employee.id;
    document.getElementById('newEmployeeEmail').value = employee.email;
    document.getElementById('newEmployeeFirstName').value = employee.firstName;
    document.getElementById('newEmployeeLastName').value = employee.lastName;
    document.getElementById('newEmployeeDepartment').value = employee.department;
    document.getElementById('newEmployeePosition').value = employee.position;
    document.getElementById('newEmployeePhone').value = employee.phone || '';
    
    // Show add employee section
    showSection('addEmployee');
    
    // Change form submit behavior
    const form = document.getElementById('addEmployeeForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const updatedUser = {
            name: `${document.getElementById('newEmployeeFirstName').value} ${document.getElementById('newEmployeeLastName').value}`,
            email: document.getElementById('newEmployeeEmail').value,
            firstName: document.getElementById('newEmployeeFirstName').value,
            lastName: document.getElementById('newEmployeeLastName').value,
            department: document.getElementById('newEmployeeDepartment').value,
            position: document.getElementById('newEmployeePosition').value,
            phone: document.getElementById('newEmployeePhone').value
        };
        
        db.updateUser(employeeId, updatedUser);
        showAlert('Employee updated successfully!', 'success');
        document.getElementById('addEmployeeForm').reset();
        
        // Reset form submit behavior
        form.onsubmit = arguments.callee;
        
        loadEmployees();
        showSection('employeeList');
    };
}

// Delete Employee
function deleteEmployee(employeeId) {
    if (confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
        db.deleteUser(employeeId);
        loadEmployees();
        updateReports();
        showAlert('Employee deleted successfully!', 'success');
    }
}

// Show Section
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('d-none'));
    document.getElementById(section + 'Section').classList.remove('d-none');
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        document.getElementById('loginSection').classList.remove('d-none');
        document.getElementById('hrDashboard').classList.add('d-none');
        document.getElementById('employeeDashboard').classList.add('d-none');
        
        // Reset form
        document.getElementById('loginForm').reset();
        
        showAlert('Logged out successfully!', 'info');
    }
}

// Show Alert
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Search Employee
document.getElementById('searchEmployee')?.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#employeeTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Initialize location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const locationStatus = document.getElementById('locationStatus');
            if (locationStatus) {
                locationStatus.innerHTML = `<i class="fas fa-map-marker-alt me-2"></i>Location detected (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;
            }
        },
        function(error) {
            const locationStatus = document.getElementById('locationStatus');
            if (locationStatus) {
                locationStatus.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>Location access denied`;
            }
        }
    );
} else {
    const locationStatus = document.getElementById('locationStatus');
    if (locationStatus) {
        locationStatus.innerHTML = `<i class="fas fa-times me-2"></i>Geolocation not supported`;
    }
}

// Auto-refresh attendance every 30 seconds for HR dashboard
setInterval(() => {
    if (currentUser && currentUser.role === 'HR') {
        loadAttendance();
        updateReports();
    }
}, 30000);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + L for logout
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        if (currentUser) {
            logout();
        }
    }
    
    // Escape to close modals/alerts
    if (e.key === 'Escape') {
        const alerts = document.querySelectorAll('.alert');
        alerts.forEach(alert => alert.remove());
    }
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
