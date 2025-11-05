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
                    position: 'HR Manager',
                    plan: 'Enterprise',
                    location: 'Head Office'
                }
            ];
            localStorage.setItem('hrms_users', JSON.stringify(defaultUsers));
        }
        
        if (!localStorage.getItem('hrms_attendance')) {
            localStorage.setItem('hrms_attendance', JSON.stringify([]));
        }
        
        if (!localStorage.getItem('hrms_shifts')) {
            const defaultShifts = [
                {
                    id: 'shift_1',
                    name: 'Morning Shift',
                    startTime: '09:00',
                    endTime: '17:00',
                    gracePeriod: 15
                },
                {
                    id: 'shift_2',
                    name: 'Evening Shift',
                    startTime: '14:00',
                    endTime: '22:00',
                    gracePeriod: 15
                }
            ];
            localStorage.setItem('hrms_shifts', JSON.stringify(defaultShifts));
        }
        
        if (!localStorage.getItem('hrms_locations')) {
            const defaultLocations = [
                {
                    id: 'loc_1',
                    name: 'Head Office',
                    address: '123 Main Street, City',
                    latitude: 28.6139,
                    longitude: 77.2090,
                    radius: 100,
                    status: 'Active'
                }
            ];
            localStorage.setItem('hrms_locations', JSON.stringify(defaultLocations));
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
    
    getShifts() {
        return JSON.parse(localStorage.getItem('hrms_shifts') || '[]');
    }
    
    addShift(shift) {
        const shifts = this.getShifts();
        shift.id = 'shift_' + Date.now();
        shifts.push(shift);
        localStorage.setItem('hrms_shifts', JSON.stringify(shifts));
        return true;
    }
    
    updateShift(shiftId, updates) {
        const shifts = this.getShifts();
        const index = shifts.findIndex(s => s.id === shiftId);
        if (index !== -1) {
            shifts[index] = { ...shifts[index], ...updates };
            localStorage.setItem('hrms_shifts', JSON.stringify(shifts));
            return true;
        }
        return false;
    }
    
    deleteShift(shiftId) {
        const shifts = this.getShifts();
        const filteredShifts = shifts.filter(s => s.id !== shiftId);
        localStorage.setItem('hrms_shifts', JSON.stringify(filteredShifts));
        return true;
    }
    
    getLocations() {
        return JSON.parse(localStorage.getItem('hrms_locations') || '[]');
    }
    
    addLocation(location) {
        const locations = this.getLocations();
        location.id = 'loc_' + Date.now();
        locations.push(location);
        localStorage.setItem('hrms_locations', JSON.stringify(locations));
        return true;
    }
    
    updateLocation(locationId, updates) {
        const locations = this.getLocations();
        const index = locations.findIndex(l => l.id === locationId);
        if (index !== -1) {
            locations[index] = { ...locations[index], ...updates };
            localStorage.setItem('hrms_locations', JSON.stringify(locations));
            return true;
        }
        return false;
    }
    
    deleteLocation(locationId) {
        const locations = this.getLocations();
        const filteredLocations = locations.filter(l => l.id !== locationId);
        localStorage.setItem('hrms_locations', JSON.stringify(filteredLocations));
        return true;
    }
    
    checkLocation(latitude, longitude, locationId) {
        const locations = this.getLocations();
        const location = locations.find(l => l.id === locationId);
        
        if (!location) return false;
        
        const distance = calculateDistance(
            latitude, longitude,
            location.latitude, location.longitude
        );
        
        return distance <= location.radius;
    }
}

// Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
}

const db = new HRMSDatabase();
let currentUser = null;
let currentLocation = null;

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
    loadShifts();
    loadLocations();
    updateReports();
    populateLocationSelect();
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
    loadCurrentShift();
    getCurrentLocation();
}

