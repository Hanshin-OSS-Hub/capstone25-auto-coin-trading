import { useState, useEffect, useCallback, useRef } from "react";
import {
  searchStocks, getDomesticPrice, getOverseasPrice,
  getExchangeCode, isDomestic, fmt, fmtPrice,
  getExchangeRate as fetchRate,
  getWatchlist, addWatchlist, removeWatchlist,
  DOMESTIC_STOCKS, OVERSEAS_STOCKS,
} from "../api/stockApi";
import StockChart from "../components/StockChart";
import TradeModal from "../components/TradeModal";
import useRealtimePrice from "../hooks/useRealtimePrice";
import "./MainDashboard.css";

const MARKET_FILTERS = ["전체","코스피","코스닥","ETF","해외주식"];
const MARKET_MAP = {"코스피":"KOSPI","코스닥":"KOSDAQ","ETF":"ETF","해외주식":"OVERSEAS"};

const SIDE_PANELS = [
  {id:"watchlist",label:"관심",icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>},
  {id:"ai",label:"AI분석",icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>},
  {id:"recent",label:"최근본",icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>},
  {id:"realtime",label:"실시간",icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>},
];

function SunIcon(){return<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;}
function MoonIcon(){return<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;}

export default function MainDashboard({user}){
  const[activeCat,setActiveCat]=useState("전체");
  const[activeTab,setActiveTab]=useState("실시간 차트");
  const[openPanel,setOpenPanel]=useState(null);
  const[stocks,setStocks]=useState([]);
  const[loading,setLoading]=useState(true);
  const[error,setError]=useState(null);
  const[selectedStock,setSelectedStock]=useState(null);
  const[tradeModalStock,setTradeModalStock]=useState(null);
  const[chartFullscreen,setChartFullscreen]=useState(false);
  const[searchQuery,setSearchQuery]=useState("");
  const[recentStocks,setRecentStocks]=useState([]);
  const searchTimer=useRef(null);
  const[dark,setDark]=useState(()=>localStorage.getItem("cubic_dark")==="true");
  const[exRate,setExRate]=useState({rate:1380});

  // 관심종목 (서버 저장)
  const[watchlist,setWatchlist]=useState([]);
  const loadWatchlist=async()=>{if(!user)return;try{const w=await getWatchlist();setWatchlist(w||[]);}catch(e){console.warn("관심종목 로드 실패:",e);}};
  useEffect(()=>{if(user)loadWatchlist();},[user]);
  const isWatched=(symbol)=>watchlist.some(w=>w.symbol===symbol);
  const toggleWatch=async(stock,e)=>{
    if(e)e.stopPropagation();
    if(!user){alert("로그인 후 이용해 주세요.");return;}
    try{
      if(isWatched(stock.symbol)){await removeWatchlist(stock.symbol);}
      else{await addWatchlist(stock.symbol,stock.name,stock.market);}
      await loadWatchlist();
    }catch(err){console.warn("관심종목 변경 실패:",err);}
  };

  useEffect(()=>{document.documentElement.setAttribute("data-theme",dark?"dark":"light");localStorage.setItem("cubic_dark",dark);},[dark]);
  useEffect(()=>{fetchDefaultStocks();loadExRate();},[]);

  const loadExRate=async()=>{try{const r=await fetchRate();setExRate(r);}catch(e){console.warn("환율 실패:",e);}};

  const handlePriceUpdate=useCallback((symbol,data)=>{
    setStocks(prev=>prev.map(s=>s.symbol===symbol?{...s,...data}:s));
    setSelectedStock(prev=>prev?.symbol===symbol?{...prev,...data}:prev);
  },[]);
  const{connected:wsConnected}=useRealtimePrice(stocks,handlePriceUpdate);

  const fetchDefaultStocks=async()=>{
    setLoading(true);setError(null);const all=[];
    try{const r=await Promise.allSettled(DOMESTIC_STOCKS.map(async s=>{const p=await getDomesticPrice(s.symbol);return{...s,...p};}));r.forEach(x=>{if(x.status==="fulfilled"&&x.value)all.push(x.value);});}catch{}
    try{const r=await Promise.allSettled(OVERSEAS_STOCKS.map(async s=>{const p=await getOverseasPrice(s.symbol,s.exchange||"NAS");return{...s,...p};}));r.forEach(x=>{if(x.status==="fulfilled"&&x.value)all.push(x.value);});}catch{}
    if(!all.length)setError("서버에 연결할 수 없습니다.");
    setStocks(all);setLoading(false);
  };

  const handleSearch=useCallback((q)=>{
    setSearchQuery(q);if(searchTimer.current)clearTimeout(searchTimer.current);
    if(!q.trim()){fetchDefaultStocks();return;}
    searchTimer.current=setTimeout(async()=>{
      setLoading(true);
      try{
        const res=await searchStocks(q);const all=[];
        const dom=res.filter(s=>isDomestic(s.market)).slice(0,10);
        const dr=await Promise.allSettled(dom.map(async s=>{const p=await getDomesticPrice(s.symbol);return{...s,...p};}));
        dr.forEach(x=>{if(x.status==="fulfilled"&&x.value)all.push(x.value);});
        const ovr=res.filter(s=>!isDomestic(s.market)).slice(0,10);
        const or2=await Promise.allSettled(ovr.map(async s=>{const p=await getOverseasPrice(s.symbol,getExchangeCode(s.market));return{...s,...p};}));
        or2.forEach(x=>{if(x.status==="fulfilled"&&x.value)all.push(x.value);});
        setStocks(all);
      }catch{setError("검색 실패");}finally{setLoading(false);}
    },400);
  },[]);

  const handleSelectStock=(stock)=>{setSelectedStock(stock);setRecentStocks(prev=>[stock,...prev.filter(s=>s.symbol!==stock.symbol)].slice(0,10));};
  const handleOpenTrade=(stock)=>{if(!user){alert("로그인 후 이용해 주세요.");return;}setTradeModalStock(stock);};
  const filteredStocks=stocks.filter(s=>{if(activeCat==="전체")return true;const mk=MARKET_MAP[activeCat];return mk==="OVERSEAS"?!isDomestic(s.market):s.market===mk;});
  const togglePanel=(id)=>setOpenPanel(prev=>prev===id?null:id);

  // 관심종목에 실시간 가격 매칭
  const watchlistWithPrices=watchlist.map(w=>{const live=stocks.find(s=>s.symbol===w.symbol);return live?{...w,...live}:w;});

  return(
    <div className="page-wrap">
      <div className="content-area">
        <div className="notice-bar">
          <span className="notice-dot"/>
          <span>{user?`${user.name}님, 모의 투자를 시작해 보세요!`:"실시간 주식 데이터가 연동되었습니다"}{wsConnected&&<span className="ws-badge">● LIVE</span>}</span>
          <button className="notice-btn" onClick={fetchDefaultStocks}>새로고침</button>
        </div>
        <div className="ticker-bar"><div className="ticker-scroll">
          <span className="ticker-item ticker-fx"><strong>USD/KRW</strong> {fmt(Math.round(exRate.rate))}원</span>
          <span className="ticker-divider">|</span>
          {stocks.slice(0,8).map(s=>(
            <span key={s.symbol} className="ticker-item"><strong>{s.name}</strong> {s.price?fmtPrice(s.price,s.market):"-"}{" "}
            {s.changePercent&&<span className={Number(s.changePercent)>=0?"up":"down"}>{Number(s.changePercent)>=0?"+":""}{s.changePercent}%</span>}</span>
          ))}
        </div></div>

        <div className="main-area"><div className="content-row">
          <section className="stock-section">
            <div className="tab-row">
              {["실시간 차트","테마·섹터","투자자 동향"].map(t=><button key={t} className={`tab-btn ${activeTab===t?"active":""}`} onClick={()=>setActiveTab(t)}>{t}</button>)}
              <div className="row-spacer"/>
              <div className="search-inline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="종목명 / 코드 검색" value={searchQuery} onChange={e=>handleSearch(e.target.value)}/>
              </div>
            </div>
            <div className="cat-area"><div className="chip-row">
              {MARKET_FILTERS.map(c=><button key={c} className={`chip ${activeCat===c?"active":""}`} onClick={()=>setActiveCat(c)}>{c}</button>)}
            </div></div>
            <div className="tbl-head"><span style={{textAlign:"left"}}>종목</span><span>현재가</span><span>등락률</span><span>주문</span></div>
            <div className="tbl-body">
              {loading?(<div className="empty-box"><div className="loading-spinner"/><p className="empty-title">종목 데이터를 불러오는 중...</p></div>
              ):error?(<div className="empty-box"><span className="empty-ico">⚠️</span><p className="empty-title">{error}</p><button className="retry-btn" onClick={fetchDefaultStocks}>다시 시도</button></div>
              ):!filteredStocks.length?(<div className="empty-box"><span className="empty-ico">📊</span><p className="empty-title">해당 종목이 없습니다</p></div>
              ):filteredStocks.map(s=>(
                <div key={s.symbol} className={`tbl-row ${selectedStock?.symbol===s.symbol?"selected":""}`} onClick={()=>handleSelectStock(s)}>
                  <span className="stock-name-cell">
                    <button className={`star-btn ${isWatched(s.symbol)?"on":""}`} onClick={(e)=>toggleWatch(s,e)} title="관심종목">{isWatched(s.symbol)?"★":"☆"}</button>
                    <div><strong>{s.name}</strong><small>{s.symbol} · <span className={`market-mini ${s.market?.toLowerCase()}`}>{s.market}</span></small></div>
                  </span>
                  <span className="price-cell">{s.price?fmtPrice(s.price,s.market):"-"}</span>
                  <span className={`change-cell ${Number(s.changePercent)>=0?"up":"down"}`}>{s.changePercent?`${Number(s.changePercent)>=0?"+":""}${s.changePercent}%`:"-"}</span>
                  <span className="order-cell"><button className="order-btn" onClick={e=>{e.stopPropagation();handleOpenTrade(s);}}>주문</button></span>
                </div>
              ))}
            </div>
          </section>

          <aside className={`chart-aside ${chartFullscreen?"hidden":""}`}>
            {selectedStock?(<>
              <StockChart stock={selectedStock} fullscreen={chartFullscreen} onToggleFullscreen={()=>setChartFullscreen(v=>!v)}/>
              <div className="trade-quick-box">
                <button className="quick-buy" onClick={()=>handleOpenTrade(selectedStock)}>매수</button>
                <button className="quick-sell" onClick={()=>handleOpenTrade(selectedStock)}>매도</button>
              </div>
              <div className="ai-box"><div className="ai-box-title">✦ AI 큐빅 분석</div><p className="ai-box-desc">{selectedStock.name}({selectedStock.symbol}) 분석 준비 중</p></div>
            </>):(<>
              <div className="chart-box"><span className="chart-ico">📈</span><p>종목을 선택하면<br/>캔들차트가 표시됩니다</p></div>
              <div className="ai-box"><div className="ai-box-title">✦ AI 큐빅 분석</div><p className="ai-box-desc">AI 분석 데이터 연동 예정</p></div>
            </>)}
          </aside>
        </div></div>
      </div>

      {chartFullscreen&&selectedStock&&<StockChart stock={selectedStock} fullscreen={true} onToggleFullscreen={()=>setChartFullscreen(false)}/>}

      <div className="sidebar">
        <div className={`slide-panel ${openPanel?"open":""}`}>
          {openPanel==="watchlist"&&<WatchlistPanel watchlist={watchlistWithPrices} onSelect={handleSelectStock} onRemove={(s)=>toggleWatch(s)}/>}
          {openPanel==="ai"&&<AiPanel/>}
          {openPanel==="recent"&&<RecentPanel stocks={recentStocks} onSelect={handleSelectStock}/>}
          {openPanel==="realtime"&&<RealtimePanel stocks={stocks.slice(0,8)} connected={wsConnected}/>}
        </div>
        <div className="icon-col">
          {SIDE_PANELS.map(p=><button key={p.id} className={`icon-btn ${openPanel===p.id?`active icon-${p.id}`:""}`} onClick={()=>togglePanel(p.id)} title={p.label}>{p.icon}<span>{p.label}</span></button>)}
          <button className="darkmode-toggle" onClick={()=>setDark(v=>!v)} title={dark?"라이트 모드":"다크 모드"}>
            <span className="dm-icon">{dark?<SunIcon/>:<MoonIcon/>}</span><span>{dark?"라이트":"다크"}</span>
          </button>
        </div>
      </div>

      {tradeModalStock&&<TradeModal stock={tradeModalStock} onClose={()=>setTradeModalStock(null)} onSuccess={()=>{}}/>}
    </div>
  );
}

