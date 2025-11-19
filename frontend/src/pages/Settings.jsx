import React, { useState, useEffect } from "react";
import { settingsService } from "../services/settingsService";

export const Settings = () => {
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState([]);

  // 컴포넌트 마운트 시 API 테스트
  useEffect(() => {
    const testAPI = async () => {
      try {
        // 테스트 API 호출
        const result = await settingsService.testConnection();
        setMessage(result);
        console.log("API 연결:", result);

        // 실제 데이터 가져오기
        const data = await settingsService.getTradingSettings();
        setSettings(data);
        console.log("설정 데이터:", data);
      } catch (error) {
        console.error("API 에러:", error);
        setMessage("API 연결 실패");
      }
    };

    testAPI();
  }, []);

  return (
    <div className="settings">
      <h2>설정</h2>
      <p>API 상태: {message}</p>
      <p>설정 개수: {settings.length}</p>

      {settings.map((setting) => (
        <div key={setting.settingId}>
          <h3>{setting.settingName}</h3>
        </div>
      ))}
    </div>
  );
};
