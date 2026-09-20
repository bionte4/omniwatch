import { useCallback, useEffect, useState } from 'react';
import {
  ASSIGNEE_OPTIONS,
  WO_STATUS,
  createWorkOrderFromAlert,
} from '../data/workOrders';

const STORAGE_KEY = 'omniwatch-work-orders';
const MAX_ORDERS = 80;

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function useWorkOrders() {
  const [orders, setOrders] = useState(() => loadOrders());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch {
      /* ignore */
    }
  }, [orders]);

  const createOrder = useCallback((order) => {
    setOrders((prev) => [order, ...prev].slice(0, MAX_ORDERS));
    return order;
  }, []);

  const createFromAlert = useCallback(
    (alert, extras = {}) => {
      if (!alert) return null;
      // Avoid duplicate open WO for same device
      setOrders((prev) => {
        const existing = prev.find(
          (o) =>
            o.deviceId === alert.deviceId &&
            o.status !== WO_STATUS.DONE,
        );
        if (existing) return prev;
        const next = createWorkOrderFromAlert(alert, extras);
        return [next, ...prev].slice(0, MAX_ORDERS);
      });
      return true;
    },
    [],
  );

  const updateOrder = useCallback((id, patch) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, ...patch, updatedAt: new Date().toISOString() }
          : o,
      ),
    );
  }, []);

  const setStatus = useCallback(
    (id, status) => {
      updateOrder(id, { status });
    },
    [updateOrder],
  );

  const assign = useCallback(
    (id, assigneeId) => {
      const person =
        ASSIGNEE_OPTIONS.find((a) => a.id === assigneeId) ||
        ASSIGNEE_OPTIONS[3];
      updateOrder(id, {
        assigneeId: person.id,
        assigneeName: person.name,
      });
    },
    [updateOrder],
  );

  const removeOrder = useCallback((id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const openCount = orders.filter((o) => o.status !== WO_STATUS.DONE).length;

  return {
    orders,
    openCount,
    createOrder,
    createFromAlert,
    updateOrder,
    setStatus,
    assign,
    removeOrder,
    assignees: ASSIGNEE_OPTIONS,
  };
}