function PanelShell({title,sub,children,theme=""}){return<div className={`panel-shell ${theme}`}><div className="panel-hd"><span className="panel-title">{title}</span>{sub&&<span className="panel-sub">{sub}</span>}</div><div className="panel-body">{children}</div></div>;}
function EmptyMsg({icon,title,desc}){return<div className="panel-empty"><span className="panel-empty-ico">{icon}</span><p className="panel-empty-title">{title}</p><p className="panel-empty-desc">{desc}</p></div>;}
function WatchlistPanel({watchlist=[],onSelect,onRemove}){
  return<PanelShell title="관심종목" sub={`${watchlist.length}개 종목`} theme="theme-rose">{!watchlist.length?<EmptyMsg icon="♡" title="관심 종목이 없어요" desc={"종목 옆 ☆ 버튼을 눌러\n관심종목을 추가해 보세요."}/>:<div className="panel-list">{watchlist.map(s=><div key={s.symbol} className="panel-stock-item" onClick={()=>onSelect?.(s)}><div><strong>{s.name}</strong><small>{s.price?(isDomestic(s.market)?`${fmt(s.price)}원`:`$${s.price}`):s.symbol}</small></div><div style={{display:"flex",alignItems:"center",gap:6}}><span className={Number(s.changePercent)>=0?"up":"down"}>{s.changePercent?`${Number(s.changePercent)>=0?"+":""}${s.changePercent}%`:""}</span><button onClick={e=>{e.stopPropagation();onRemove?.(s)}} style={{fontSize:14,border:"none",background:"none",color:"#e11d48",cursor:"pointer"}}>★</button></div></div>)}</div>}</PanelShell>;
}
function AiPanel(){return<PanelShell title="✦ AI 큐빅 분석" sub="3D 큐빅 모델 실시간 신호" theme="theme-violet"><EmptyMsg icon="✦" title="AI 분석 연동 예정" desc={"백엔드 연동 후\n실시간 신호가 표시됩니다."}/></PanelShell>;}
function RecentPanel({stocks=[],onSelect}){return<PanelShell title="최근 본 종목" sub="오늘 조회한 종목" theme="theme-amber">{!stocks.length?<EmptyMsg icon="🕐" title="최근 본 종목이 없어요" desc={"종목을 클릭하면\n여기에 기록됩니다."}/>:<div className="panel-list">{stocks.map(s=><div key={s.symbol} className="panel-stock-item" onClick={()=>onSelect?.(s)}><div><strong>{s.name}</strong><small>{s.symbol}</small></div><span className={Number(s.changePercent)>=0?"up":"down"}>{s.changePercent?`${Number(s.changePercent)>=0?"+":""}${s.changePercent}%`:""}</span></div>)}</div>}</PanelShell>;}
function RealtimePanel({stocks=[],connected}){return<PanelShell title={<>실시간 체결 {connected&&<span style={{color:"#22c55e",fontSize:10}}>● LIVE</span>}</>} sub="주요 종목 현황" theme="theme-cyan">{!stocks.length?<EmptyMsg icon="⚡" title="데이터 로딩 중" desc="잠시만 기다려주세요."/>:<div className="panel-list">{stocks.map(s=><div key={s.symbol} className="panel-stock-item"><div><strong>{s.name}</strong><small>{s.price?(isDomestic(s.market)?`${fmt(s.price)}원`:`$${s.price}`):"-"}</small></div><span className={Number(s.changePercent)>=0?"up":"down"}>{s.changePercent?`${Number(s.changePercent)>=0?"+":""}${s.changePercent}%`:""}</span></div>)}</div>}</PanelShell>;}
