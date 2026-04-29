import{b as w}from"./qrcode-BwNhwvQ0.js";let c=null,f=0;function E(){f=window.scrollY||document.documentElement.scrollTop||0,c={position:document.body.style.position||"",top:document.body.style.top||"",overflow:document.body.style.overflow||""},document.body.style.position="fixed",document.body.style.top=`-${f}px`,document.body.style.overflow="hidden",document.documentElement.classList.add("no-scroll")}function v(){c&&(document.body.style.position=c.position,document.body.style.top=c.top,document.body.style.overflow=c.overflow,window.scrollTo(0,f),c=null),document.documentElement.classList.remove("no-scroll")}function p(e){return Array.from(e.querySelectorAll("a,button,input,textarea,select,[tabindex]")).filter(t=>!(t.hasAttribute("disabled")||t.getAttribute("type")==="hidden"))}function T(e){return e.key==="Tab"||e.keyCode===9}function S(e){return e.key==="Enter"||e.keyCode===13}function k(e){return e.key===" "||e.key==="Space"||e.keyCode===32}function I(e){return e.key==="Escape"||e.key==="Esc"||e.keyCode===27}function z(e){return S(e)||k(e)}function K(e){let t=null;function o(){e&&(t=r=>{if(!T(r))return;const n=p(e);if(n.length===0){r.preventDefault();return}const u=n[0],d=n[n.length-1],l=document.activeElement;r.shiftKey?(!l||l===u||!e.contains(l))&&(r.preventDefault(),d.focus()):(!l||l===d||!e.contains(l))&&(r.preventDefault(),u.focus())},document.addEventListener("keydown",t))}function a(){t&&(document.removeEventListener("keydown",t),t=null)}function s(){const r=p(e);r.length>0&&r[0].focus()}return{activate:o,deactivate:a,focusFirst:s}}function Y(e){const t=o=>{I(o)&&e()};return document.addEventListener("keydown",t),()=>{document.removeEventListener("keydown",t)}}async function q(e,t,o="html, body, *"){const a=t.split(".").pop()?.split("?").shift()?.toLowerCase();let s;switch(a){case"woff2":s="woff2";break;case"woff":s="woff";break;case"ttf":s="truetype";break;case"otf":s="opentype";break;case"eot":s="embedded-opentype";break;case"svg":s="svg";break;default:throw new Error(`Unsupported font format: ${a}`)}const r=new FontFace(e,`url("${t}") format("${s}")`);try{let n=function(){const d=document.createElement("style");d.textContent=`${o} {font-family: "${e}", var(--base-font) !important;}`,d.id=`loadFont-${e}`,document.head.appendChild(d)};const u=await r.load();return document.fonts.add(u),n}catch(n){console.warn("font load err",n)}return null}const C=4e3,x=24e3,L=120,h="bsod-screen",y="bsod-screen-style";function A(){const e=navigator.userAgent;return e.includes("Edg/")?"msedge":e.includes("Chrome/")&&!e.includes("Edg/")?"chrome":e.includes("Firefox/")?"firefox":e.includes("Safari/")&&!e.includes("Chrome/")?"safari":"browser"}function M(){const e=navigator.userAgent;return e.includes("Windows NT")?"windows":e.includes("Mac OS X")?"mac":e.includes("Linux")?"linux":"unknown"}function O(e){switch(M()){case"windows":return`${e}.exe`;case"mac":return`${e}.app`;case"linux":return e;default:return e}}const F=[{stopCode:"AI_TAKING_OVER",failedModule:"skynet.sys",bucketId:"0xRUN_NOW"},{stopCode:"UNEXPECTED_MEME_EXCEPTION",failedModule:"internet.sys",bucketId:"0xMEME_404"},{stopCode:"USER_ATTEMPTED_THINKING",failedModule:"logic.dll",bucketId:"0x0000_ID10T"},{stopCode:"TOO_MANY_TABS_OPEN",failedModule:O(A()),bucketId:"0xRAM_GONE"},{stopCode:"RECURSIVE_EXISTENTIAL_CRISIS",failedModule:"mind.sys",bucketId:"0xWHY_LOOP"},{stopCode:"OUT_OF_COFFEE_EXCEPTION",failedModule:"caffeine.sys",bucketId:"0xEMPTY_CUP"},{stopCode:"REALITY_ACCESS_DENIED",failedModule:"dreams.dll",bucketId:"0xNO_ESCAPE"}],b=["github.com/hi2ma-bu4","github.com/hi2ma-bu4/bio/","davidshimjs.github.io/qrcodejs/","badapple.stream/","www.google.com/teapot"],D=[e=>"https://"+b[Math.random()*b.length|0],e=>JSON.stringify({stopCode:e.stopCode,failedModule:e.failedModule,bucketId:e.bucketId,sessionId:e.sessionId,timestamp:e.timestamp}),e=>`STOPCODE:${e.stopCode};WHAT_FAILED:${e.failedModule};BUCKET:${e.bucketId};SESSION:${e.sessionId}`,e=>["WindowsStopDiagnostic",`Code=${e.stopCode}`,`Module=${e.failedModule}`,`FailureBucket=${e.bucketId}`,`Ticket=${e.sessionId}`,`Seed=${e.progressSeed}`].join(`
`)],$=`
.bsod-screen {
	position: fixed;
	inset: 0;
	z-index: 2147483647;
	display: flex;
	min-height: 100dvh;
	width: 100%;
	align-items: flex-start;
	justify-content: center;
	overflow-x: hidden;
	overflow-y: auto;
	background: #0078d7;
	color: #fff;
	font-family: "Segoe UI", "Yu Gothic UI", "Meiryo", sans-serif;
	-webkit-text-size-adjust: 100%;
	overscroll-behavior: contain;
}

.bsod-screen__content {
	box-sizing: border-box;
	display: flex;
	min-height: 100dvh;
	width: min(100%, 68rem);
	flex-direction: column;
	padding:
		max(1.5rem, env(safe-area-inset-top))
		clamp(1rem, 4vw, 4rem)
		max(2rem, env(safe-area-inset-bottom))
		max(1rem, env(safe-area-inset-left));
}

.bsod-screen__face {
	margin: 0 0 0.75rem;
	font-size: clamp(4.75rem, 14vw, 9rem);
	font-weight: 300;
	line-height: 1;
	letter-spacing: -0.08em;
}

.bsod-screen__lead {
	margin: 0;
	max-width: 38rem;
	font-size: clamp(1.25rem, 2.6vw, 2.15rem);
	line-height: 1.45;
}

.bsod-screen__progress {
	margin: clamp(1.75rem, 4vw, 2.5rem) 0 0;
	font-size: clamp(1.15rem, 2vw, 1.55rem);
	line-height: 1.4;
}

.bsod-screen__footer {
	margin-top: clamp(2.5rem, 8vh, 5rem);
	display: flex;
	flex-wrap: wrap;
	gap: 1.5rem 2rem;
	align-items: flex-start;
}

.bsod-screen__qr {
	flex: 0 0 auto;
	height: 8.75rem;
	width: 8.75rem;
	image-rendering: pixelated;
}

.bsod-screen__qr--fallback {
	background:
		linear-gradient(90deg, transparent 42%, #fff 42%, #fff 58%, transparent 58%),
		linear-gradient(transparent 42%, #fff 42%, #fff 58%, transparent 58%),
		repeating-linear-gradient(0deg, #fff 0 0.4rem, transparent 0.4rem 0.8rem),
		repeating-linear-gradient(90deg, #fff 0 0.4rem, transparent 0.4rem 0.8rem);
}

.bsod-screen__meta {
	max-width: 33rem;
	font-size: 0.95rem;
	line-height: 1.7;
}

.bsod-screen__meta p {
	margin: 0 0 0.45rem;
}

.bsod-screen__hint {
	margin-top: 1.2rem !important;
	opacity: 0.82;
}

@media (max-width: 640px) {
	.bsod-screen {
		align-items: stretch;
	}

	.bsod-screen__content {
		width: 100%;
		padding:
			max(1rem, env(safe-area-inset-top))
			max(1rem, env(safe-area-inset-right))
			max(1.5rem, env(safe-area-inset-bottom))
			max(1rem, env(safe-area-inset-left));
	}

	.bsod-screen__face {
		margin-bottom: 0.4rem;
		font-size: clamp(3.25rem, 18vw, 5.25rem);
	}

	.bsod-screen__lead {
		max-width: none;
		font-size: clamp(1rem, 4.8vw, 1.35rem);
		line-height: 1.38;
	}

	.bsod-screen__progress {
		margin-top: 1.1rem;
		font-size: clamp(1rem, 4.2vw, 1.2rem);
	}

	.bsod-screen__footer {
		margin-top: 1.5rem;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.9rem;
	}

	.bsod-screen__qr {
		height: 5.75rem;
		width: 5.75rem;
	}

	.bsod-screen__meta {
		max-width: none;
		font-size: 0.88rem;
		line-height: 1.52;
		word-break: break-word;
	}

	.bsod-screen__meta p {
		margin-bottom: 0.35rem;
	}

	.bsod-screen__hint {
		margin-top: 0.8rem !important;
		font-size: 0.82rem;
	}
}

@media (max-width: 380px) {
	.bsod-screen__content {
		padding-inline: max(0.85rem, env(safe-area-inset-left));
	}

	.bsod-screen__meta {
		font-size: 0.8rem;
		line-height: 1.45;
	}
}
`;let m=null;function i(e,t){return Math.floor(Math.random()*(t-e+1))+e}function g(e){return e[i(0,e.length-1)]}function B(){return typeof crypto<"u"&&typeof crypto.randomUUID=="function"?crypto.randomUUID().slice(0,8).toUpperCase():Math.random().toString(16).slice(2,10).toUpperCase()}function P(){if(document.getElementById(y))return;const e=document.createElement("style");e.id=y,e.textContent=$,document.head.appendChild(e)}class R{force;scenario;sessionId=B();timestamp=new Date().toISOString();progressSeed=i(1e3,9999);delayTimer=null;progressTimer=null;finishTimer=null;cleanupKeydown=null;overlay=null;progressLabel=null;destroyed=!1;didLockBodyScroll=!1;progress=0;constructor(t={}){this.force=t.force??!1,this.scenario=g(F)}start(){const t=this.force?L:i(C,x);this.delayTimer=window.setTimeout(()=>{this.delayTimer=null,this.show()},t)}destroy(){this.destroyed||(this.destroyed=!0,this.delayTimer!==null&&(window.clearTimeout(this.delayTimer),this.delayTimer=null),this.progressTimer!==null&&(window.clearTimeout(this.progressTimer),this.progressTimer=null),this.finishTimer!==null&&(window.clearTimeout(this.finishTimer),this.finishTimer=null),this.cleanupKeydown?.(),this.cleanupKeydown=null,this.overlay?.remove(),this.overlay=null,this.progressLabel=null,this.didLockBodyScroll&&(v(),this.didLockBodyScroll=!1))}async show(){if(this.destroyed||document.getElementById(h))return;P();const t=document.createElement("section");t.id=h,t.className="bsod-screen",t.setAttribute("role","dialog"),t.setAttribute("aria-modal","true"),t.setAttribute("aria-label","Blue screen simulation"),t.innerHTML=`
			<div class="bsod-screen__content">
				<p class="bsod-screen__face">:(</p>
				<p class="bsod-screen__lead">Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</p>
				<p class="bsod-screen__progress"><span data-bsod-progress>0</span>% complete</p>
				<div class="bsod-screen__footer">
					<canvas class="bsod-screen__qr" data-bsod-qr width="140" height="140"></canvas>
					<div class="bsod-screen__meta">
						<p>For more information about this issue and possible fixes, visit https://github.com/hi2ma-bu4/bio/issues</p>
						<p>If you call a support person, give them this info:</p>
						<p>Stop code: ${this.scenario.stopCode}</p>
						<p>What failed: ${this.scenario.failedModule}</p>
						<p>Failure bucket ID: ${this.scenario.bucketId}-${this.sessionId}</p>
						<p class="bsod-screen__hint">Press ESC to close this screen.</p>
					</div>
				</div>
			</div>
		`,document.body.appendChild(t),E(),this.didLockBodyScroll=!0,this.overlay=t,this.progressLabel=t.querySelector("[data-bsod-progress]"),this.cleanupKeydown=this.attachEscapeHandler();const o=t.querySelector("[data-bsod-qr]");o&&await this.renderQRCode(o),this.scheduleProgress()}attachEscapeHandler(){const t=o=>{o.key==="Escape"&&(o.preventDefault(),this.destroy())};return document.addEventListener("keydown",t,!0),()=>{document.removeEventListener("keydown",t,!0)}}async renderQRCode(t){const a=g(D)({...this.scenario,sessionId:this.sessionId,timestamp:this.timestamp,progressSeed:this.progressSeed});try{await w.toCanvas(t,a,{errorCorrectionLevel:"low",margin:1,width:140,color:{dark:"#FFFFFFFF",light:"#0078D700"}})}catch(s){console.warn("Failed to render BSOD QR code",s),t.replaceWith(this.createQRPlaceholder())}}createQRPlaceholder(){const t=document.createElement("div");return t.className="bsod-screen__qr bsod-screen__qr--fallback",t.setAttribute("aria-hidden","true"),t}scheduleProgress(){if(this.destroyed)return;const t=i(140,420);this.progressTimer=window.setTimeout(()=>{this.progressTimer=null,this.advanceProgress()},t)}advanceProgress(){if(this.destroyed)return;const t=this.progress<24?i(1,4):this.progress<72?i(1,3):i(1,2);if(this.progress=Math.min(100,this.progress+t),this.progressLabel&&(this.progressLabel.textContent=String(this.progress)),this.progress>=100){this.finishTimer=window.setTimeout(()=>{this.finishTimer=null,this.destroy()},700);return}this.scheduleProgress()}}function N(e={}){_(),m=new R(e),m.start()}function _(){m?.destroy(),m=null}const j=Object.freeze(Object.defineProperty({__proto__:null,startBsodEffect:N,stopBsodEffect:_},Symbol.toStringTag,{value:"Module"}));export{Y as a,S as b,K as c,q as d,j as e,p as g,z as i,E as l,v as u};
