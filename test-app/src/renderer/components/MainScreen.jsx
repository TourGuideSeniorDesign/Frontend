import React, { useState, useEffect } from 'react';

function MainScreen() {
  const [display, setDisplay] = useState('System Ready');
  const [status, setStatus] = useState({
    light: 'OFF',
    brake: 'ON',
    lidar: 'OFF',
    selfdrive: 'OFF',
    battery: '---',
    speed: '---',
    room: '---'
  });

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onUpdateDisplay((message) => {
        setDisplay(message);
        
        // Update individual statuses based on the message
        if (message.startsWith('LIGHT_')) {
          setStatus(prev => ({ ...prev, light: message.replace('LIGHT_', '') }));
        } else if (message.startsWith('BRAKE_')) {
          setStatus(prev => ({ ...prev, brake: message.replace('BRAKE_', '') }));
        } else if (message.startsWith('LIDAR_')) {
          setStatus(prev => ({ ...prev, lidar: message.replace('LIDAR_', '') }));
        } else if (message.startsWith('SELFDRIVE_')) {
          setStatus(prev => ({ ...prev, selfdrive: message.replace('SELFDRIVE_', '') }));
        } else if (message.startsWith('BATTERY_')) {
          setStatus(prev => ({ ...prev, battery: message.replace('BATTERY_', '') }));
        } else if (message.startsWith('SPEED_')) {
          setStatus(prev => ({ ...prev, speed: message.replace('SPEED_', '') }));
        } else if (message.startsWith('ROOM_')) {
          setStatus(prev => ({ ...prev, room: message.replace('ROOM_', '') }));
        }
      });
    }
  }, []);

  const handleButtonClick = (action) => {
    if (window.electronAPI) {
      window.electronAPI.sendButtonAction(action);
    }
  };

  const buttonStyle = {
    padding: '20px',
    margin: '8px 0',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    width: '100%',
    minHeight: '60px',
    userSelect: 'none',
    touchAction: 'manipulation',
  };

  const statusGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
    marginBottom: '24px'
  };

  const statusItemStyle = {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  };

  const statusLabelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '8px'
  };

  const statusValueStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1f2937'
  };

  const getStatusColor = (status) => {
    if (status === 'ON' || status === 'STEADY' || status === 'FLASHING' || status === 'FULL' || status === 'JOYSTICK') {
      return '#22c55e';
    }
    return '#6b7280';
  };

  const TouchButton = ({ onClick, style, children, activeColor }) => {
    const [isPressed, setIsPressed] = useState(false);

    return (
      <button
        style={{
          ...style,
          opacity: isPressed ? 0.8 : 1,
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
    <div style={{ 
      height: '100vh', 
      backgroundColor: '#f3f4f6', 
      padding: '20px',
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>
      
      {/* Status Grid */}
      <div style={statusGridStyle}>
        <div style={statusItemStyle}>
          <div style={statusLabelStyle}>Battery</div>
          <div style={statusValueStyle}>{status.battery}</div>
        </div>
        <div style={statusItemStyle}>
          <div style={statusLabelStyle}>Speed</div>
          <div style={statusValueStyle}>{status.speed}</div>
        </div>
        <div style={statusItemStyle}>
          <div style={statusLabelStyle}>Brake</div>
          <div style={{ ...statusValueStyle, color: getStatusColor(status.brake) }}>{status.brake}</div>
        </div>
        <div style={statusItemStyle}>
          <div style={statusLabelStyle}>LiDAR</div>
          <div style={{ ...statusValueStyle, color: getStatusColor(status.lidar) }}>{status.lidar}</div>
        </div>
        <div style={statusItemStyle}>
          <div style={statusLabelStyle}>Self-Drive</div>
          <div style={{ ...statusValueStyle, color: getStatusColor(status.selfdrive) }}>{status.selfdrive}</div>
        </div>
        <div style={statusItemStyle}>
          <div style={statusLabelStyle}>Destination</div>
          <div style={statusValueStyle}>{status.room}</div>
        </div>
        <div style={statusItemStyle}>
          <div style={statusLabelStyle}>Light</div>
          <div style={{ ...statusValueStyle, color: getStatusColor(status.light) }}>{status.light}</div>
        </div>
      </div>

      {/* Control Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px' 
      }}>
        
        {/* Light Controls */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ 
            fontSize: '20px',
            fontWeight: '700', 
            marginBottom: '16px',
            textAlign: 'center',
            color: '#1f2937'
          }}>
            Lights
          </h3>
          <TouchButton
            onClick={() => handleButtonClick('LIGHT_STEADY')}
            style={{ ...buttonStyle, backgroundColor: '#eab308' }}
          >
            Steady
          </TouchButton>
          <TouchButton
            onClick={() => handleButtonClick('LIGHT_FLASHING')}
            style={{ ...buttonStyle, backgroundColor: '#f97316' }}
          >
            Flashing
          </TouchButton>
          <TouchButton
            onClick={() => handleButtonClick('LIGHT_OFF')}
            style={{ ...buttonStyle, backgroundColor: '#6b7280' }}
          >
            Off
          </TouchButton>
        </div>

        {/* Brake Controls */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ 
            fontSize: '20px',
            fontWeight: '700', 
            marginBottom: '16px',
            textAlign: 'center',
            color: '#1f2937'
          }}>
            Brake
          </h3>
          <TouchButton
            onClick={() => handleButtonClick('BRAKE_ON')}
            style={{ ...buttonStyle, backgroundColor: '#dc2626' }}
          >
            Brake On
          </TouchButton>
          <TouchButton
            onClick={() => handleButtonClick('BRAKE_OFF')}
            style={{ ...buttonStyle, backgroundColor: '#16a34a' }}
          >
            Brake Off
          </TouchButton>
        </div>

        {/* LIDAR Controls */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ 
            fontSize: '20px',
            fontWeight: '700', 
            marginBottom: '16px',
            textAlign: 'center',
            color: '#1f2937'
          }}>
            LiDAR
          </h3>
          <TouchButton
            onClick={() => handleButtonClick('LIDAR_ON')}
            style={{ ...buttonStyle, backgroundColor: '#2563eb' }}
          >
            LiDAR On
          </TouchButton>
          <TouchButton
            onClick={() => handleButtonClick('LIDAR_OFF')}
            style={{ ...buttonStyle, backgroundColor: '#6b7280' }}
          >
            LiDAR Off
          </TouchButton>
        </div>

        {/* Self-Drive Controls */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ 
            fontSize: '20px',
            fontWeight: '700', 
            marginBottom: '16px',
            textAlign: 'center',
            color: '#1f2937'
          }}>
            Self-Drive
          </h3>
          <TouchButton
            onClick={() => handleButtonClick('SELFDRIVE_FULL')}
            style={{ ...buttonStyle, backgroundColor: '#7c3aed' }}
          >
            Full Auto
          </TouchButton>
          <TouchButton
            onClick={() => handleButtonClick('SELFDRIVE_JOYSTICK')}
            style={{ ...buttonStyle, backgroundColor: '#4338ca' }}
          >
            With Joystick
          </TouchButton>
          <TouchButton
            onClick={() => handleButtonClick('SELFDRIVE_OFF')}
            style={{ ...buttonStyle, backgroundColor: '#6b7280' }}
          >
            Manual
          </TouchButton>
        </div>

        {/* Room Navigation */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          gridColumn: 'span 2'
        }}>
          <h3 style={{ 
            fontSize: '20px',
            fontWeight: '700', 
            marginBottom: '16px',
            textAlign: 'center',
            color: '#1f2937'
          }}>
            Room Navigation
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px'
          }}>
            {['400', '404', '410', '429', '423', '419', '426', '422', '416', '414'].map((room) => (
              <TouchButton
                key={room}
                onClick={() => handleButtonClick(`ROOM_${room}`)}
                style={{ 
                  ...buttonStyle, 
                  backgroundColor: '#059669',
                  padding: '16px',
                  fontSize: '16px',
                  minHeight: '50px'
                }}
              >
                {room}
              </TouchButton>
            ))}
          </div>
        </div>

        {/* System Controls */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' 
        }}>
          <h3 style={{ 
            fontSize: '20px',
            fontWeight: '700', 
            marginBottom: '16px',
            textAlign: 'center',
            color: '#1f2937'
          }}>
            System
          </h3>
          <TouchButton
            onClick={() => handleButtonClick('LOCK')}
            style={{ ...buttonStyle, backgroundColor: '#dc2626', fontSize: '20px' }}
          >
            🔒 Lock System
          </TouchButton>
        </div>
      </div>
    </div>
  );
}

export default MainScreen;