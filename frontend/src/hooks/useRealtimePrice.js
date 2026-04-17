// src/hooks/useRealtimePrice.js
import { useEffect, useRef, useCallback, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { NGROK_URL, isDomestic } from "../api/stockApi";

export default function useRealtimePrice(stocks, onPriceUpdate) {
  const clientRef = useRef(null);
  const subsRef = useRef(new Map());
  const [connected, setConnected] = useState(false);

  // WebSocket 연결
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${NGROK_URL}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log("✅ WebSocket 연결 성공");
        setConnected(true);
      },
      onDisconnect: () => {
        console.log("⚠️ WebSocket 연결 해제");
        setConnected(false);
      },
      onStompError: (frame) => {
        console.error("WebSocket STOMP 에러:", frame.headers?.message);
      },
      onWebSocketError: (evt) => {
        console.warn("WebSocket 에러:", evt);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      subsRef.current.forEach((sub) => {
        try {
          sub.unsubscribe();
        } catch {}
      });
      subsRef.current.clear();
      client.deactivate();
    };
  }, []);

  // 종목 구독 관리
  useEffect(() => {
    const client = clientRef.current;
    if (!client?.connected || !stocks?.length) return;

    // 기존 구독 해제
    subsRef.current.forEach((sub) => {
      try {
        sub.unsubscribe();
      } catch {}
    });
    subsRef.current.clear();

    // 새 구독
    stocks.forEach((stock) => {
      const domestic = isDomestic(stock.market);
      const key = `${domestic ? "domestic" : "overseas"}-${stock.symbol}`;

      try {
        // 구독 시작 publish
        if (domestic) {
          client.publish({
            destination: "/app/subscribe/domestic",
            body: stock.symbol,
          });
        } else {
          const exc = stock.exchange || "NAS";
          client.publish({
            destination: "/app/subscribe/overseas",
            body: `${stock.symbol},${exc}`,
          });
        }

        // 토픽 구독
        const topic = domestic
          ? `/topic/domestic/${stock.symbol}`
          : `/topic/overseas/${stock.symbol}`;

        const sub = client.subscribe(topic, (message) => {
          try {
            const data = JSON.parse(message.body);
            onPriceUpdate?.(stock.symbol, data);
          } catch (e) {
            console.warn("메시지 파싱 실패:", e);
          }
        });

        subsRef.current.set(key, sub);
      } catch (e) {
        console.warn(`구독 실패 [${stock.symbol}]:`, e);
      }
    });

    // cleanup: 구독 해제
    return () => {
      const cl = clientRef.current;
      if (!cl?.connected) return;

      stocks.forEach((stock) => {
        const domestic = isDomestic(stock.market);
        const key = `${domestic ? "domestic" : "overseas"}-${stock.symbol}`;
        const sub = subsRef.current.get(key);
        if (sub) {
          try {
            sub.unsubscribe();
          } catch {}
        }

        try {
          if (domestic) {
            cl.publish({
              destination: "/app/unsubscribe/domestic",
              body: stock.symbol,
            });
          } else {
            cl.publish({
              destination: "/app/unsubscribe/overseas",
              body: `${stock.symbol},${stock.exchange || "NAS"}`,
            });
          }
        } catch {}
      });
      subsRef.current.clear();
    };
  }, [connected, stocks?.map((s) => s.symbol).join(",")]);

  return { connected };
}
