// src/components/StockChart.jsx
import { useEffect, useRef, useState } from "react";
import * as LWC from "lightweight-charts";
import {
  getDomesticChart, getDomesticMinute,
  getOverseasChart, getOverseasMinute,
  getExchangeCode, isDomestic, fmtPrice, fmt,
} from "../api/stockApi";
import "./StockChart.css";

const { createChart, ColorType, CrosshairMode } = LWC;

const DOM_PERIODS = [
  { label:"1분",type:"minute",timeUnit:1 },{ label:"5분",type:"minute",timeUnit:5 },
  { label:"10분",type:"minute",timeUnit:10 },{ label:"30분",type:"minute",timeUnit:30 },
  { label:"일봉",type:"daily",period:"D" },{ label:"주봉",type:"daily",period:"W" },{ label:"월봉",type:"daily",period:"M" },
];
const OVR_PERIODS = [
  { label:"일봉",type:"daily",period:"0" },{ label:"주봉",type:"daily",period:"1" },{ label:"월봉",type:"daily",period:"2" },
];

function calcMA(d,p){const r=[];for(let i=0;i<d.length;i++){if(i<p-1){r.push({time:d[i].time,value:undefined});continue;}let s=0;for(let j=0;j<p;j++)s+=d[i-j].close;r.push({time:d[i].time,value:s/p});}return r.filter(x=>x.value!==undefined);}

function parseDate(s){if(!s)return null;if(s.length===8&&!s.includes("-"))return`${s.substring(0,4)}-${s.substring(4,6)}-${s.substring(6,8)}`;return s;}

function parseMinTime(t,base){if(!t)return null;const s=t.padStart(6,"0");const d=base?new Date(base):new Date();d.setHours(+s.substring(0,2),+s.substring(2,4),+s.substring(4,6),0);return Math.floor(d.getTime()/1000);}

function transformDaily(raw){if(!raw||!Array.isArray(raw))return[];const seen=new Set();return raw.map(d=>{const t=parseDate(d.date);if(!t||seen.has(t))return null;seen.add(t);return{time:t,open:+d.open||0,high:+d.high||0,low:+d.low||0,close:+d.close||0,volume:parseInt(d.volume)||0};}).filter(Boolean).sort((a,b)=>a.time.localeCompare(b.time));}

function transformMinute(raw){if(!raw||!Array.isArray(raw))return[];const now=new Date();const base=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;const seen=new Set();return raw.map(d=>{const tf=d.date||d.time;const t=parseMinTime(tf,base);if(!t||seen.has(t))return null;seen.add(t);return{time:t,open:+d.open||0,high:+d.high||0,low:+d.low||0,close:+(d.close||d.settlement_price)||0,volume:parseInt(d.volume)||0};}).filter(Boolean).sort((a,b)=>a.time-b.time);}

