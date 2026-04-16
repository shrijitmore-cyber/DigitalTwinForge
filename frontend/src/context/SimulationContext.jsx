import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SimulationContext = createContext();

const SOCKET_URL = '/';

export function SimulationProvider({ children }) {
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [frame, setFrame] = useState(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(10);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const sock = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = sock;

    sock.on('connect', () => setConnected(true));
    sock.on('disconnect', () => {
      setConnected(false);
      setPlaying(false);
    });

    sock.on('connected', (data) => {
      setTotalRows(data.total_rows);
      // Auto-start if not already playing or just started
      sock.emit('start_stream', { speed: 10, start_idx: 0 });
    });

    sock.on('frame', (data) => {
      setFrame(data);
      setIdx(data.idx);
      setHistory((prev) => {
        // Enrich history with ML predictions for the "Predicted Track"
        const entry = {
          label: data.display?.elapsed_label ?? '',
          elapsed_min: data.display?.elapsed_min ?? 0,
          ...data.row,
          ml_pred: data.ml?.predicted_sensors ?? {},
        };
        // Keep a reasonable window (e.g. 400 points)
        const newHistory = [...prev, entry];
        return newHistory.slice(-400);
      });
    });

    sock.on('stream_state', (data) => {
      if (data.status === 'playing') setPlaying(true);
      if (data.status === 'paused') setPlaying(false);
      if (data.status === 'complete') {
        setPlaying(false);
        sock.emit('start_stream', { speed: 10, start_idx: 0 });
      }
      if (data.idx != null) setIdx(data.idx);
    });

    return () => {
      sock.disconnect();
    };
  }, []);

  const play = useCallback(() => {
    socketRef.current?.emit('start_stream', { speed, start_idx: idx });
  }, [speed, idx]);

  const pause = useCallback(() => {
    socketRef.current?.emit('stop_stream', {});
  }, []);

  const reset = useCallback(() => {
    socketRef.current?.emit('stop_stream', {});
    socketRef.current?.emit('seek', { idx: 0 });
    setHistory([]);
    setIdx(0);
  }, []);

  const changeSpeed = useCallback((s) => {
    setSpeed(s);
    if (playing) socketRef.current?.emit('set_speed', { speed: s });
  }, [playing]);

  const seek = useCallback((newIdx) => {
    setIdx(newIdx);
    socketRef.current?.emit('seek', { idx: newIdx });
    if (playing) socketRef.current?.emit('start_stream', { speed, start_idx: newIdx });
  }, [playing, speed]);

  const value = {
    connected,
    totalRows,
    frame,
    idx,
    playing,
    speed,
    history,
    play,
    pause,
    reset,
    changeSpeed,
    seek,
  };

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>;
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}
