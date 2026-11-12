import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { Maximize2, Minus, Plus } from 'lucide-react'
import { DESTINATIONS, type Trace, selectedRoute } from './engine'
let landCache: GeoJSON.GeoJsonObject | undefined
function arc(a: [number,number], b: [number,number], bend: number): [number,number][] {
 return Array.from({length:81},(_,i)=>{ const t=i/80; return [a[0]+(b[0]-a[0])*t+Math.sin(Math.PI*t)*bend,a[1]+(b[1]-a[1])*t] })
}
export default function RouteMap({trace}:{trace:Trace}) {
 const container=useRef<HTMLDivElement>(null), mapRef=useRef<L.Map|null>(null)
 const resetRef=useRef<(()=>void)|null>(null)
 const [failed,setFailed]=useState(false)
 const destination=DESTINATIONS[trace.intent.destination], route=selectedRoute(trace)
 useEffect(()=>{
  if(!container.current)return
  const map=L.map(container.current,{zoomControl:false,attributionControl:false,scrollWheelZoom:false,dragging:true,doubleClickZoom:false,boxZoom:false,keyboard:true,minZoom:1,maxZoom:7,zoomSnap:0.1,preferCanvas:false})
  mapRef.current=map
  const a:[number,number]=[51.507,-0.128], b=destination.coordinates
  const domestic=trace.intent.destination==='GB', europe=trace.intent.destination==='DE', asia=trace.intent.destination==='SG'
  const bounds:L.LatLngBoundsExpression=domestic?[[49,-9],[56,7]]:europe?[[45,-9],[59,23]]:asia?[[-8,-12],[66,118]]:[[12,-107],[66,35]]
  function frame(){map.fitBounds(bounds,{padding:[12,12],animate:false})}
  frame()
  resetRef.current=frame
  let alive=true
  const load=async()=>{try {const data=landCache??await fetch('/land.geojson').then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json()});landCache=data;if(alive)L.geoJSON(data,{interactive:false,style:{color:'#c5d7ca',weight:0.7,fillColor:'#dce8dc',fillOpacity:1}}).addTo(map).bringToBack()}catch{if(alive)setFailed(true)}}
  void load()
  const bend=domestic?0.7:europe?1.8:asia?17:14
  if(route){
   L.polyline(arc(a,b,bend-7),{color:'#b4c2b6',weight:1.3,opacity:0.8,dashArray:'4 7',interactive:false}).addTo(map)
   L.polyline(arc(a,b,bend),{color:'#b2ddba',weight:8,opacity:0.35,interactive:false}).addTo(map)
   const path=L.polyline(arc(a,b,bend),{color:'#2d7453',weight:2.5,opacity:1,dashArray:'6 0',interactive:false}).addTo(map)
   path.getElement()?.classList.add('map-route-line')
   const mid=arc(a,b,bend)[40]
   L.marker(mid,{interactive:false,icon:L.divIcon({className:'map-waypoint',html:b[1]<a[1]?'<span>↖</span>':'<span>↗</span>',iconSize:[32,32],iconAnchor:[16,16]})}).addTo(map)
  }
  for(const [point,label,description,direction] of [[a,'London',trace.intent.destination==='WALLET'?'Source wallet':'Source bank','left'],[b,destination.city,trace.intent.destination==='WALLET'?'Beneficiary wallet':'Beneficiary bank','right']] as const){
   L.circleMarker(point as [number,number],{radius:12,color:'#2c6b48',weight:1,opacity:0.2,fillColor:'#86c794',fillOpacity:0.16}).addTo(map)
   L.circleMarker(point as [number,number],{radius:4.5,color:'#fff',weight:2,fillColor:'#285a41',fillOpacity:1}).addTo(map).bindTooltip(`<strong>${label}</strong><span>${description}</span>`,{permanent:true,direction:direction as L.Direction,offset:direction==='left'?[-16,0]:[16,0],className:'map-city'})
  }
  const observer=new ResizeObserver(()=>{map.invalidateSize();frame()});observer.observe(container.current)
  return()=>{alive=false;observer.disconnect();map.remove();mapRef.current=null;resetRef.current=null}
 },[destination,route?.id,trace.intent.destination])
 return <div className="map-wrap"><div ref={container} className="route-map" role="img" aria-label={`Illustrative payment route from London to ${destination.city}; ${route?.name??'no executable route'}`}/><span className="map-ocean">{trace.intent.destination==='SG'?'INDIAN OCEAN':trace.intent.destination==='GB'||trace.intent.destination==='DE'?'EUROPE':'NORTH ATLANTIC OCEAN'}</span><div className="map-controls"><button aria-label="Zoom in" onClick={()=>mapRef.current?.zoomIn()}><Plus size={15}/></button><button aria-label="Zoom out" onClick={()=>mapRef.current?.zoomOut()}><Minus size={15}/></button><button aria-label="Reset map view" onClick={()=>resetRef.current?.()}><Maximize2 size={14}/></button></div><div className="map-caption"><span className="route-line-key"/>Proposed value journey <span className="map-caption-secondary">· Illustrative geography{failed?' · Base map unavailable':''}</span></div><a className="map-credit" href="https://www.naturalearthdata.com/about/terms-of-use/" target="_blank" rel="noreferrer">Natural Earth</a></div>
}
