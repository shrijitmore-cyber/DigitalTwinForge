import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SimulationContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL || '/';

export function SimulationProvider({ children }) {
  const socketRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [frame, setFrame] = useState(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(30);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const sock = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = sock;

    sock.on('connect', () => {
      setConnected(true);
      // Reliably auto-play on every fresh connection
      sock.emit('start_stream', { speed: 30, start_idx: 0 });
    });

    sock.on('disconnect', () => {
      setConnected(false);
      setPlaying(false);
    });

    sock.on('connected', (data) => {
      setTotalRows(data.total_rows);
    });

    sock.on('frame', (data) => {
      setFrame(data);
      setIdx(data.idx);
      setHistory((prev) => {
        // Deduplicate identical frames if they arrive
        if (prev.length > 0 && prev[prev.length - 1].idx === data.idx) return prev;

        // Enrich history with ML predictions and proper structure
        const entry = {
          ...data, // Keep the full frame structure for the checkers
          label: data.display?.elapsed_label ?? '',
          elapsed_min: data.ml?.elapsed_min ?? data.display?.elapsed_min ?? 0,
        };
        const newHistory = [...prev, entry];
        return newHistory.slice(-400);
      });
    });

    sock.on('stream_state', (data) => {
      if (data.status === 'playing') setPlaying(true);
      if (data.status === 'paused') setPlaying(false);
      if (data.status === 'complete') {
        setPlaying(false);
        setHistory([]); // clear history to prevent scribbled overlapped chart lines on loop
        // Loop simulation automatically
        sock.emit('start_stream', { speed: 30, start_idx: 0 });
      }
      if (data.idx != null) setIdx(data.idx);
      if (data.speed != null) setSpeed(data.speed);
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
    // Restart after reset
    socketRef.current?.emit('start_stream', { speed, start_idx: 0 });
  }, [speed]);

  const changeSpeed = useCallback((s) => {
    setSpeed(s);
    socketRef.current?.emit('set_speed', { speed: s });
  }, []);

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
