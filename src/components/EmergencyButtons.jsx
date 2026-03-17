import { useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";

/**
 * EmergencyButtons
 *
 * Renders role-aware emergency action buttons:
 *  - For STAFF role: shows "🚨 Emergency" button → POST /api/notifications/emergency
 *  - For PATIENT role (with admission=true): shows "🆘 Help" button → POST /api/notifications/help
 *
 * Usage:
 *   import EmergencyButtons from '../components/EmergencyButtons';
 *   <EmergencyButtons role="staff" />           // In Staff dashboard/layout
 *   <EmergencyButtons role="patient" admitted /> // In Patient dashboard
 */
function EmergencyButtons({ role, admitted = false }) {
  const [loading, setLoading] = useState(false);

  const triggerEmergency = async () => {
    if (!window.confirm("Trigger hospital emergency alert? This will notify all doctors and send emails.")) return;
    setLoading(true);
    try {
      await api.post("/api/notifications/emergency");
      toast.success("🚨 Emergency alert sent to all doctors!");
    } catch (err) {
      console.error("Emergency trigger failed:", err);
      toast.error("Failed to send emergency alert. Please call emergency services directly.");
    } finally {
      setLoading(false);
    }
  };

  const triggerHelp = async () => {
    setLoading(true);
    try {
      await api.post("/api/notifications/help");
      toast.success("🆘 Help request sent to your assigned nurse!");
    } catch (err) {
      console.error("Help request failed:", err);
      const msg = err.response?.data?.error || "Failed to send help request.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const buttonBase = {
    padding: "12px 24px",
    borderRadius: "8px",
    border: "none",
    fontWeight: 700,
    fontSize: "1rem",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    transition: "opacity 0.2s",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
  };

  return (
    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
      {/* Emergency button — shown to all staff */}
      {(role === "staff" || role === "STAFF" || role === "admin" || role === "ADMIN") && (
        <button
          id="emergency-alert-btn"
          onClick={triggerEmergency}
          disabled={loading}
          style={{
            ...buttonBase,
            background: "linear-gradient(135deg, #c0392b, #e74c3c)",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(231,76,60,0.4)",
          }}
          title="Send emergency alert to all doctors"
        >
          🚨 Emergency
        </button>
      )}

      {/* Help button — shown to admitted patients */}
      {(role === "patient" || role === "PATIENT") && admitted && (
        <button
          id="patient-help-btn"
          onClick={triggerHelp}
          disabled={loading}
          style={{
            ...buttonBase,
            background: "linear-gradient(135deg, #e67e22, #f39c12)",
            color: "#fff",
            boxShadow: "0 4px 12px rgba(243,156,18,0.4)",
          }}
          title="Request help from your assigned nurse"
        >
          🆘 Help
        </button>
      )}
    </div>
  );
}

export default EmergencyButtons;
