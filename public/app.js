const appData = {
  kpis: [
    { label: "Critical Assets Available", value: "42" },
    { label: "Allocated Equipment", value: "76" },
    { label: "Maintenance Today", value: "4" },
    { label: "Overdue Returns", value: "3" },
  ],
  readiness: [
    { name: "Ventilators", detail: "8 available of 10 required", status: "82%", level: "warning" },
    { name: "Oxygen Cylinders", detail: "24 available of 30 required", status: "80%", level: "warning" },
    { name: "Wheelchairs", detail: "18 available of 18 required", status: "100%", level: "success" },
    { name: "ECG Machines", detail: "2 under calibration", status: "67%", level: "danger" },
  ],
  activities: [
    "Ventilator AF-0001 transfer requested by Emergency",
    "ICU Bed AF-0301 booked for 2:00 to 6:00 PM",
    "ECG Machine AF-0045 calibration approved",
    "Oxygen Cylinder AF-0021 overdue by 2 days",
  ],
  departments: [
    ["ICU", "Aditi Rao", "18", "Active"],
    ["Emergency", "Rohan Mehta", "24", "Active"],
    ["Radiology", "Sana Iqbal", "12", "Active"],
    ["Operation Theatre", "Nikhil Shah", "16", "Active"],
  ],
  assets: [
    {
      tag: "AF-0001",
      name: "Ventilator",
      category: "Life Support",
      location: "ICU Bay 2",
      status: "Allocated",
      condition: "Good",
      criticality: "Critical",
    },
    {
      tag: "AF-0021",
      name: "Oxygen Cylinder",
      category: "Life Support",
      location: "Emergency Store",
      status: "Overdue",
      condition: "Refill due",
      criticality: "Critical",
    },
    {
      tag: "AF-0045",
      name: "ECG Machine",
      category: "Diagnostic",
      location: "Cardiology",
      status: "Under Maintenance",
      condition: "Calibration",
      criticality: "High",
    },
    {
      tag: "AF-0102",
      name: "Wheelchair",
      category: "Mobility",
      location: "General Ward",
      status: "Available",
      condition: "Good",
      criticality: "Medium",
    },
    {
      tag: "AF-0200",
      name: "Ambulance",
      category: "Vehicle",
      location: "Ambulance Bay",
      status: "Reserved",
      condition: "Ready",
      criticality: "Critical",
    },
    {
      tag: "AF-0301",
      name: "ICU Bed",
      category: "Room Resource",
      location: "ICU",
      status: "Booked",
      condition: "Sterilized",
      criticality: "High",
    },
  ],
  allocationHistory: [
    ["Today", "Emergency requested transfer from ICU"],
    ["Jul 10", "Allocated to ICU by Asset Manager"],
    ["Jul 08", "Returned by Operation Theatre in good condition"],
    ["Jul 06", "Maintenance resolved and marked available"],
  ],
  bookingSlots: [
    ["09:00", "Ambulance AF-0200 booked by ICU", "success"],
    ["09:30", "Emergency request conflicts with ICU booking", "danger"],
    ["10:00", "Ambulance AF-0200 available", "success"],
    ["14:00", "ICU Bed AF-0301 booked for post-op care", "warning"],
  ],
  maintenance: {
    Pending: ["Oxygen regulator leakage", "Wheelchair brake issue"],
    Approved: ["ECG Machine calibration"],
    "In Progress": ["Ventilator filter replacement"],
    Resolved: ["Ambulance tyre inspection"],
  },
  audit: [
    ["AF-0001 Ventilator", "ICU Bay 2", "Verified", "No action"],
    ["AF-0021 Oxygen Cylinder", "Emergency Store", "Missing", "Flag as lost after approval"],
    ["AF-0102 Wheelchair", "General Ward", "Damaged", "Create maintenance request"],
  ],
  mostUsed: [
    ["ICU Bed AF-0301", "34 bookings this month"],
    ["Ambulance AF-0200", "21 trips this month"],
    ["ECG Machine AF-0045", "18 uses this month"],
  ],
  maintenanceDue: [
    ["Ventilator AF-0001", "Filter replacement due in 2 days"],
    ["ECG Machine AF-0045", "Calibration in progress"],
    ["Ambulance AF-0200", "Service due in 5 days"],
  ],
  readinessChart: [
    ["ICU", 82],
    ["Emergency", 74],
    ["Radiology", 91],
    ["Operation Theatre", 88],
  ],
};

const screenTitles = {
  dashboard: "Dashboard",
  organization: "Organization Setup",
  assets: "Asset Directory",
  allocation: "Allocation & Transfer",
  booking: "Resource Booking",
  maintenance: "Maintenance Workflow",
  audit: "Asset Audit",
  reports: "Reports & Analytics",
};

function badgeClass(value) {
  const normalized = value.toLowerCase();
  if (["missing", "overdue", "under maintenance"].some((text) => normalized.includes(text))) {
    return "danger";
  }
  if (["allocated", "reserved", "booked", "damaged"].some((text) => normalized.includes(text))) {
    return "warning";
  }
  if (["available", "verified", "active", "resolved"].some((text) => normalized.includes(text))) {
    return "success";
  }
  return "";
}

