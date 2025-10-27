import React, { useState } from "react";

function LockScreen() {
  const [pin, setPin] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const addDigit = (digit) => {
    if (pin.length < 4) {
      setPin(pin + digit);
    }
  };

  const removeDigit = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const submitPin = () => {
    if (pin.length === 4) {
      if (window.electronAPI) {
        window.electronAPI.sendPassword(parseInt(pin));
      }
      clearPin();
    } else if (pin.length > 0) {
      // Add shake animation for incomplete PIN
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const clearPin = () => {
    setPin("");
  };

  const TouchButton = ({ onClick, style, children, variant = "default" }) => {
    const [isPressed, setIsPressed] = useState(false);

    const baseStyle = {
      width: "85px",
      height: "85px",
      borderRadius: "20px",
      border: "none",
      fontSize: "28px",
      fontWeight: "600",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      userSelect: "none",
      touchAction: "manipulation",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      ...style,
    };

    const variants = {
      default: {
        backgroundColor: isPressed ? "#e5e7eb" : "#ffffff",
        color: "#1f2937",
        border: "2px solid #f3f4f6",
      },
      action: {
        backgroundColor: isPressed ? "#3b82f6" : "#4f46e5",
        color: "white",
      },
      danger: {
        backgroundColor: isPressed ? "#dc2626" : "#ef4444",
        color: "white",
      },
    };

    return (
      <button
        style={{
          ...baseStyle,
          ...variants[variant],
          transform: isPressed ? "scale(0.95) translateY(2px)" : "scale(1)",
          boxShadow: isPressed
            ? "0 2px 8px rgba(0, 0, 0, 0.2)"
            : "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        onClick={onClick}
      >
        {children}
      </button>
    );
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Main Container */}
      <div
        style={{
          width: "90%",
          maxWidth: "450px",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRadius: "32px",
          padding: "40px 30px",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: isShaking ? "shake 0.5s ease-in-out" : "none",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "#4f46e5",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "32px",
            }}
          >
            🔒
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 8px 0",
            }}
          >
            Wheelchair Control
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#6b7280",
              margin: 0,
              fontWeight: "500",
            }}
          >
            Enter your PIN to continue
          </p>
        </div>

        {/* PIN Display */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginBottom: "40px",
            padding: "20px",
          }}
        >
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: i < pin.length ? "#4f46e5" : "#e5e7eb",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transform: i < pin.length ? "scale(1.2)" : "scale(1)",
                boxShadow:
                  i < pin.length ? "0 0 10px rgba(79, 70, 229, 0.4)" : "none",
              }}
            />
          ))}
        </div>

        {/* Numpad */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
            gap: "16px",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchButton
              key={num}
              onClick={() => addDigit(num.toString())}
              variant="default"
            >
              {num}
            </TouchButton>
          ))}

          {/* Clear/Backspace */}
          <TouchButton
            onClick={removeDigit}
            variant="danger"
            style={{ fontSize: "24px" }}
          >
            ⌫
          </TouchButton>

          {/* Zero */}
          <TouchButton onClick={() => addDigit("0")} variant="default">
            0
          </TouchButton>

          {/* Submit */}
          <TouchButton
            onClick={submitPin}
            variant="action"
            style={{ fontSize: "24px" }}
          >
            ✓
          </TouchButton>
        </div>

      </div>

      <style>{`
        @keyframes shake {
          0%, 20%, 40%, 60%, 80%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-8px);
          }
        }
      `}</style>
    </div>
  );
}

export default LockScreen;
