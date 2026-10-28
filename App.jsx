
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api/applications";

function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company: "",
    role: "",
    jobType: "Full-time",
    appliedDate: new Date().toISOString().slice(0, 10),
    expectedSalary: "",
    notes: "",
    followUpDate: "",
  });

  const loadApplications = async () => {
    try {
      setError("");
      const response = await axios.get(API);
      setApplications(
        Array.isArray(response.data)
          ? response.data
          : response.data.applications || response.data.data || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load applications. Check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await axios.post(API, {
        ...form,
        expectedSalary: form.expectedSalary
          ? Number(form.expectedSalary)
          : null,
      });

      setForm({
        company: "",
        role: "",
        jobType: "Full-time",
        appliedDate: new Date().toISOString().slice(0, 10),
        expectedSalary: "",
        notes: "",
        followUpDate: "",
      });

      await loadApplications();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save the application. Check the required fields."
      );
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setError("");
      await axios.patch(`${API}/${id}/status`, { status });
      await loadApplications();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not update the application."
      );
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm("Delete this application?")) return;

    try {
      setError("");
      await axios.delete(`${API}/${id}`);
      await loadApplications();
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not delete the application."
      );
    }
  };

  return (
    <main className="app-container">
      <h1>Job Application Tracker</h1>
      <p>Keep track of your job applications in one place.</p>

      {error && <p role="alert" className="error-message">{error}</p>}

      <section>
        <h2>Add an Application</h2>

        <form onSubmit={handleSubmit}>
          <label>
            Company
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Job Role
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Job Type
            <select
              name="jobType"
              value={form.jobType}
              onChange={handleChange}
              required
            >
              <option>Full-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>
          </label>

          <label>
            Applied Date
            <input
              type="date"
              name="appliedDate"
              value={form.appliedDate}
              onChange={handleChange}
              max={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>

          <label>
            Expected Salary
            <input
              type="number"
              name="expectedSalary"
              value={form.expectedSalary}
              onChange={handleChange}
              min="0"
            />
          </label>

          <label>
            Follow-up Date
            <input
              type="date"
              name="followUpDate"
              value={form.followUpDate}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
            />
          </label>

          <button type="submit">Add Application</button>
        </form>
      </section>

      <section>
        <h2>My Applications ({applications.length})</h2>

        {loading ? (
          <p>Loading applications...</p>
        ) : applications.length === 0 ? (
          <p>No applications yet. Add one using the form above.</p>
        ) : (
          <div className="applications-list">
            {applications.map((application) => (
              <article
                key={application._id || application.applicationId}
                className="application-card"
              >
                <h3>{application.company}</h3>
                <p><strong>Role:</strong> {application.role}</p>
                <p><strong>Type:</strong> {application.jobType}</p>
                <p>
                  <strong>Applied:</strong>{" "}
                  {application.appliedDate
                    ? new Date(application.appliedDate).toLocaleDateString()
                    : "Not specified"}
                </p>
                <p>
                  <strong>Expected Salary:</strong>{" "}
                  {application.expectedSalary ?? "Not specified"}
                </p>
                <p>
                  <strong>Follow-up:</strong>{" "}
                  {application.followUpDate
                    ? new Date(application.followUpDate).toLocaleDateString()
                    : "Not specified"}
                </p>
                <p><strong>Notes:</strong> {application.notes || "None"}</p>
                <p>
                  <strong>Status:</strong> {application.status || "Applied"}
                </p>

                <label>
                  Update Status
                  <select
                    value={application.status || "Applied"}
                    onChange={(event) =>
                      updateStatus(
                        application._id || application.applicationId,
                        event.target.value
                      )
                    }
                  >
                    <option>Applied</option>
                    <option>Interview</option>
                    <option>Offer</option>
                    <option>Rejected</option>
                    <option>Accepted</option>
                    <option>Declined</option>
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    deleteApplication(
                      application._id || application.applicationId
                    )
                  }
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
