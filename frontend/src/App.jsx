import { useState } from "react";

import Login from "./Login";
import MediaManager from "./MediaManager";

import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] =
    useState(
      !!localStorage.getItem(
        "media_manager_token"
      )
    );

  if (!loggedIn) {
    return (
      <Login
        onLogin={() =>
          setLoggedIn(true)
        }
      />
    );
  }

  return (
    <MediaManager
      onLogout={() =>
        setLoggedIn(false)
      }
    />
  );
}

export default App;