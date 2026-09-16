import { useState } from "react";
import {
  updateUserSettingsAPI,
  changePasswordAPI
} from "./services/settingsService";

function Settings({ userData, onSave, onBack }) {
  const [username, setUsername] = useState(
    userData?.username || ""
  );

  const [department, setDepartment] = useState(
    userData?.department || ""
  );

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [message, setMessage] = useState("");

  // =========================
  // SAVE SETTINGS
  // =========================

  const handleSave = async () => {
    if (!username || !department) {
      setMessage(
        "Please fill username and department."
      );
      return;
    }

    try {
      const data = await updateUserSettingsAPI({
        username: username,
        password: newPassword,
        department: department
      });

      setMessage(
        data?.message ||
          "Settings updated successfully"
      );

      onSave({
        ...userData,
        username: username,
        department: department
      });
    } catch (error) {
      console.log(
        "Settings Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "Settings update failed"
      );
    }
  };

  // =========================
  // CHANGE PASSWORD
  // =========================

  const handleChangePassword = async () => {
    if (
      !oldPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setMessage(
        "Please fill all password fields."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage(
        "New passwords do not match."
      );
      return;
    }

    try {
      const data = await changePasswordAPI({
        username: username,
        oldPassword: btoa(oldPassword),
        newPassword: btoa(newPassword)
      });

      setMessage(
        data?.message ||
          "Password changed successfully."
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.log(
        "Password Error:",
        error.response?.data || error.message
      );

      setMessage(
        error.response?.data?.message ||
          error.response?.data ||
          "Password change failed."
      );
    }
  };

  return (
    <div className="p-5">

      {/* =========================
          SETTINGS
      ========================= */}

      <h2>Settings</h2>

      {/* USERNAME */}

      <div>
        <label>Username</label>

        <br />

        <input
          className="border border-gray-400 rounded"
          type="text"
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
        />
      </div>

      <br />

      {/* DEPARTMENT */}

      <div>
        <label>Department</label>

        <br />

        <select
          className="border border-gray-400 rounded"
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value)
          }
        >
          <option value="cs">CS</option>

          <option value="se">
            Software Engineering
          </option>

          <option value="it">IT</option>

          <option value="ee">
            Electrical Engineering
          </option>
        </select>
      </div>

      <br />

      {/* SAVE */}

      <button
        className="border border-gray-400 rounded"
        onClick={handleSave}
      >
        Save Changes
      </button>

      <br />
      <br />

      {/* =========================
          CHANGE PASSWORD
      ========================= */}

      <h3 className="text-lg text-white font-bold">
        Change Password
      </h3>

      {/* OLD PASSWORD */}

      <div>
        <label>Current Password</label>

        <br />

        <input
          className="border border-gray-400 rounded"
          type="password"
          value={oldPassword}
          onChange={(e) =>
            setOldPassword(e.target.value)
          }
        />
      </div>

      <br />

      {/* NEW PASSWORD */}

      <div>
        <label>New Password</label>

        <br />

        <input
          className="border border-gray-400 rounded"
          type="password"
          value={newPassword}
          onChange={(e) =>
            setNewPassword(e.target.value)
          }
        />
      </div>

      <br />

      {/* CONFIRM PASSWORD */}

      <div>
        <label>Confirm New Password</label>

        <br />

        <input
          className="border border-gray-400 rounded"
          type="password"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(e.target.value)
          }
        />
      </div>

      <br />

      {/* CHANGE PASSWORD BUTTON */}

      <button
        className="border border-gray-400 rounded w-[30%] bg-white text-black"
        onClick={handleChangePassword}
      >
        Change Password
      </button>

      <br />
      <br />

      {/* BACK */}

      <button
        className="border border-gray-400 rounded w-[30%] bg-white text-black"
        onClick={onBack}
      >
        Back
      </button>

      <p>{message}</p>
    </div>
  );
}

export default Settings;