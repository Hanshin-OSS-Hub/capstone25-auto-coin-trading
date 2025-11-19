-- ================================================================
-- 차익거래 시스템 데이터베이스 스키마 (MySQL)
-- ================================================================

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS arbitrage_system 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE arbitrage_system;

-- ================================================================
-- 테이블 생성
-- ================================================================

-- 1. 계좌 정보 테이블
CREATE TABLE accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    account_type VARCHAR(20) NOT NULL COMMENT 'domestic, us, profit',
    currency VARCHAR(10) NOT NULL COMMENT 'KRW, USD, BTC, ETH 등',
    balance DECIMAL(20, 8) NOT NULL DEFAULT 0,
    initial_balance DECIMAL(20, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_account_currency (account_type, currency)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='계좌 정보';

-- 2. 거래 설정 테이블
CREATE TABLE trading_settings (
    setting_id INT AUTO_INCREMENT PRIMARY KEY,
    setting_name VARCHAR(50) UNIQUE NOT NULL,
    
    -- 진입 조건
    entry_min_premium DECIMAL(10, 4) DEFAULT 2.0 COMMENT '최소 진입 프리미엄 %',
    entry_min_net_premium DECIMAL(10, 4) DEFAULT 1.5 COMMENT '수수료 제외 순 프리미엄 %',
    position_size DECIMAL(20, 2) DEFAULT 5000000 COMMENT '1회 거래 금액',
    
    -- 청산 조건
    exit_target_premium DECIMAL(10, 4) DEFAULT 0.5 COMMENT '목표 프리미엄 %',
    exit_target_profit DECIMAL(20, 2) DEFAULT 50000 COMMENT '목표 수익',
    exit_max_holding_time INT DEFAULT 3600 COMMENT '최대 보유시간(초)',
    
    -- 손실 방어
    stop_loss_max_amount DECIMAL(20, 2) DEFAULT -30000 COMMENT '최대 손실 금액',
    stop_loss_max_rate DECIMAL(10, 6) DEFAULT -0.01 COMMENT '최대 손실률',
    stop_loss_reverse_premium DECIMAL(10, 4) DEFAULT -1.0 COMMENT '역프리미엄 손절선',
    
    -- 트레일링 스톱
    trailing_enabled TINYINT(1) DEFAULT 1 COMMENT '트레일링 스톱 활성화',
    trailing_activation_profit DECIMAL(20, 2) DEFAULT 30000 COMMENT '트레일링 시작 수익',
    trailing_distance DECIMAL(20, 2) DEFAULT 10000 COMMENT '트레일링 간격',
    
    -- 리밸런싱
    rebalance_threshold DECIMAL(10, 4) DEFAULT 0.15 COMMENT '리밸런싱 임계값',
    rebalance_check_interval INT DEFAULT 3600 COMMENT '리밸런싱 체크 주기(초)',
    
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='거래 설정';

-- 3. 포지션 (진행중인 차익거래) 테이블
CREATE TABLE positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    coin_symbol VARCHAR(10) NOT NULL COMMENT 'BTC, ETH',
    status VARCHAR(20) NOT NULL COMMENT 'open, closed, stopped',
    
    -- 진입 정보
    entry_time TIMESTAMP NOT NULL,
    entry_premium DECIMAL(10, 4) COMMENT '진입 시 프리미엄 %',
    entry_price_domestic DECIMAL(20, 2) COMMENT '국내 진입 가격',
    entry_price_us DECIMAL(20, 2) COMMENT '미국 진입 가격',
    entry_exchange_rate DECIMAL(10, 4) COMMENT '진입 시 환율',
    
    -- 거래량
    amount DECIMAL(20, 8) COMMENT '거래한 코인 수량',
    position_size_krw DECIMAL(20, 2) COMMENT '거래 규모(원화)',
    
    -- 청산 정보
    exit_time TIMESTAMP NULL,
    exit_premium DECIMAL(10, 4),
    exit_price_domestic DECIMAL(20, 2),
    exit_price_us DECIMAL(20, 2),
    exit_exchange_rate DECIMAL(10, 4),
    exit_reason VARCHAR(50) COMMENT 'take_profit, stop_loss, time_stop 등',
    
    -- 손익
    realized_profit_krw DECIMAL(20, 2),
    realized_profit_usd DECIMAL(20, 2),
    fee_domestic DECIMAL(20, 2),
    fee_us DECIMAL(20, 2),
    net_profit DECIMAL(20, 2) COMMENT '순수익(수수료 제외)',
    
    -- 트레일링 정보
    max_profit_reached DECIMAL(20, 2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_coin (coin_symbol),
    INDEX idx_entry_time (entry_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='포지션(차익거래)';

-- 4. 거래 내역 테이블 (개별 주문)
CREATE TABLE trades (
    trade_id INT AUTO_INCREMENT PRIMARY KEY,
    position_id INT,
    
    exchange VARCHAR(20) NOT NULL COMMENT 'domestic, us',
    coin_symbol VARCHAR(10) NOT NULL,
    trade_type VARCHAR(10) NOT NULL COMMENT 'buy, sell',
    
    amount DECIMAL(20, 8) NOT NULL COMMENT '거래 수량',
    price DECIMAL(20, 2) NOT NULL COMMENT '체결 가격',
    total_value DECIMAL(20, 2) NOT NULL COMMENT '총 거래액',
    fee DECIMAL(20, 2) NOT NULL COMMENT '수수료',
    
    order_id VARCHAR(100) COMMENT '거래소 주문 ID',
    executed_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE SET NULL,
    INDEX idx_position (position_id),
    INDEX idx_exchange (exchange),
    INDEX idx_executed_at (executed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='거래 내역';

-- 5. 계좌 이체 내역 테이블
CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_type VARCHAR(20) NOT NULL COMMENT 'profit_transfer, rebalance, withdrawal',
    
    from_account VARCHAR(20) COMMENT 'domestic, us, profit',
    to_account VARCHAR(20),
    
    currency VARCHAR(10) NOT NULL,
    amount DECIMAL(20, 8) NOT NULL,
    
    position_id INT COMMENT '수익금 이체 시 연결',
    
    description TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE SET NULL,
    INDEX idx_type (transaction_type),
    INDEX idx_executed_at (executed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='계좌 이체 내역';

-- 6. 잔고 히스토리 테이블 (일별 스냅샷)
CREATE TABLE balance_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    snapshot_date DATE NOT NULL,
    account_type VARCHAR(20) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    
    balance DECIMAL(20, 8) NOT NULL,
    value_in_krw DECIMAL(20, 2) COMMENT '원화 환산 가치',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_snapshot (snapshot_date, account_type, currency),
    INDEX idx_date (snapshot_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='잔고 히스토리';

-- 7. 리밸런싱 로그 테이블
CREATE TABLE rebalance_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    account_type VARCHAR(20) NOT NULL,
    
    -- 리밸런싱 전
    before_ratio_cash DECIMAL(10, 4),
    before_ratio_coin DECIMAL(10, 4),
    before_balance_cash DECIMAL(20, 2),
    before_balance_coin DECIMAL(20, 8),
    
    -- 리밸런싱 후
    after_ratio_cash DECIMAL(10, 4),
    after_ratio_coin DECIMAL(10, 4),
    after_balance_cash DECIMAL(20, 2),
    after_balance_coin DECIMAL(20, 8),
    
    -- 거래 정보
    traded_amount DECIMAL(20, 8),
    trade_type VARCHAR(10) COMMENT 'buy_coin, sell_coin',
    
    reason TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='리밸런싱 로그';

-- 8. 시장 데이터 스냅샷 (프리미엄 추적)
CREATE TABLE market_snapshots (
    snapshot_id INT AUTO_INCREMENT PRIMARY KEY,
    coin_symbol VARCHAR(10) NOT NULL,
    
    price_domestic DECIMAL(20, 2) NOT NULL,
    price_us DECIMAL(20, 2) NOT NULL,
    exchange_rate DECIMAL(10, 4) NOT NULL,
    
    premium DECIMAL(10, 4) COMMENT '계산된 프리미엄 %',
    volume_domestic DECIMAL(20, 2),
    volume_us DECIMAL(20, 2),
    
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_coin (coin_symbol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='시장 데이터 스냅샷';

-- 9. 일일 손익 요약 테이블
CREATE TABLE daily_summary (
    summary_id INT AUTO_INCREMENT PRIMARY KEY,
    summary_date DATE NOT NULL UNIQUE,
    
    -- 거래 통계
    total_trades INT DEFAULT 0,
    successful_trades INT DEFAULT 0,
    failed_trades INT DEFAULT 0,
    
    -- 손익
    total_profit DECIMAL(20, 2) DEFAULT 0,
    total_loss DECIMAL(20, 2) DEFAULT 0,
    net_profit DECIMAL(20, 2) DEFAULT 0,
    total_fees DECIMAL(20, 2) DEFAULT 0,
    
    -- 수익률
    roi_percentage DECIMAL(10, 4),
    
    -- 자산 현황
    total_asset_value DECIMAL(20, 2),
    profit_account_value DECIMAL(20, 2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='일일 손익 요약';

-- 10. 알림 로그 테이블
CREATE TABLE alert_logs (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    alert_type VARCHAR(30) NOT NULL COMMENT 'profit_limit, loss_limit, system_error 등',
    severity VARCHAR(20) NOT NULL COMMENT 'info, warning, critical',
    
    position_id INT,
    
    message TEXT NOT NULL,
    details JSON,
    
    is_read TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (position_id) REFERENCES positions(position_id) ON DELETE SET NULL,
    INDEX idx_created_at (created_at),
    INDEX idx_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='알림 로그';

-- ================================================================
-- 초기 데이터 입력
-- ================================================================

-- 계좌 초기화 (1:1:1:1 비율)
-- 예: 총 4천만원 투자 (각 거래소 2천만원씩, 현금:코인 = 1:1)
INSERT INTO accounts (account_type, currency, balance, initial_balance) VALUES
('domestic', 'KRW', 10000000, 10000000),
('domestic', 'BTC', 0.5, 0.5),
('us', 'USD', 7500, 7500),
('us', 'BTC', 0.5, 0.5),
('profit', 'KRW', 0, 0),
('profit', 'USD', 0, 0);

-- 기본 거래 설정
INSERT INTO trading_settings (
    setting_name,
    entry_min_premium,
    entry_min_net_premium,
    position_size,
    exit_target_premium,
    exit_target_profit,
    exit_max_holding_time,
    stop_loss_max_amount,
    stop_loss_max_rate,
    stop_loss_reverse_premium,
    trailing_enabled,
    trailing_activation_profit,
    trailing_distance,
    rebalance_threshold,
    rebalance_check_interval,
    is_active
) VALUES (
    'default',
    2.0,
    1.5,
    5000000,
    0.5,
    50000,
    3600,
    -30000,
    -0.01,
    -1.0,
    1,
    30000,
    10000,
    0.15,
    3600,
    1
);

-- ================================================================
-- 유용한 뷰(View) 생성
-- ================================================================

-- 1. 계좌 현황 뷰 (원화 환산 포함)
CREATE VIEW v_account_status AS
SELECT 
    a.account_id,
    a.account_type,
    a.currency,
    a.balance,
    a.initial_balance,
    CASE 
        WHEN a.currency = 'KRW' THEN a.balance
        WHEN a.currency = 'USD' THEN a.balance * 1330  -- 환율 고정값 (실제로는 동적으로)
        WHEN a.currency = 'BTC' THEN a.balance * 140000000  -- BTC 시세 (실제로는 동적으로)
        ELSE 0
    END AS value_in_krw,
    a.updated_at
FROM accounts a;

-- 2. 진행중인 포지션 현황 뷰
CREATE VIEW v_open_positions AS
SELECT 
    p.position_id,
    p.coin_symbol,
    p.entry_time,
    p.entry_premium,
    p.amount,
    p.position_size_krw,
    p.max_profit_reached,
    TIMESTAMPDIFF(SECOND, p.entry_time, NOW()) AS holding_time_seconds,
    p.created_at
FROM positions p
WHERE p.status = 'open';

-- 3. 일일 거래 통계 뷰
CREATE VIEW v_daily_trade_stats AS
SELECT 
    DATE(p.created_at) AS trade_date,
    COUNT(*) AS total_trades,
    SUM(CASE WHEN p.net_profit > 0 THEN 1 ELSE 0 END) AS winning_trades,
    SUM(CASE WHEN p.net_profit < 0 THEN 1 ELSE 0 END) AS losing_trades,
    SUM(p.net_profit) AS total_net_profit,
    AVG(p.net_profit) AS avg_profit_per_trade,
    MAX(p.net_profit) AS max_profit,
    MIN(p.net_profit) AS max_loss,
    SUM(p.fee_domestic + p.fee_us) AS total_fees
FROM positions p
WHERE p.status = 'closed'
GROUP BY DATE(p.created_at);

-- 4. 수익금 계좌 현황 뷰
CREATE VIEW v_profit_account AS
SELECT 
    SUM(CASE WHEN currency = 'KRW' THEN balance ELSE 0 END) AS krw_balance,
    SUM(CASE WHEN currency = 'USD' THEN balance ELSE 0 END) AS usd_balance,
    SUM(CASE WHEN currency = 'KRW' THEN balance 
             WHEN currency = 'USD' THEN balance * 1330 
             ELSE 0 END) AS total_in_krw,
    MAX(updated_at) AS last_updated
FROM accounts
WHERE account_type = 'profit';

-- ================================================================
-- 유용한 저장 프로시저
-- ================================================================

-- 1. 프리미엄 계산 프로시저
DELIMITER //
CREATE PROCEDURE sp_calculate_premium(
    IN p_coin_symbol VARCHAR(10),
    IN p_price_domestic DECIMAL(20, 2),
    IN p_price_us DECIMAL(20, 2),
    IN p_exchange_rate DECIMAL(10, 4),
    OUT p_premium DECIMAL(10, 4)
)
BEGIN
    -- 프리미엄 % = (국내가격 / (미국가격 * 환율) - 1) * 100
    SET p_premium = ((p_price_domestic / (p_price_us * p_exchange_rate)) - 1) * 100;
END //
DELIMITER ;

-- 2. 포지션 오픈 프로시저
DELIMITER //
CREATE PROCEDURE sp_open_position(
    IN p_coin_symbol VARCHAR(10),
    IN p_amount DECIMAL(20, 8),
    IN p_price_domestic DECIMAL(20, 2),
    IN p_price_us DECIMAL(20, 2),
    IN p_exchange_rate DECIMAL(10, 4),
    IN p_premium DECIMAL(10, 4),
    OUT p_position_id INT
)
BEGIN
    DECLARE v_position_size DECIMAL(20, 2);
    
    -- 포지션 크기 계산 (원화 기준)
    SET v_position_size = p_amount * p_price_domestic;
    
    -- 포지션 생성
    INSERT INTO positions (
        coin_symbol,
        status,
        entry_time,
        entry_premium,
        entry_price_domestic,
        entry_price_us,
        entry_exchange_rate,
        amount,
        position_size_krw
    ) VALUES (
        p_coin_symbol,
        'open',
        NOW(),
        p_premium,
        p_price_domestic,
        p_price_us,
        p_exchange_rate,
        p_amount,
        v_position_size
    );
    
    SET p_position_id = LAST_INSERT_ID();
    
    -- 거래 내역 기록 (국내 매도)
    INSERT INTO trades (
        position_id,
        exchange,
        coin_symbol,
        trade_type,
        amount,
        price,
        total_value,
        fee,
        executed_at
    ) VALUES (
        p_position_id,
        'domestic',
        p_coin_symbol,
        'sell',
        p_amount,
        p_price_domestic,
        v_position_size,
        v_position_size * 0.0005,  -- 0.05% 수수료
        NOW()
    );
    
    -- 거래 내역 기록 (미국 매수)
    INSERT INTO trades (
        position_id,
        exchange,
        coin_symbol,
        trade_type,
        amount,
        price,
        total_value,
        fee,
        executed_at
    ) VALUES (
        p_position_id,
        'us',
        p_coin_symbol,
        'buy',
        p_amount,
        p_price_us,
        v_position_size / p_exchange_rate,
        (v_position_size / p_exchange_rate) * 0.001,  -- 0.1% 수수료
        NOW()
    );
    
    -- 계좌 잔고 업데이트
    UPDATE accounts 
    SET balance = balance - p_amount 
    WHERE account_type = 'domestic' AND currency = p_coin_symbol;
    
    UPDATE accounts 
    SET balance = balance + v_position_size 
    WHERE account_type = 'domestic' AND currency = 'KRW';
    
    UPDATE accounts 
    SET balance = balance + p_amount 
    WHERE account_type = 'us' AND currency = p_coin_symbol;
    
    UPDATE accounts 
    SET balance = balance - (v_position_size / p_exchange_rate) 
    WHERE account_type = 'us' AND currency = 'USD';
    
END //
DELIMITER ;

-- 3. 포지션 종료 프로시저
DELIMITER //
CREATE PROCEDURE sp_close_position(
    IN p_position_id INT,
    IN p_price_domestic DECIMAL(20, 2),
    IN p_price_us DECIMAL(20, 2),
    IN p_exchange_rate DECIMAL(10, 4),
    IN p_exit_reason VARCHAR(50)
)
BEGIN
    DECLARE v_coin_symbol VARCHAR(10);
    DECLARE v_amount DECIMAL(20, 8);
    DECLARE v_entry_price_domestic DECIMAL(20, 2);
    DECLARE v_entry_price_us DECIMAL(20, 2);
    DECLARE v_position_size DECIMAL(20, 2);
    DECLARE v_fee_domestic DECIMAL(20, 2);
    DECLARE v_fee_us DECIMAL(20, 2);
    DECLARE v_net_profit DECIMAL(20, 2);
    DECLARE v_premium DECIMAL(10, 4);
    
    -- 포지션 정보 조회
    SELECT coin_symbol, amount, entry_price_domestic, entry_price_us, position_size_krw
    INTO v_coin_symbol, v_amount, v_entry_price_domestic, v_entry_price_us, v_position_size
    FROM positions
    WHERE position_id = p_position_id;
    
    -- 수수료 계산
    SET v_fee_domestic = v_position_size * 0.0005;
    SET v_fee_us = (v_position_size / p_exchange_rate) * 0.001;
    
    -- 순수익 계산
    SET v_net_profit = (v_entry_price_domestic - p_price_domestic) * v_amount - v_fee_domestic - (v_fee_us * p_exchange_rate);
    
    -- 프리미엄 계산
    CALL sp_calculate_premium(v_coin_symbol, p_price_domestic, p_price_us, p_exchange_rate, v_premium);
    
    -- 포지션 업데이트
    UPDATE positions
    SET status = 'closed',
        exit_time = NOW(),
        exit_premium = v_premium,
        exit_price_domestic = p_price_domestic,
        exit_price_us = p_price_us,
        exit_exchange_rate = p_exchange_rate,
        exit_reason = p_exit_reason,
        fee_domestic = v_fee_domestic,
        fee_us = v_fee_us,
        net_profit = v_net_profit
    WHERE position_id = p_position_id;
    
    -- 거래 내역 기록 (국내 매수)
    INSERT INTO trades (
        position_id,
        exchange,
        coin_symbol,
        trade_type,
        amount,
        price,
        total_value,
        fee,
        executed_at
    ) VALUES (
        p_position_id,
        'domestic',
        v_coin_symbol,
        'buy',
        v_amount,
        p_price_domestic,
        v_position_size,
        v_fee_domestic,
        NOW()
    );
    
    -- 거래 내역 기록 (미국 매도)
    INSERT INTO trades (
        position_id,
        exchange,
        coin_symbol,
        trade_type,
        amount,
        price,
        total_value,
        fee,
        executed_at
    ) VALUES (
        p_position_id,
        'us',
        v_coin_symbol,
        'sell',
        v_amount,
        p_price_us,
        v_position_size / p_exchange_rate,
        v_fee_us,
        NOW()
    );
    
    -- 수익금을 profit 계좌로 이체
    IF v_net_profit > 0 THEN
        INSERT INTO transactions (
            transaction_type,
            from_account,
            to_account,
            currency,
            amount,
            position_id,
            description
        ) VALUES (
            'profit_transfer',
            'domestic',
            'profit',
            'KRW',
            v_net_profit,
            p_position_id,
            CONCAT('Position #', p_position_id, ' profit transfer')
        );
        
        -- 계좌 잔고 업데이트
        UPDATE accounts 
        SET balance = balance - v_net_profit 
        WHERE account_type = 'domestic' AND currency = 'KRW';
        
        UPDATE accounts 
        SET balance = balance + v_net_profit 
        WHERE account_type = 'profit' AND currency = 'KRW';
    END IF;
    
END //
DELIMITER ;

-- 4. 일일 손익 요약 생성 프로시저
DELIMITER //
CREATE PROCEDURE sp_generate_daily_summary(IN p_date DATE)
BEGIN
    DECLARE v_total_trades INT;
    DECLARE v_successful_trades INT;
    DECLARE v_failed_trades INT;
    DECLARE v_total_profit DECIMAL(20, 2);
    DECLARE v_total_loss DECIMAL(20, 2);
    DECLARE v_net_profit DECIMAL(20, 2);
    DECLARE v_total_fees DECIMAL(20, 2);
    
    -- 통계 계산
    SELECT 
        COUNT(*),
        SUM(CASE WHEN net_profit > 0 THEN 1 ELSE 0 END),
        SUM(CASE WHEN net_profit < 0 THEN 1 ELSE 0 END),
        SUM(CASE WHEN net_profit > 0 THEN net_profit ELSE 0 END),
        SUM(CASE WHEN net_profit < 0 THEN net_profit ELSE 0 END),
        SUM(net_profit),
        SUM(fee_domestic + fee_us)
    INTO 
        v_total_trades,
        v_successful_trades,
        v_failed_trades,
        v_total_profit,
        v_total_loss,
        v_net_profit,
        v_total_fees
    FROM positions
    WHERE DATE(exit_time) = p_date AND status = 'closed';
    
    -- 요약 데이터 삽입 또는 업데이트
    INSERT INTO daily_summary (
        summary_date,
        total_trades,
        successful_trades,
        failed_trades,
        total_profit,
        total_loss,
        net_profit,
        total_fees
    ) VALUES (
        p_date,
        COALESCE(v_total_trades, 0),
        COALESCE(v_successful_trades, 0),
        COALESCE(v_failed_trades, 0),
        COALESCE(v_total_profit, 0),
        COALESCE(v_total_loss, 0),
        COALESCE(v_net_profit, 0),
        COALESCE(v_total_fees, 0)
    )
    ON DUPLICATE KEY UPDATE
        total_trades = VALUES(total_trades),
        successful_trades = VALUES(successful_trades),
        failed_trades = VALUES(failed_trades),
        total_profit = VALUES(total_profit),
        total_loss = VALUES(total_loss),
        net_profit = VALUES(net_profit),
        total_fees = VALUES(total_fees);
        
END //
DELIMITER ;

-- ================================================================
-- 사용 예시
-- ================================================================

/*
-- 1. 포지션 오픈
CALL sp_open_position(
    'BTC',           -- 코인 심볼
    0.1,             -- 거래량
    140000000,       -- 국내 가격
    103000,          -- 미국 가격
    1330,            -- 환율
    2.1,             -- 프리미엄 %
    @position_id
);
SELECT @position_id AS new_position_id;

-- 2. 포지션 종료
CALL sp_close_position(
    1,               -- 포지션 ID
    137000000,       -- 국내 청산 가격
    103000,          -- 미국 청산 가격
    1330,            -- 환율
    'take_profit'    -- 종료 사유
);

-- 3. 일일 요약 생성
CALL sp_generate_daily_summary(CURDATE());

-- 4. 계좌 현황 조회
SELECT * FROM v_account_status;

-- 5. 진행중인 포지션 조회
SELECT * FROM v_open_positions;

-- 6. 일일 거래 통계 조회
SELECT * FROM v_daily_trade_stats ORDER BY trade_date DESC LIMIT 7;
*/