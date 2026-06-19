import React, { useState, useContext } from 'react';
import { Bell, CloudRain, Sprout, TestTube2, X, CheckCheck, Droplets, TrendingUp } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';

const typeIcons = {
  weather: <CloudRain size={18} color="#3498db" />,
  crop: <Sprout size={18} color="#27ae60" />,
  soil: <TestTube2 size={18} color="#8e44ad" />,
  irrigation: <Droplets size={18} color="#16a085" />,
  market: <TrendingUp size={18} color="#d35400" />
};

const typeColors = {
  weather: '#eaf4fc',
  crop: '#eafaf1',
  soil: '#f5eeff',
  irrigation: '#e8f8f5',
  market: '#fdf6ec'
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHrs < 24) return `${diffHrs} hr${diffHrs > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification
  } = useContext(NotificationContext);

  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.read) 
      : notifications.filter(n => n.type === filter);

  return (
    <div>
      <h2 style={{ marginBottom: '20px', color: 'var(--dark-green)' }}>Notifications & Alerts</h2>

      <div className="card glass-panel" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={22} color="var(--dark-green)" />
            <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['all', 'unread', 'weather', 'crop', 'soil', 'irrigation'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem',
                  background: filter === f ? 'var(--primary-green)' : '#f0f4f8',
                  color: filter === f ? '#fff' : 'var(--text-dark)',
                  textTransform: 'capitalize'
                }}
              >
                {f}
              </button>
            ))}
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-color)', cursor: 'pointer', background: '#fff', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 && (
          <div className="card glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
            No notifications in this category.
          </div>
        )}
        {filtered.map(n => (
          <div
            key={n._id}
            onClick={() => markAsRead(n._id)}
            style={{
              background: n.read ? '#fff' : typeColors[n.type] || '#f8fafc',
              border: `1px solid ${n.read ? 'var(--border-color)' : 'transparent'}`,
              borderRadius: '12px', padding: '16px 20px',
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: n.read ? 'none' : 'var(--shadow)'
            }}
          >
            <div style={{ padding: '10px', background: '#fff', borderRadius: '10px', flexShrink: 0 }}>
              {typeIcons[n.type] || <Bell size={18} color="var(--primary-green)" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ color: 'var(--text-dark)' }}>{n.title}</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{formatTime(n.createdAt)}</span>
              </div>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: 0 }}>{n.message}</p>
            </div>
            {!n.read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-green)', flexShrink: 0, marginTop: '6px' }} />}
            <button
              onClick={(e) => { e.stopPropagation(); dismissNotification(n._id); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', padding: '4px', flexShrink: 0 }}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
