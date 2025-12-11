import React, { useEffect } from 'react';

export default function Notification({ notification, onClose }) {
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => {
      onClose && onClose();
    }, 4000);
    return () => clearTimeout(t);
  }, [notification, onClose]);

  if (!notification) return null;

  const bsClass = notification.type ? `alert alert-${notification.type}` : 'alert alert-info';

  const style = {
    position: 'fixed',
    right: 20,
    top: 20,
    zIndex: 2000,
    minWidth: 240,
  };

  return (
    <div style={style} role="alert" className={bsClass}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ whiteSpace: 'pre-wrap' }}>{notification.message}</div>
        <button type="button" className="btn-close ms-3" aria-label="Close" onClick={onClose} />
      </div>
    </div>
  );
}
