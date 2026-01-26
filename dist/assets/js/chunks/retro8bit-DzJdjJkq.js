let d=null,s=new Map;function b(){const c="no-retro";let i=document.getElementById("retro8bit-style");i||(i=document.createElement("style"),i.id="retro8bit-style",i.innerHTML=`
            body {
                background-color: #000000 !important;
            }
            body, body *:not(.${c}) {
                font-family: 'EnkaDotGothic24', 'Courier New', Courier, 'ＭＳ ゴシック', 'MS UI Gothic	', monospace !important;
                color: #00FF00 !important;
                text-shadow:
                    1px 1px #008000,
                    -1px -1px #008000,
                    1px -1px #008000,
                    -1px 1px #008000 !important;
            }
        `,document.head.appendChild(i));function h(t){if(t.classList.contains(c))return;const r=window.getComputedStyle(t);r.borderStyle!=="none"&&r.borderWidth!=="0px"&&(t.style.borderColor="#00FF00"),r.backgroundColor!=="rgba(0, 0, 0, 0)"&&r.backgroundColor!=="transparent"&&(t.style.backgroundColor="#000000")}function u(t){if(t.classList.contains(c))return;const r=()=>{if(!t.parentNode||t.naturalWidth===0||t.naturalHeight===0)return;const o=Math.max(1,Math.floor(t.width/4)),n=Math.max(1,Math.floor(t.height/4)),e=document.createElement("canvas"),l=e.getContext("2d");if(!l)return;e.width=o,e.height=n,l.imageSmoothingEnabled=!1,l.drawImage(t,0,0,o,n),e.style.width=t.width+"px",e.style.height=t.height+"px",Array.from(t.attributes).forEach(m=>e.setAttribute(m.name,m.value)),t.parentNode.replaceChild(e,t);const a=document.createElement("canvas");a.width=e.width,a.height=e.height;const p=a.getContext("2d");p&&(p.drawImage(e,0,0,a.width,a.height),l.drawImage(a,0,0,e.width,e.height),s.delete(t))};if(t.complete)r();else{const o=()=>r();t.addEventListener("load",o),s.set(t,o)}}document.querySelectorAll("body *").forEach(t=>h(t)),document.querySelectorAll("img").forEach(t=>u(t)),d=new MutationObserver(t=>{t.forEach(r=>{r.addedNodes.forEach(o=>{o instanceof HTMLElement&&(h(o),o instanceof HTMLImageElement&&u(o),o.querySelectorAll("*").forEach(n=>{h(n),n instanceof HTMLImageElement&&u(n)}))})})}),d.observe(document.body,{childList:!0,subtree:!0})}function E(){d&&(d.disconnect(),d=null),s.forEach((f,c)=>{c.removeEventListener("load",f)}),s.clear()}export{E as destroyRetro8bit,b as startRetro8bit};
