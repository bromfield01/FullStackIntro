// src/components/ChatPanel.jsx
import { useState } from 'react';
import { useSocket } from '../contexts/SocketContext.jsx';

export function ChatPanel() {
  const { status, room, username, messages, joinRoom, sendMessage } =
    useSocket();

  const [draft, setDraft] = useState('');
  const [roomInput, setRoomInput] = useState(room || 'public');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    await sendMessage(draft.trim()); // handles commands or normal messages
    setDraft('');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!roomInput.trim()) return;
    joinRoom(roomInput.trim());
  };

  return (
    <div
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: '0.75rem',
        marginTop: '1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
        }}
      >
        <div>
          <strong>Room:</strong> {room || '—'} <br />
          <strong>User:</strong> {username || '—'}
        </div>
        <div>
          <strong>Status:</strong>{' '}
          <span
            style={{
              color:
                status === 'connected'
                  ? 'green'
                  : status === 'connecting'
                    ? 'orange'
                    : status === 'error'
                      ? 'crimson'
                      : '#6b7280',
            }}
          >
            {status}
          </span>
        </div>
      </div>

      <form onSubmit={handleJoinRoom} style={{ marginBottom: '0.5rem' }}>
        <label>
          Switch room:{' '}
          <input
            value={roomInput}
            onChange={(e) => setRoomInput(e.target.value)}
            placeholder='public / general / etc'
          />
        </label>{' '}
        <button type='submit' disabled={!roomInput.trim()}>
          Join
        </button>
      </form>

      <div
        style={{
          border: '1px solid #e5e7eb',
          borderRadius: 4,
          padding: '0.5rem',
          maxHeight: 200,
          overflowY: 'auto',
          fontSize: 13,
          marginBottom: '0.5rem',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ color: '#6b7280' }}>No messages yet.</div>
        ) : (
          messages.map((m, idx) => {
            if (m.system) {
              return (
                <div
                  key={idx}
                  style={{
                    marginBottom: 2,
                    color: '#4b5563',
                    opacity: m.replayed ? 0.6 : 0.9,
                  }}
                >
                  <em>
                    [{m.room}] {m.msg}
                    {m.replayed ? ' (history)' : ''}
                  </em>
                </div>
              );
            }

            return (
              <div
                key={idx}
                style={{
                  marginBottom: 2,
                  opacity: m.replayed ? 0.5 : 1,
                }}
              >
                <strong>
                  [{m.room}] {m.username}
                  {m.replayed ? ' (history)' : ''}:
                </strong>{' '}
                {m.msg}
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend}>
        <input
          style={{ width: '70%' }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder='Type a message…'
          disabled={status !== 'connected'}
        />{' '}
        <button
          type='submit'
          disabled={!draft.trim() || status !== 'connected'}
        >
          Send
        </button>
      </form>
    </div>
  );
}