function renderKpis() {
  const kpiGrid = document.querySelector("#kpiGrid");
  kpiGrid.innerHTML = appData.kpis
    .map((kpi) => `<article class="kpi-card"><span>${kpi.label}</span><strong>${kpi.value}</strong></article>`)
    .join("");
}

function renderReadiness() {
  const list = document.querySelector("#readinessList");
  list.innerHTML = appData.readiness
    .map(
      (item) => `
        <div class="readiness-item">
          <div><strong>${item.name}</strong><p class="meta">${item.detail}</p></div>
          <span class="badge ${item.level}">${item.status}</span>
        </div>
      `
    )
    .join("");
}

function renderActivities() {
  const list = document.querySelector("#activityList");
  list.innerHTML = appData.activities
    .map((activity, index) => `<div class="activity-item"><span>${activity}</span><span class="meta">${index + 1}h ago</span></div>`)
    .join("");
}

function renderDepartments() {
  const rows = document.querySelector("#departmentRows");
  rows.innerHTML = appData.departments
    .map(
      ([department, head, assets, status]) => `
        <tr>
          <td>${department}</td>
          <td>${head}</td>
          <td>${assets}</td>
          <td><span class="badge ${badgeClass(status)}">${status}</span></td>
        </tr>
      `
    )
    .join("");
}

function renderAssets(assets = appData.assets) {
  const grid = document.querySelector("#assetGrid");
  grid.innerHTML = assets
    .map(
      (asset) => `
        <article class="asset-card">
          <span class="badge ${badgeClass(asset.status)}">${asset.status}</span>
          <h3>${asset.name}</h3>
          <p class="tag">${asset.tag}</p>
          <p class="meta">
            ${asset.category}<br>
            ${asset.location}<br>
            Condition: ${asset.condition}<br>
            Criticality: ${asset.criticality}
          </p>
        </article>
      `
    )
    .join("");
}

function renderAllocationTimeline() {
  const timeline = document.querySelector("#allocationTimeline");
  timeline.innerHTML = appData.allocationHistory
    .map(([date, text]) => `<div class="timeline-item"><strong>${date}</strong><span>${text}</span></div>`)
    .join("");
}

function renderBookingSlots() {
  const slots = document.querySelector("#bookingSlots");
  slots.innerHTML = appData.bookingSlots
    .map(
      ([time, text, level]) => `
        <div class="calendar-slot">
          <strong>${time}</strong>
          <span>${text}</span>
          <span class="badge ${level}">${level === "danger" ? "Blocked" : "OK"}</span>
        </div>
      `
    )
    .join("");
}

function renderMaintenance() {
  const board = document.querySelector("#maintenanceBoard");
  board.innerHTML = Object.entries(appData.maintenance)
    .map(
      ([column, cards]) => `
        <section class="kanban-column">
          <h3>${column}</h3>
          ${cards.map((card) => `<article class="kanban-card">${card}</article>`).join("")}
        </section>
      `
    )
    .join("");
}

function renderAudit() {
  const rows = document.querySelector("#auditRows");
  rows.innerHTML = appData.audit
    .map(
      ([asset, location, status, action]) => `
        <tr>
          <td>${asset}</td>
          <td>${location}</td>
          <td><span class="badge ${badgeClass(status)}">${status}</span></td>
          <td>${action}</td>
        </tr>
      `
    )
    .join("");
}

function renderReports() {
  document.querySelector("#mostUsedList").innerHTML = appData.mostUsed
    .map(([asset, detail]) => `<div class="list-row"><strong>${asset}</strong><span class="meta">${detail}</span></div>`)
    .join("");

  document.querySelector("#maintenanceDueList").innerHTML = appData.maintenanceDue
    .map(([asset, detail]) => `<div class="list-row"><strong>${asset}</strong><span class="meta">${detail}</span></div>`)
    .join("");

  document.querySelector("#readinessChart").innerHTML = appData.readinessChart
    .map(
      ([department, score]) => `
        <div class="bar-row">
          <strong>${department}</strong>
          <div class="bar-track"><div class="bar-fill" style="width: ${score}%"></div></div>
          <span>${score}%</span>
        </div>
      `
    )
    .join("");
}

function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const screens = document.querySelectorAll(".screen");
  const title = document.querySelector("#screenTitle");

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedScreen = item.dataset.screen;

      navItems.forEach((navItem) => navItem.classList.remove("active"));
      screens.forEach((screen) => screen.classList.remove("active"));

      item.classList.add("active");
      document.querySelector(`#${selectedScreen}`).classList.add("active");
      title.textContent = screenTitles[selectedScreen];
    });
  });
}

function setupSearch() {
  const search = document.querySelector("#assetSearch");
  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    const filtered = appData.assets.filter((asset) =>
      Object.values(asset).some((value) => String(value).toLowerCase().includes(query))
    );
    renderAssets(filtered);
  });
}

function init() {
  renderKpis();
  renderReadiness();
  renderActivities();
  renderDepartments();
  renderAssets();
  renderAllocationTimeline();
  renderBookingSlots();
  renderMaintenance();
  renderAudit();
  renderReports();
  setupNavigation();
  setupSearch();
}

init();
