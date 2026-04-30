class h{buggyElements=[];interval=null;score=0;isActive=!1;styleElement=null;start(){if(this.isActive)return;console.log("Bug Hunt starting..."),this.isActive=!0,this.score=0;const t=document.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, a, button, img");console.log(`Found ${t.length} potential elements`),t.forEach(e=>{if(e instanceof HTMLElement){const n=(e.textContent||"").trim().length>0,s=e.tagName==="IMG";if(!n&&!s)return;const i=new Map;n&&this.collectTextNodes(e,i);const o=l=>this.repair(e,l);this.buggyElements.push({element:e,originalTextMap:i,originalStyle:{filter:e.style.filter,transform:e.style.transform,textShadow:e.style.textShadow,position:e.style.position,zIndex:e.style.zIndex},isBuggy:!1,repairHandler:o}),e.addEventListener("click",o)}}),this.injectStyles(),this.interval=window.setInterval(()=>this.spawnBug(),1500)}collectTextNodes(t,e){if(t.nodeType===Node.TEXT_NODE){const n=t.textContent?.trim();n&&n.length>0&&e.set(t,t.textContent||"")}else t.childNodes.forEach(n=>this.collectTextNodes(n,e))}injectStyles(){this.styleElement||(this.styleElement=document.createElement("style"),this.styleElement.id="bug-hunt-style",this.styleElement.textContent=`
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
		`,document.head.appendChild(this.styleElement))}spawnBug(){if(!this.isActive)return;const t=this.buggyElements.filter(n=>!n.isBuggy);if(console.log(`Spawning bug. Healthy elements: ${t.length}`),t.length===0)return;const e=Math.min(t.length,Math.floor(Math.random()*3)+1);for(let n=0;n<e;n++){const s=Math.floor(Math.random()*t.length),i=t.splice(s,1)[0];if(!i)continue;i.isBuggy=!0;const o=i.element,l=Math.random();o.tagName==="IMG"?o.style.filter=`hue-rotate(${Math.random()*360}deg) invert(1) blur(2px)`:(l>.5&&o.classList.add("buggy-chromatic"),i.originalTextMap.forEach((a,c)=>{c.textContent=this.scramble(a)})),o.classList.add("buggy-glitch"),o.style.transform=`skew(${Math.random()*10-5}deg) scale(${1+Math.random()*.1})`}}scramble(t){const e=`!@#$%^&*()_+-=[]{}|;':",./<>?0123456789`;return t.split("").map(n=>Math.random()>.6?e[Math.floor(Math.random()*e.length)]:n).join("")}repair(t,e){const n=this.buggyElements.find(s=>s.element===t);n&&n.isBuggy&&(e.preventDefault(),e.stopPropagation(),this.restoreElement(n),this.score+=10,this.score>=100&&this.showVictory())}restoreElement(t){t.isBuggy=!1;const e=t.element;e.classList.remove("buggy-glitch","buggy-chromatic"),e.style.filter=t.originalStyle.filter,e.style.transform=t.originalStyle.transform,e.style.textShadow=t.originalStyle.textShadow,e.style.position=t.originalStyle.position,e.style.zIndex=t.originalStyle.zIndex,t.originalTextMap.forEach((n,s)=>{s.textContent=n})}showVictory(){this.stop();const t=document.createElement("div");t.style.cssText=`
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: #000;
			color: #0f0;
			padding: 20px;
			border: 2px solid #0f0;
			font-family: monospace;
			z-index: 10000;
			box-shadow: 0 0 20px #0f0;
			min-width: 300px;
		`;const e=["> INITIALIZING SYSTEM SCAN...","> BUGS DETECTED: 0","> OPTIMIZING ASSETS...","> CACHE PURGED.","> PERFORMANCE: 100%","> STATUS: SYSTEM PROTECTED","","[ THANK YOU FOR TESTING ]"];document.body.appendChild(t);let n=0;const s=()=>{if(n<e.length){const i=document.createElement("div");i.textContent=e[n],t.appendChild(i),n++,setTimeout(s,200)}else setTimeout(()=>{t.style.transition="opacity 1s ease",t.style.opacity="0",setTimeout(()=>t.remove(),1e3)},3e3)};s()}stop(){this.isActive=!1,this.interval&&clearInterval(this.interval),this.interval=null,this.buggyElements.forEach(t=>{t.element.removeEventListener("click",t.repairHandler),this.restoreElement(t)}),this.buggyElements=[],this.styleElement?.remove(),this.styleElement=null}}const r=new h,g=()=>r.start(),u=()=>r.stop();export{r as bugHunt,g as startBugHunt,u as stopBugHunt};
