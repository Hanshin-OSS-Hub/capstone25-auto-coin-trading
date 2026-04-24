// src/hooks/useRealtimePrice.js
import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { NGROK_URL, isDomestic } from "../api/stockApi";

export default function useRealtimePrice(stocks, onPriceUpdate) {
  const clientRef = useRef(null);
  const subsRef = useRef(new Map());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${NGROK_URL}/ws`),
      reconnectDelay: 5000,
      onConnect: () => { console.log("✅ WebSocket 연결"); setConnected(true); },
      onDisconnect: () => setConnected(false),
      onStompError: (f) => console.error("STOMP 에러:", f.headers?.message),
    });
    client.activate();
    clientRef.current = client;
    return () => {
      subsRef.current.forEach(s => { try { s.unsubscribe(); } catch {} });
      subsRef.current.clear();
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    const client = clientRef.current;
    if (!client?.connected || !stocks?.length) return;

    subsRef.current.forEach(s => { try { s.unsubscribe(); } catch {} });
    subsRef.current.clear();

    stocks.forEach(stock => {
      const dom = isDomestic(stock.market);
      const key = `${dom ? "d" : "o"}-${stock.symbol}`;
      try {
        if (dom) {
          client.publish({ destination: "/app/subscribe/domestic", body: stock.symbol });
        } else {
          client.publish({ destination: "/app/subscribe/overseas", body: `${stock.symbol},${stock.exchange || "NAS"}` });
        }
        const topic = dom ? `/topic/domestic/${stock.symbol}` : `/topic/overseas/${stock.symbol}`;
        const sub = client.subscribe(topic, msg => {
          try { onPriceUpdate?.(stock.symbol, JSON.parse(msg.body)); } catch {}
        });
        subsRef.current.set(key, sub);
      } catch {}
    });

    return () => {
      const cl = clientRef.current;
      if (!cl?.connected) return;
      stocks.forEach(stock => {
        const dom = isDomestic(stock.market);
        const key = `${dom ? "d" : "o"}-${stock.symbol}`;
        const sub = subsRef.current.get(key);
        if (sub) try { sub.unsubscribe(); } catch {}
        try {
          if (dom) cl.publish({ destination: "/app/unsubscribe/domestic", body: stock.symbol });
          else cl.publish({ destination: "/app/unsubscribe/overseas", body: `${stock.symbol},${stock.exchange || "NAS"}` });
        } catch {}
      });
      subsRef.current.clear();
    };
  }, [connected, stocks?.map(s => s.symbol).join(",")]);

  return { connected };
}
