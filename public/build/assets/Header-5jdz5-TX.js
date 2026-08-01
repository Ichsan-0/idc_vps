import{q as f,R as y,j as e,a as h,y as d}from"./app-C9gl-f2u.js";import{a as u}from"./user-BqcJvC7D.js";import{B as g}from"./Box-Dj-sXHVz.js";import{T as v}from"./Tooltip-DEMw0lYK.js";import{I as k}from"./IconButton-BZFlVyEG.js";import{A as j}from"./Avatar-qF2N7xgy.js";import{a as w}from"./Menu-U9ydiXpR.js";import{M}from"./MenuItem-BMygGOz5.js";import{T as b}from"./Typography-CLobn4xa.js";import{c as t}from"./createLucideIcon-KUNkPuLr.js";/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"M20 7h-3a2 2 0 0 1-2-2V2",key:"x099mo"}],["path",{d:"M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z",key:"18t6ie"}],["path",{d:"M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8",key:"1nja0z"}]],L=t("files",N);/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=[["path",{d:"M15 22a1 1 0 0 1-1-1v-4a1 1 0 0 1 .445-.832l3-2a1 1 0 0 1 1.11 0l3 2A1 1 0 0 1 22 17v4a1 1 0 0 1-1 1z",key:"1p1rcz"}],["path",{d:"M18 10a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 .601.2",key:"mcbcs9"}],["path",{d:"M18 22v-3",key:"1t1ugv"}],["circle",{cx:"10",cy:"10",r:"3",key:"1ns7v1"}]],C=t("map-pin-house",_);/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const P=[["path",{d:"M14 22v-4a2 2 0 1 0-4 0v4",key:"hhkicm"}],["path",{d:"m18 10 3.447 1.724a1 1 0 0 1 .553.894V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7.382a1 1 0 0 1 .553-.894L6 10",key:"1xqip1"}],["path",{d:"M18 5v17",key:"1sw6gf"}],["path",{d:"m4 6 7.106-3.553a2 2 0 0 1 1.788 0L20 6",key:"9d2mlk"}],["path",{d:"M6 5v17",key:"1xfsm0"}],["circle",{cx:"12",cy:"9",r:"2",key:"1092wv"}]],I=t("school",P);/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=[["path",{d:"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",key:"oel41y"}]],A=t("shield",U);/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M7 7v10",key:"d5nglc"}],["path",{d:"M11 7v10",key:"pptsnr"}],["path",{d:"m15 7 2 10",key:"1m7qm5"}]],$=t("square-library",z);/**
 * @license lucide-react v0.526.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],q=t("user",H),R=["Profile","Logout"],S=[{id:"Lowongan KPM",icon:C,label:"Lowongan KPM",path:"/kpm-vacancies"},{id:"Lowongan PPL",icon:I,label:"Lowongan PPL",path:"/ppl-vacancies"},{id:"Lamaranku",icon:L,label:"Lamaranku",path:"/my-proposal"},{id:"Classroom",icon:$,label:"Classroom",path:"/classroom"},{id:"Nilai",icon:A,label:"Nilai",path:"/grade"},{id:"Profile",icon:q,label:"Profile",path:"/profil"}],T=()=>{const{props:r,url:i}=f(),m=r.auth&&r.auth.user,o=i?new URL(i,window.location.origin).pathname:"",[c,l]=y.useState(null),x=a=>{l(a.currentTarget)},p=(a,s)=>{l(null),s===0?d.get("/profil"):s===1&&d.post("/logout")};return e.jsx("header",{className:"flex z-[100] w-full  sticky top-0 shadow-md bg-[#06359f] justify-center items-center ",children:e.jsxs("div",{className:"flex w-full px-5 max-w-7xl h-fit py-2 lg:px-20 md:px-10 justify-between items-center",children:[e.jsx("div",{className:"flex items-center",children:e.jsxs(h,{href:"/",className:"ml-3 text-2xl font-semibold flex items-center gap-2 text-white cursor-pointer",children:[e.jsx("img",{src:"/Lambang_UIN_Ar-Raniry.png",className:"w-14 h-14"}),e.jsxs("div",{className:"flex flex-col ",children:[e.jsx("span",{children:"IDC"}),e.jsx("span",{className:" md:block hidden font-normal text-sm",children:"Instructional Development Center"})]})]})}),e.jsxs("div",{className:"flex justify-end items-center gap-4",children:[m&&e.jsx("nav",{className:"hidden lg:flex items-center gap-1.5 mr-2",children:S.map(a=>{const s=a.icon,n=o===a.path||o.startsWith(a.path+"/")||a.path==="/kpm-vacancies"&&o==="/";return e.jsxs(h,{href:a.path,className:`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${n?"bg-white text-[#06359f] shadow-sm font-bold":"text-white/80 hover:text-white hover:bg-white/10"}`,children:[e.jsx(s,{className:"w-4 h-4"}),e.jsx("span",{children:a.label})]},a.id)})}),e.jsxs(g,{sx:{flexGrow:0},children:[e.jsx(v,{title:"Open settings",children:e.jsx(k,{onClick:x,sx:{p:0},children:e.jsx(j,{src:u})})}),e.jsx(w,{sx:{mt:"45px"},id:"menu-appbar",anchorEl:c,anchorOrigin:{vertical:"top",horizontal:"right"},keepMounted:!0,transformOrigin:{vertical:"top",horizontal:"right"},open:!!c,onClose:p,children:R.map((a,s)=>e.jsx(M,{onClick:n=>{p(n,s)},children:e.jsx(b,{textAlign:"center",children:a})},a))})]})]})]})})},J=T;export{L as F,J as H,C as M,I as S,q as U,$ as a,A as b};
