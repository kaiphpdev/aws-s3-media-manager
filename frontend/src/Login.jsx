import { useState } from "react";
import api from "./api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post(
        "/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem(
        "media_manager_token",
        response.data.token
      );

      onLogin();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form
        className="login-card"
        onSubmit={handleSubmit}
      >
        <h1>Media Manager</h1>

        <p>Sign in to manage your media</p>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button disabled={loading}>
          {loading
            ? "Signing in..."
            : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;