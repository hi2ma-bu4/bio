import{O as i,M as s,l,a as o,b as r,c as n,d}from"./@tsparticles-CTsohXOu.js";const m=[`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
			<path fill="#E579A5" stroke="null" d="M461.38,349.439c-18.413-1.532-29.271,2.129-27.615,19.949c1.653,17.822,17.944,34.58,23.494,46.737
				c5.548,12.157,7.676,41.426-23.367,33.995c-31.043-7.428-164.501,38.943-262.862-66.648C55.813,259.791-14.913,91.606,2.671,61.979
				c8.515-14.35,228.643,12.236,314.085,40.676C434.439,141.826,477.889,260.68,505.638,321.46
				C533.387,382.242,461.38,349.439,461.38,349.439z"></path>
		</svg>`,`<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
			<path fill="#E579A5" stroke="null" d="M284.16,33.439C239.065,43.381,110.776,107.861,80.39,264.4
				C50.007,420.942,15.199,487.152,39.168,507.143c23.976,19.986,136.178-26.026,219.908-59.406
				c158.268-63.099,198.352-225.202,216.275-316.223c17.926-91.021-13.334-101.903-21.359-95.403
				c-8.021,6.496-65.623,27.021-56.269,10.285c9.354-16.738,17.631-47.258-0.437-46.377C379.219,0.903,284.16,33.439,284.16,33.439z"></path>
		</svg>`];function u(a){const e=m.map(t=>({src:"data:image/svg+xml;utf8,"+encodeURIComponent(t),width:16,height:16}));return{detectRetina:!0,fpsLimit:60,autoPlay:!0,particles:{number:{value:400,density:{enable:!0,width:1920,height:1080}},shape:{type:"image",options:{image:e}},size:{value:{min:3,max:10}},opacity:{value:{min:.4,max:.9}},move:{enable:!0,speed:{min:2,max:3},direction:s.bottomRight,straight:!1,outModes:{default:i.out},gravity:{enable:!1}},roll:{enable:!0,mode:"both",speed:{min:10,max:20},darken:{enable:!0,value:15}},wobble:{enable:!0,distance:30,speed:{min:5,max:10}},tilt:{enable:!0,direction:"random",value:{min:0,max:360},animation:{enable:!0,speed:10}}}}}async function p(a,e=!0){await l(a,!1),await o(a,!1),await r(a,!1),await n(a,!1),await d(a,!1),await a.addPreset("sakura",u(),!1),await a.refresh(e)}export{p as loadSakuraPreset};
