import React, { useEffect, useRef, useState } from "react";
import { loginUser } from "../api/user";
import { useAuth } from "../context/AuthContext";

const Ingreso = () => {
  const { login, user, authToken } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: ""});
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manualCopy, setManualCopy] = useState(false); // Fallback sin execCommand (deprecada)
  const hideTimerRef = useRef(null);
  const manualRef = useRef(null);
  const TOKEN_DISPLAY_MS = 15000;

  const getTokenPreview = (t) => {
    if (!t) return "";
    if (t.length <= 30) return t;
    return `${t.slice(0, 16)}…${t.slice(-8)}`;
  };

  const handleCopyToken = async () => {
    if (!authToken) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(authToken);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      // Si no hay clipboard API, activar modo copia manual
      setManualCopy(true);
      setTimeout(() => {
        manualRef.current?.focus();
        manualRef.current?.select();
      }, 0);
    } catch (e) {
      // En error, ofrecer copia manual
      console.error('No se pudo copiar con clipboard API:', e);
      setManualCopy(true);
      setTimeout(() => {
        manualRef.current?.focus();
        manualRef.current?.select();
      }, 0);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(formData);
      login(data.authToken, data.user);
      alert(`Bienvenido ${data.user.name}`);
      setShowToken(true);

    } catch (error) {
      console.error("Error:", error);
      alert("Email o contraseña incorrectos");
      
    }
  };

  // Ocultar el token automáticamente después de N segundos cuando exista sesión
  useEffect(() => {
    // Limpiar temporizador anterior si cambia el token/usuario o si el componente se desmonta
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (authToken && user && showToken) {
      hideTimerRef.current = setTimeout(() => {
        setShowToken(false);
        hideTimerRef.current = null;
      }, TOKEN_DISPLAY_MS);
    }
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [authToken, user, showToken]);

  return (
    <div className="d-flex justify-content-center my-5 py-5 body-background">
      <div className="card mx-3 px-3 shadow bg-light">
        <h3 className="mt-0 text-center mt-3">Iniciar Sesión</h3>

  <form className="mx-5 px-5 pb-4 align-text" onSubmit={handleSubmit}>
          <div className="py-3">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="py-0">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-4">Iniciar Sesión</button>
        </form>

        {authToken && user && showToken && (
          <div
            className="mb-4 px-4 py-0 bg-light border rounded text-break"
            style={{ maxHeight: "160px", overflowY: "auto" }}
          >
            <div className="d-flex justify-content-between align-items-start gap-3">
              <div className="small">
                <strong>Token:</strong>
                <div className="font-monospace mt-1" aria-live="polite">
                  {getTokenPreview(authToken)}
                </div>
                <div className="mt-2 d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleCopyToken}
                    title="Copiar token completo"
                  >
                    Copiar
                  </button>
                  {copied && (
                    <span className="badge text-bg-success align-self-center">Copiado</span>
                  )}
                </div>
                {manualCopy && (
                  <div className="mt-2">
                    <input
                      ref={manualRef}
                      className="form-control font-monospace"
                      readOnly
                      value={authToken}
                      onFocus={(e) => e.target.select()}
                      aria-label="Selecciona y presiona Ctrl+C para copiar"
                    />
                    <small className="text-muted">Selecciona y presiona Ctrl+C para copiar</small>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowToken(false)}
                title="Ocultar ahora"
              >
                Ocultar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ingreso;