export default function StockChart({ stock, fullscreen, onToggleFullscreen }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const [period, setPeriod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showMA5, setShowMA5] = useState(true);
  const [showMA20, setShowMA20] = useState(true);
  const [showMA60, setShowMA60] = useState(false);
  const [showVol, setShowVol] = useState(true);

  const dom = isDomestic(stock?.market);
  const periods = dom ? DOM_PERIODS : OVR_PERIODS;

  useEffect(() => { if(stock) setPeriod((dom?DOM_PERIODS:OVR_PERIODS).find(p=>p.label==="일봉")); }, [stock?.symbol]);

  useEffect(() => {
    if(!stock||!period||!containerRef.current)return;
    let cancelled=false;
    (async()=>{
      setLoading(true);setError(null);
      try{
        let raw;
        if(dom){raw=period.type==="minute"?await getDomesticMinute(stock.symbol,period.timeUnit):await getDomesticChart(stock.symbol,period.period);}
        else{const e=stock.exchange||getExchangeCode(stock.market);raw=period.type==="minute"?await getOverseasMinute(stock.symbol,e,period.timeUnit):await getOverseasChart(stock.symbol,e,period.period);}
        if(cancelled)return;
        const data=period.type==="minute"?transformMinute(raw):transformDaily(raw);
        if(!data.length){setError("차트 데이터가 없습니다");setLoading(false);return;}
        renderChart(data);
      }catch(e){if(!cancelled)setError(e.message||"차트 로드 실패");}
      finally{if(!cancelled)setLoading(false);}
    })();
    return()=>{cancelled=true;};
  },[stock?.symbol,period,showMA5,showMA20,showMA60,showVol,fullscreen]);

  const renderChart=(data)=>{
    if(chartRef.current){chartRef.current.remove();chartRef.current=null;}
    const c=containerRef.current;if(!c)return;
    const dk=document.documentElement.getAttribute("data-theme")==="dark";
    const h=fullscreen?Math.max(500,window.innerHeight-240):360;

    const chart=createChart(c,{
      width:c.clientWidth,height:h,
      layout:{background:{type:ColorType.Solid,color:dk?"#1a1d27":"#fff"},textColor:dk?"#9ca3af":"#6b7280",fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:11},
      grid:{vertLines:{color:dk?"#2d3140":"#f1f5f9"},horzLines:{color:dk?"#2d3140":"#f1f5f9"}},
      crosshair:{mode:CrosshairMode.Normal},
      rightPriceScale:{borderColor:dk?"#2d3140":"#e5e7eb",scaleMargins:{top:0.1,bottom:showVol?0.25:0.05}},
      timeScale:{borderColor:dk?"#2d3140":"#e5e7eb",timeVisible:period?.type==="minute",secondsVisible:false},
    });

    const add=(type,opts={})=>{const st=LWC[`${type}Series`];if(typeof chart.addSeries==="function"&&st)return chart.addSeries(st,opts);const fn=`add${type}Series`;if(typeof chart[fn]==="function")return chart[fn](opts);throw new Error(`Series ${type} not supported`);};

    const cs=add("Candlestick",{upColor:"#ef4444",downColor:"#3b82f6",borderUpColor:"#ef4444",borderDownColor:"#3b82f6",wickUpColor:"#ef4444",wickDownColor:"#3b82f6"});
    cs.setData(data.map(d=>({time:d.time,open:d.open,high:d.high,low:d.low,close:d.close})));

    if(showMA5&&data.length>=5){const s=add("Line",{color:"#f59e0b",lineWidth:1,priceLineVisible:false,lastValueVisible:false,crosshairMarkerVisible:false});s.setData(calcMA(data,5));}
    if(showMA20&&data.length>=20){const s=add("Line",{color:"#14b8a6",lineWidth:1,priceLineVisible:false,lastValueVisible:false,crosshairMarkerVisible:false});s.setData(calcMA(data,20));}
    if(showMA60&&data.length>=60){const s=add("Line",{color:"#8b5cf6",lineWidth:1,priceLineVisible:false,lastValueVisible:false,crosshairMarkerVisible:false});s.setData(calcMA(data,60));}
    if(showVol){const v=add("Histogram",{priceFormat:{type:"volume"},priceScaleId:"volume"});chart.priceScale("volume").applyOptions({scaleMargins:{top:0.8,bottom:0}});v.setData(data.map(d=>({time:d.time,value:d.volume,color:d.close>=d.open?"rgba(239,68,68,0.3)":"rgba(59,130,246,0.3)"})));}

    chart.timeScale().fitContent();
    chartRef.current=chart;
    const ro=new ResizeObserver(()=>{if(c&&chartRef.current)chartRef.current.applyOptions({width:c.clientWidth});});
    ro.observe(c);
  };

  useEffect(()=>()=>{if(chartRef.current){chartRef.current.remove();chartRef.current=null;}},[]);

  if(!stock)return null;

  return(
    <div className={`stock-chart-wrap ${fullscreen?"fullscreen":""}`}>
      <div className="chart-header">
        <div className="chart-stock-info">
          <h3>{stock.name}</h3>
          <span className="chart-symbol">{stock.symbol}</span>
          <span className={`market-badge ${stock.market?.toLowerCase()}`}>{stock.market}</span>
        </div>
        <div className="chart-header-right">
          {stock.price&&(
            <div className="chart-price-row">
              <span className="chart-price">{fmtPrice(stock.price,stock.market)}</span>
              <span className={`chart-change ${Number(stock.changePercent)>=0?"up":"down"}`}>
                {Number(stock.changePercent)>=0?"▲":"▼"} {fmt(Math.abs(Number(stock.change)))} ({stock.changePercent}%)
              </span>
            </div>
          )}
          <button className="fullscreen-btn" onClick={onToggleFullscreen} title={fullscreen?"축소":"전체화면"}>
            {fullscreen?(
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            ):(
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            )}
          </button>
        </div>
      </div>

      <div className="chart-period-tabs">
        {periods.map(p=><button key={p.label} className={`period-tab ${period?.label===p.label?"active":""}`} onClick={()=>setPeriod(p)}>{p.label}</button>)}
      </div>

      <div className="chart-indicators">
        <label className={`ind-chip ${showMA5?"on":""}`} style={{"--ind-color":"#f59e0b"}}><input type="checkbox" checked={showMA5} onChange={()=>setShowMA5(v=>!v)}/>MA5</label>
        <label className={`ind-chip ${showMA20?"on":""}`} style={{"--ind-color":"#14b8a6"}}><input type="checkbox" checked={showMA20} onChange={()=>setShowMA20(v=>!v)}/>MA20</label>
        <label className={`ind-chip ${showMA60?"on":""}`} style={{"--ind-color":"#8b5cf6"}}><input type="checkbox" checked={showMA60} onChange={()=>setShowMA60(v=>!v)}/>MA60</label>
        <label className={`ind-chip ${showVol?"on":""}`} style={{"--ind-color":"#6b7280"}}><input type="checkbox" checked={showVol} onChange={()=>setShowVol(v=>!v)}/>거래량</label>
      </div>

      <div className="chart-canvas-wrap" style={fullscreen?{minHeight:Math.max(500,window.innerHeight-240)}:{}}>
        {loading&&<div className="chart-overlay"><div className="loading-spinner"/></div>}
        {error&&<div className="chart-overlay"><span>⚠️ {error}</span></div>}
        <div ref={containerRef} className="chart-canvas" style={fullscreen?{height:Math.max(500,window.innerHeight-240)}:{}}/>
      </div>
    </div>
  );
}
