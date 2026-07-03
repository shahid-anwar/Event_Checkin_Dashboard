const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// ---- AUTH ----
server.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const db = router.db;
  const user = db.get("users").find({ email, password }).value();
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  const token = Buffer.from(`${user.email}:${Date.now()}`).toString("base64");
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// ---- DASHBOARD SUMMARY ----
server.get("/api/dashboard-summary", (req, res) => {
  const db = router.db;
  const customers = db.get("customers").value();
  const total = customers.length;
  const checkedIn = customers.filter(
    (customer) => customer.eventStatus === "Checked-In",
  ).length;
  const waiting = customers.filter(
    (customer) => customer.eventStatus === "Waiting",
  ).length;
  const assigned = customers.filter(
    (customer) => customer.eventStatus === "Assigned",
  ).length;
  const completed = customers.filter(
    (customer) => customer.eventStatus === "Completed",
  ).length;

  res.json({
    totalCustomers: total,
    checkedIn,
    waiting,
    assigned,
    completed,
    statusDistribution: [
      { name: "Waiting", value: waiting },
      { name: "Checked-In", value: checkedIn },
      { name: "Assigned", value: assigned },
      {
        name: "In Discussion",
        value: customers.filter(
          (customer) => customer.eventStatus === "In Discussion",
        ).length,
      },
      { name: "Completed", value: completed },
      {
        name: "Not Interested",
        value: customers.filter(
          (customer) => customer.eventStatus === "Not Interested",
        ).length,
      },
      {
        name: "Follow-Up Required",
        value: customers.filter(
          (customer) => customer.eventStatus === "Follow-Up Required",
        ).length,
      },
    ],
  });
});

// ---- QR VERIFY ----
server.get("/api/qr-codes/verify/:qrCode", (req, res) => {
  const db = router.db;
  const customer = db
    .get("customers")
    .find({ qrCode: req.params.qrCode })
    .value();

  if (!customer) {
    return res
      .status(404)
      .json({ message: "Invalid QR code. No matching customer found." });
  }
  if (customer.qrUsed && customer.eventStatus !== "Waiting") {
    return res.status(409).json({
      message: "This QR code has already been used for check-in.",
      customer,
    });
  }
  return res.json({ customer });
});

// ---- CHECK-IN ----
server.post("/api/customers/check-in", (req, res) => {
  const { qrCode } = req.body;
  const db = router.db;
  const customer = db.get("customers").find({ qrCode }).value();

  if (!customer) {
    return res.status(404).json({ message: "Invalid QR code." });
  }
  if (customer.eventStatus === "Checked-In" || customer.qrUsed) {
    return res.status(409).json({ message: "Customer already checked in." });
  }

  db.get("customers")
    .find({ qrCode })
    .assign({ eventStatus: "Checked-In", qrUsed: true })
    .write();

  db.get("customerStatusHistory")
    .push({
      id: "h" + Date.now(),
      customerId: customer.id,
      status: "Checked-In",
      remarks: "Checked in via QR scan",
      followUpDate: null,
      updatedAt: new Date().toISOString(),
    })
    .write();

  const updated = db.get("customers").find({ qrCode }).value();
  res.json({ customer: updated, message: "Check-in successful" });
});

// ---- CUSTOMER STATUS ----
server.post("/api/customer-status", (req, res) => {
  const { customerId, status, remarks, followUpDate } = req.body;
  const db = router.db;
  const customer = db.get("customers").find({ id: customerId }).value();
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  db.get("customers")
    .find({ id: customerId })
    .assign({ eventStatus: status })
    .write();

  const entry = {
    id: "h" + Date.now(),
    customerId,
    status,
    remarks: remarks || "",
    followUpDate: followUpDate || null,
    updatedAt: new Date().toISOString(),
  };
  db.get("customerStatusHistory").push(entry).write();

  res.json(entry);
});

server.get("/api/customer-status/:customerId", (req, res) => {
  const db = router.db;
  const history = db
    .get("customerStatusHistory")
    .filter({ customerId: req.params.customerId })
    .orderBy(["updatedAt"], ["desc"])
    .value();
  res.json(history);
});

// ---- BOOTH ASSIGNMENT HOOKS — keep customer record in sync ----

// POST /api/boothAssignments — mark customer as Assigned + set booth
server.post("/api/boothAssignments", (req, res, next) => {
  const db = router.db;
  const { customerId, boothNumber } = req.body;
  if (customerId && boothNumber) {
    db.get("customers")
      .find({ id: customerId })
      .assign({ eventStatus: "Assigned", assignedBooth: boothNumber })
      .write();
  }
  next();
});

// PUT /api/boothAssignments/:id — sync status changes back to customer
server.put("/api/boothAssignments/:id", (req, res, next) => {
  const db = router.db;
  const { customerId, boothNumber, status } = req.body;
  if (customerId) {
    const statusMap = {
      Assigned: "Assigned",
      "In Discussion": "In Discussion",
      Completed: "Completed",
      Cancelled: "Checked-In", // release back to checked-in pool
      Waiting: "Checked-In",
    };
    const customerStatus = statusMap[status] || status;
    const assignedBooth = ["Cancelled", "Waiting"].includes(status)
      ? null
      : boothNumber;
    db.get("customers")
      .find({ id: customerId })
      .assign({ eventStatus: customerStatus, assignedBooth })
      .write();
  }
  next();
});

// DELETE /api/boothAssignments/:id — release customer back to Checked-In
server.delete("/api/boothAssignments/:id", (req, res, next) => {
  const db = router.db;
  const assignment = db
    .get("boothAssignments")
    .find({ id: req.params.id })
    .value();
  if (assignment?.customerId) {
    db.get("customers")
      .find({ id: assignment.customerId })
      .assign({ eventStatus: "Checked-In", assignedBooth: null })
      .write();
  }
  next();
});

// ---- Standard REST resources under /api ----
server.use("/api", router);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
});
