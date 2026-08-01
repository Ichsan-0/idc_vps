import{q as M,R as x,j as e,a as f,y as l}from"./app-uj3GaIay.js";import{a as N}from"./user-BqcJvC7D.js";import{B as u}from"./Box-C7X6W1Q5.js";import{I as y}from"./IconButton-MgB_-_lk.js";import{c as n}from"./createLucideIcon-BKqkL9Cd.js";import{a as g}from"./Menu-YY2CpRCq.js";import{M as k}from"./MenuItem-CxjgxEFJ.js";import{T as v}from"./Typography-CWu-CBZ8.js";import{T as C}from"./Tooltip-C3EMmg3n.js";import{A as _}from"./Avatar-CX9ZlcAu.js";/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"M20 7h-3a2 2 0 0 1-2-2V2",key:"x099mo"}],["path",{d:"M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z",key:"18t6ie"}],["path",{d:"M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8",key:"1nja0z"}]],z=n("files",L);/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=[["path",{d:"M15 22a1 1 0 0 1-1-1v-4a1 1 0 0 1 .445-.832l3-2a1 1 0 0 1 1.11 0l3 2A1 1 0 0 1 22 17v4a1 1 0 0 1-1 1z",key:"1p1rcz"}],["path",{d:"M18 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 .601.2",key:"mcbcs9"}],["path",{d:"M18 22v-3",key:"1t1ugv"}],["circle",{cx:"10",cy:"10",r:"3",key:"1ns7v1"}]],I=n("map-pin-house",A);/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=[["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 18h16",key:"19g7jn"}],["path",{d:"M4 6h16",key:"1o0s65"}]],U=n("menu",P);/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"M14 22v-4a2 2 0 1 0-4 0v4",key:"hhkicm"}],["path",{d:"m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10",key:"1xqip1"}],["path",{d:"M18 5v17",key:"1sw6gf"}],["path",{d:"m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6",key:"9d2mlk"}],["path",{d:"M6 5v17",key:"1xfsm0"}],["circle",{cx:"12",cy:"9",r:"2",key:"1092wv"}]],E=n("school",$);/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]],O=n("shield",H);/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M7 7v10",key:"d5nglc"}],["path",{d:"M11 7v10",key:"pptsnr"}],["path",{d:"m15 7 2 10",key:"1m7qm5"}]],T=n("square-library",S);/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],B=n("user",q),R=["Profile","Logout"],j=[{id:"Lowongan KPM",icon:I,label:"Lowongan KPM",path:"/kpm-vacancies"},{id:"Lowongan PPL",icon:E,label:"Lowongan PPL",path:"/ppl-vacancies"},{id:"Lamaranku",icon:z,label:"Lamaranku",path:"/my-proposal"},{id:"Classroom",icon:T,label:"Classroom",path:"/classroom"},{id:"Nilai",icon:O,label:"Nilai",path:"/grade"},{id:"Profile",icon:B,label:"Profile",path:"/profil"}],V=()=>{const{props:c,url:i}=M(),w=c.auth&&c.auth.user,o=i?new URL(i,window.location.origin).pathname:"",[h,p]=x.useState(null),[d,r]=x.useState(null),b=a=>{p(a.currentTarget)},m=(a,s)=>{p(null),s===0?l.get("/profil"):s===1&&l.post("/logout")};return e.jsx("header",{className:"flex z-[100] w-full  sticky top-0 shadow-md bg-[#06359f] justify-center items-center ",children:e.jsxs("div",{className:"flex w-full px-5 max-w-7xl h-fit py-2 lg:px-20 md:px-10 justify-between items-center",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs(f,{href:"/",className:"ml-3 text-2xl font-semibold flex items-center gap-2 text-white cursor-pointer",children:[e.jsx("img",{src:"/Lambang_UIN_Ar-Raniry.png",className:"w-14 h-14"}),e.jsxs("div",{className:"flex flex-col ",children:[e.jsx("span",{children:"IDC"}),e.jsx("span",{className:" md:block hidden font-normal text-sm",children:"Instructional Development Center"})]})]})}),e.jsxs("div",{className:"flex justify-end items-center gap-4",children:[w&&e.jsxs(e.Fragment,{children:[e.jsxs(u,{sx:{display:{xs:"flex",lg:"none"}},children:[e.jsx(y,{size:"large",onClick:a=>r(a.currentTarget),color:"inherit",sx:{color:"white",p:1},children:e.jsx(U,{className:"w-6 h-6"})}),e.jsx(g,{id:"menu-appbar-nav",anchorEl:d,anchorOrigin:{vertical:"bottom",horizontal:"left"},keepMounted:!0,transformOrigin:{vertical:"top",horizontal:"left"},open:!!d,onClose:()=>r(null),sx:{display:{xs:"block",lg:"none"},mt:"10px"},children:j.map(a=>{const s=a.icon,t=o===a.path||o.startsWith(a.path+"/")||a.path==="/kpm-vacancies"&&o==="/";return e.jsxs(k,{onClick:()=>{r(null),l.get(a.path)},sx:{backgroundColor:t?"action.selected":"transparent",fontWeight:t?"bold":"normal",color:t?"#06359f":"inherit",display:"flex",gap:1.5,py:1.25,px:2.5},children:[e.jsx(s,{className:"w-4 h-4"}),e.jsx(v,{variant:"body2",children:a.label})]},a.id)})})]}),e.jsx("nav",{className:"hidden lg:flex items-center gap-1.5 mr-2",children:j.map(a=>{const s=a.icon,t=o===a.path||o.startsWith(a.path+"/")||a.path==="/kpm-vacancies"&&o==="/";return e.jsxs(f,{href:a.path,className:`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${t?"bg-white text-[#06359f] shadow-sm font-bold":"text-white/80 hover:text-white hover:bg-white/10"}`,children:[e.jsx(s,{className:"w-4 h-4"}),e.jsx("span",{children:a.label})]},a.id)})})]}),e.jsxs(u,{sx:{flexGrow:0},children:[e.jsx(C,{title:"Open settings",children:e.jsx(y,{onClick:b,sx:{p:0},children:e.jsx(_,{src:N})})}),e.jsx(g,{sx:{mt:"45px"},id:"menu-appbar",anchorEl:h,anchorOrigin:{vertical:"top",horizontal:"right"},keepMounted:!0,transformOrigin:{vertical:"top",horizontal:"right"},open:!!h,onClose:m,children:R.map((a,s)=>e.jsx(k,{onClick:t=>{m(t,s)},children:e.jsx(v,{textAlign:"center",children:a})},a))})]})]})]})})},ee=V;export{z as F,ee as H,I as M,E as S,B as U,T as a,O as b};
