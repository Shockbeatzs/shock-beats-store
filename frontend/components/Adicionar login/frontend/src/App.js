import React, { useState } from "react";
import Login from "./components/Login";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <div style={{ textAlign: "center", marginTop: 50 }}>
          <h1>Bem-vindo, {user.email}!</h1>
          <p>Agora você pode subir e ouvir seus beats!</p>
          {/* Aqui você pode adicionar o componente de upload/lista de beats */}
        </div>
      )}
    </div>
  );
}

export default App;