// Add Employee
document.getElementById('addEmployeeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const passwordInput = document.getElementById('newEmployeePassword').value;
    const password = passwordInput || '123456';
    
    const newUser = {
        id: document.getElementById('newEmployeeId').value,
        password: password,
        name: `${document.getElementById('newEmployeeFirstName').value} ${document.getElementById('newEmployeeLastName').value}`,
        email: document.getElementById('newEmployeeEmail').value,
        firstName: document.getElementById('newEmployeeFirstName').value,
        lastName: document.getElementById('newEmployeeLastName').value,
        department: document.getElementById('newEmployeeDepartment').value,
        position: document.getElementById('newEmployeePosition').value,
        phone: document.getElementById('newEmployeePhone').value,
        plan: document.getElementById('newEmployeePlan').value,
        location: document.getElementById('newEmployeeLocation').value,
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
    showAlert(`Employee added successfully! Password: ${password}`, 'success');
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
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">No employees found</td></tr>';
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
                <td><span class="badge badge-${emp.plan.toLowerCase()}">${emp.plan}</span></td>
                <td>${emp.location || '-'}</td>
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
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No attendance records for today</td></tr>';
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
                <td>${record.shift || '-'}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Load Shifts
function loadShifts() {
    const shifts = db.getShifts();
    const tbody = document.getElementById('shiftTableBody');
    tbody.innerHTML = '';
    
    if (shifts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No shifts found</td></tr>';
        return;
    }
    
    shifts.forEach(shift => {
        const row = `
            <tr>
                <td>${shift.name}</td>
                <td>${shift.startTime}</td>
                <td>${shift.endTime}</td>
                <td>${shift.gracePeriod} minutes</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editShift('${shift.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteShift('${shift.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Load Locations
function loadLocations() {
    const locations = db.getLocations();
    const tbody = document.getElementById('locationTableBody');
    tbody.innerHTML = '';
    
    if (locations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No locations found</td></tr>';
        return;
    }
    
    locations.forEach(location => {
        const row = `
            <tr>
                <td>${location.name}</td>
                <td>${location.address}</td>
                <td>${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}</td>
                <td>${location.radius}m</td>
                <td><span class="badge bg-${location.status === 'Active' ? 'success' : 'secondary'}">${location.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="editLocation('${location.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteLocation('${location.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Populate Location Select
function populateLocationSelect() {
    const locations = db.getLocations();
    const select = document.getElementById('newEmployeeLocation');
    select.innerHTML = '<option value="">Select Location</option>';
    
    locations.forEach(location => {
        if (location.status === 'Active') {
            select.innerHTML += `<option value="${location.name}">${location.name}</option>`;
        }
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
    if (!currentLocation) {
        showAlert('Please wait for location detection', 'warning');
        return;
    }
    
    // Check if employee is at assigned location
    const employeeLocation = db.getLocations().find(l => l.name === currentUser.location);
    if (employeeLocation) {
        const isAtLocation = db.checkLocation(
            currentLocation.latitude, 
            currentLocation.longitude, 
            employeeLocation.id
        );
        
        if (!isAtLocation) {
            showAlert('You are not within the designated office location', 'danger');
            return;
        }
    }
    
    const now = new Date();
    const currentShift = getCurrentShiftForTime(now);
    
    const attendance = {
        employeeId: currentUser.id,
        employeeName: currentUser.name,
        date: now.toDateString(),
        checkIn: now.toLocaleTimeString(),
        checkOut: null,
        status: determineAttendanceStatus(now, currentShift),
        location: currentUser.location || 'Office',
        shift: currentShift ? currentShift.name : 'General'
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

// Get current location
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                const locationStatus = document.getElementById('locationStatus');
                locationStatus.innerHTML = `<i class="fas fa-map-marker-alt me-2 location-valid"></i>Location detected (${currentLocation.latitude.toFixed(4)}, ${currentLocation.longitude.toFixed(4)})`;
                
                // Check if within designated location
                if (currentUser.location) {
                    const employeeLocation = db.getLocations().find(l => l.name === currentUser.location);
                    if (employeeLocation) {
                        const isAtLocation = db.checkLocation(
                            currentLocation.latitude, 
                            currentLocation.longitude, 
                            employeeLocation.id
                        );
                        
                        if (!isAtLocation) {
                            locationStatus.innerHTML += `<br><small class="text-danger">Not within office location (${employeeLocation.radius}m radius)</small>`;
                        } else {
                            locationStatus.innerHTML += `<br><small class="text-success">Within office location</small>`;
                        }
                    }
                }
            },
            function(error) {
                const locationStatus = document.getElementById('locationStatus');
                locationStatus.innerHTML = `<i class="fas fa-exclamation-triangle me-2 location-invalid"></i>Location access denied`;
                showAlert('Location access is required for attendance', 'warning');
            }
        );
    } else {
        const locationStatus = document.getElementById('locationStatus');
        locationStatus.innerHTML = `<i class="fas fa-times me-2 location-invalid"></i>Geolocation not supported`;
    }
}

// Get current location for form
function getCurrentLocationForForm() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                document.getElementById('locationLat').value = position.coords.latitude.toFixed(6);
                document.getElementById('locationLng').value = position.coords.longitude.toFixed(6);
                showAlert('Location captured successfully', 'success');
            },
            function(error) {
                showAlert('Failed to get location', 'danger');
            }
        );
    } else {
        showAlert('Geolocation not supported', 'danger');
    }
}

// Load current shift for employee
function loadCurrentShift() {
    const now = new Date();
    const currentShift = getCurrentShiftForTime(now);
    const shiftInfo = document.getElementById('shiftInfo');
    
    if (currentShift) {
        shiftInfo.innerHTML = `<i class="fas fa-clock me-2"></i>Current Shift: ${currentShift.name} (${currentShift.startTime} - ${currentShift.endTime})`;
    } else {
        shiftInfo.innerHTML = `<i class="fas fa-clock me-2"></i>No active shift at this time`;
    }
}

// Get current shift for time
function getCurrentShiftForTime(time) {
    const shifts = db.getShifts();
    const currentTime = time.getHours() * 60 + time.getMinutes();
    
    for (const shift of shifts) {
        const [startHour, startMin] = shift.startTime.split(':').map(Number);
        const [endHour, endMin] = shift.endTime.split(':').map(Number);
        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;
        
        if (currentTime >= startTime && currentTime <= endTime) {
            return shift;
        }
    }
    
    return null;
}

// Determine attendance status
function determineAttendanceStatus(time, shift) {
    if (!shift) return 'Present';
    
    const [startHour, startMin] = shift.startTime.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const currentTime = time.getHours() * 60 + time.getMinutes();
    
    if (currentTime <= startTime + shift.gracePeriod) {
        return 'Present';
    } else {
        return 'Late';
    }
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
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No attendance records found</td></tr>';
        return;
    }
    
    attendance.slice(-10).reverse().forEach(record => {
        const row = `
            <tr>
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${record.checkIn || '-'}</td>
                <td>${record.checkOut || '-'}</td>
                <td><span class="badge bg-${record.status === 'Present' ? 'success' : 'warning'}">${record.status}</span></td>
                <td>${record.location || '-'}</td>
                <td>${record.shift || '-'}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

// Shift Management Functions
function showAddShiftModal() {
    const modal = new bootstrap.Modal(document.getElementById('addShiftModal'));
    document.getElementById('addShiftForm').reset();
    modal.show();
}

function addShift() {
    const shift = {
        name: document.getElementById('shiftName').value,
        startTime: document.getElementById('shiftStartTime').value,
        endTime: document.getElementById('shiftEndTime').value,
        gracePeriod: parseInt(document.getElementById('shiftGracePeriod').value)
    };
    
    db.addShift(shift);
    showAlert('Shift added successfully', 'success');
    bootstrap.Modal.getInstance(document.getElementById('addShiftModal')).hide();
    loadShifts();
}

function editShift(shiftId) {
    const shift = db.getShifts().find(s => s.id === shiftId);
    if (!shift) return;
    
    document.getElementById('shiftName').value = shift.name;
    document.getElementById('shiftStartTime').value = shift.startTime;
    document.getElementById('shiftEndTime').value = shift.endTime;
    document.getElementById('shiftGracePeriod').value = shift.gracePeriod;
    
    const modal = new bootstrap.Modal(document.getElementById('addShiftModal'));
    modal.show();
    
    // Change form submit behavior
    const form = document.getElementById('addShiftForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const updatedShift = {
            name: document.getElementById('shiftName').value,
            startTime: document.getElementById('shiftStartTime').value,
            endTime: document.getElementById('shiftEndTime').value,
            gracePeriod: parseInt(document.getElementById('shiftGracePeriod').value)
        };
        
        db.updateShift(shiftId, updatedShift);
        showAlert('Shift updated successfully', 'success');
        modal.hide();
        loadShifts();
        
        // Reset form submit behavior
        form.onsubmit = function() { addShift(); };
    };
}

function deleteShift(shiftId) {
    if (confirm('Are you sure you want to delete this shift?')) {
        db.deleteShift(shiftId);
        showAlert('Shift deleted successfully', 'success');
        loadShifts();
    }
}

// Location Management Functions
function showAddLocationModal() {
    const modal = new bootstrap.Modal(document.getElementById('addLocationModal'));
    document.getElementById('addLocationForm').reset();
    modal.show();
}

function addLocation() {
    const location = {
        name: document.getElementById('locationName').value,
        address: document.getElementById('locationAddress').value,
        latitude: parseFloat(document.getElementById('locationLat').value),
        longitude: parseFloat(document.getElementById('locationLng').value),
        radius: parseInt(document.getElementById('locationRadius').value),
        status: 'Active'
    };
    
    db.addLocation(location);
    showAlert('Location added successfully', 'success');
    bootstrap.Modal.getInstance(document.getElementById('addLocationModal')).hide();
    loadLocations();
    populateLocationSelect();
}

function editLocation(locationId) {
    const location = db.getLocations().find(l => l.id === locationId);
    if (!location) return;
    
    document.getElementById('locationName').value = location.name;
    document.getElementById('locationAddress').value = location.address;
    document.getElementById('locationLat').value = location.latitude;
    document.getElementById('locationLng').value = location.longitude;
    document.getElementById('locationRadius').value = location.radius;
    
    const modal = new bootstrap.Modal(document.getElementById('addLocationModal'));
    modal.show();
    
    // Change form submit behavior
    const form = document.getElementById('addLocationForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const updatedLocation = {
            name: document.getElementById('locationName').value,
            address: document.getElementById('locationAddress').value,
            latitude: parseFloat(document.getElementById('locationLat').value),
            longitude: parseFloat(document.getElementById('locationLng').value),
            radius: parseInt(document.getElementById('locationRadius').value)
        };
        
        db.updateLocation(locationId, updatedLocation);
        showAlert('Location updated successfully', 'success');
        modal.hide();
        loadLocations();
        populateLocationSelect();
        
        // Reset form submit behavior
        form.onsubmit = function() { addLocation(); };
    };
}

function deleteLocation(locationId) {
    if (confirm('Are you sure you want to delete this location?')) {
        db.deleteLocation(locationId);
        showAlert('Location deleted successfully', 'success');
        loadLocations();
        populateLocationSelect();
    }
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('newEmployeePassword');
    const passwordToggle = document.getElementById('passwordToggle');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.classList.remove('fa-eye');
        passwordToggle.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordToggle.classList.remove('fa-eye-slash');
        passwordToggle.classList.add('fa-eye');
    }
}

// Reset Password
function resetPassword(employeeId) {
    if (confirm('Reset password to default (123456)?')) {
        db.updateUser(employeeId, { password: '123456' });
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
    document.getElementById('newEmployeePlan').value = employee.plan || 'Professional';
    document.getElementById('newEmployeeLocation').value = employee.location || '';
    
    // Show add employee section
    showSection('addEmployee');
    
    // Change form submit behavior
    const form = document.getElementById('addEmployeeForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const passwordInput = document.getElementById('newEmployeePassword').value;
        const updatedUser = {
            name: `${document.getElementById('newEmployeeFirstName').value} ${document.getElementById('newEmployeeLastName').value}`,
            email: document.getElementById('newEmployeeEmail').value,
            firstName: document.getElementById('newEmployeeFirstName').value,
            lastName: document.getElementById('newEmployeeLastName').value,
            department: document.getElementById('newEmployeeDepartment').value,
            position: document.getElementById('newEmployeePosition').value,
            phone: document.getElementById('newEmployeePhone').value,
            plan: document.getElementById('newEmployeePlan').value,
            location: document.getElementById('newEmployeeLocation').value
        };
        
        if (passwordInput) {
            updatedUser.password = passwordInput;
        }
        
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
        currentLocation = null;
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
