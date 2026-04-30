class c{buggyElements=[];interval=null;score=0;isActive=!1;styleElement=null;start(){if(this.isActive)return;this.isActive=!0,this.score=0,document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, a, button, img").forEach(t=>{if(t instanceof HTMLElement){const s=(t.textContent||"").trim().length>0,n=t.tagName==="IMG";if(!s&&!n)return;const o=new Map;s&&this.collectTextNodes(t,o);const i=l=>this.repair(t,l);this.buggyElements.push({element:t,originalTextMap:o,originalStyle:{filter:t.style.filter,transform:t.style.transform,textShadow:t.style.textShadow,position:t.style.position,zIndex:t.style.zIndex},isBuggy:!1,repairHandler:i}),t.addEventListener("click",i)}}),this.injectStyles(),this.interval=window.setInterval(()=>this.spawnBug(),1500)}collectTextNodes(e,t){if(e.nodeType===Node.TEXT_NODE){const s=e.textContent?.trim();s&&s.length>0&&t.set(e,e.textContent||"")}else e.childNodes.forEach(s=>this.collectTextNodes(s,t))}injectStyles(){this.styleElement||(this.styleElement=document.createElement("style"),this.styleElement.id="bug-hunt-style",this.styleElement.textContent=`
			@keyframes glitch-jitter {
				0% { transform: translate(0); }
				20% { transform: translate(-2px, 2px); }
				40% { transform: translate(-2px, -2px); }
				60% { transform: translate(2px, 2px); }
				80% { transform: translate(2px, -2px); }
				100% { transform: translate(0); }
			}
			.buggy-glitch {
				animation: glitch-jitter 0.15s infinite;
				position: relative;
				z-index: 9999;
				cursor: pointer !important;
				outline: 2px solid rgba(255, 0, 0, 0.5);
			}
			.buggy-chromatic {
				text-shadow: 2px 0 #ff0000, -2px 0 #00ffff !important;
			}
		`,document.head.appendChild(this.styleElement))}spawnBug(){if(!this.isActive)return;const e=this.buggyElements.filter(s=>!s.isBuggy);if(e.length===0)return;const t=Math.min(e.length,Math.floor(Math.random()*3)+1);for(let s=0;s<t;s++){const n=Math.floor(Math.random()*e.length),o=e.splice(n,1)[0];if(!o)continue;o.isBuggy=!0;const i=o.element,l=Math.random();i.tagName==="IMG"?i.style.filter=`hue-rotate(${Math.random()*360}deg) invert(1) blur(2px)`:(l>.5&&i.classList.add("buggy-chromatic"),o.originalTextMap.forEach((a,h)=>{h.textContent=this.scramble(a)})),i.classList.add("buggy-glitch"),i.style.transform=`skew(${Math.random()*10-5}deg) scale(${1+Math.random()*.1})`}}scramble(e){const t=`!@#$%^&*()_+-=[]{}|;':",./<>?0123456789`;return e.split("").map(s=>Math.random()>.6?t[Math.floor(Math.random()*t.length)]:s).join("")}repair(e,t){const s=this.buggyElements.find(n=>n.element===e);s&&s.isBuggy&&(t.preventDefault(),t.stopPropagation(),this.restoreElement(s),this.score+=10,this.score>=100&&this.showVictory())}restoreElement(e){e.isBuggy=!1;const t=e.element;t.classList.remove("buggy-glitch","buggy-chromatic"),t.style.filter=e.originalStyle.filter,t.style.transform=e.originalStyle.transform,t.style.textShadow=e.originalStyle.textShadow,t.style.position=e.originalStyle.position,t.style.zIndex=e.originalStyle.zIndex,e.originalTextMap.forEach((s,n)=>{n.textContent=s})}showVictory(){const e=this.buggyElements.length;this.stop();const t=document.createElement("div");t.style.cssText=`
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: #000;
			color: #0f0;
			padding: 20px;
			font-family: monospace;
			z-index: 10000;
			box-shadow: 0 0 20px #0f0;
			min-width: 300px;
		`;const s=["> INITIALIZING SYSTEM SCAN...",`> BUGS DETECTED: ${e}`,"> OPTIMIZING ASSETS...","> CACHE PURGED.","> PERFORMANCE: 100%",`> SCORE: ${this.score}`,"> STATUS: SYSTEM PROTECTED","","[ THANK YOU FOR TESTING ]"];document.body.appendChild(t);let n=0;const o=()=>{if(n<s.length){const i=document.createElement("div");i.textContent=s[n],t.appendChild(i),n++,setTimeout(o,200)}else setTimeout(()=>{t.style.transition="opacity 1s ease",t.style.opacity="0",setTimeout(()=>t.remove(),1e3)},3e3)};o()}stop(){this.isActive=!1,this.interval&&clearInterval(this.interval),this.interval=null,this.buggyElements.forEach(e=>{e.element.removeEventListener("click",e.repairHandler),this.restoreElement(e)}),this.buggyElements=[],this.styleElement?.remove(),this.styleElement=null}}const r=new c,g=()=>r.start(),f=()=>r.stop();export{r as bugHunt,g as startBugHunt,f as stopBugHunt};
