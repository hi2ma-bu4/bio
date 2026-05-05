class r{mirrorMode=!1;style=null;constructor(){this.init()}init(){this.style||(this.style=document.createElement("style"),this.style.id="mirror-style",this.style.innerHTML=`
                body.mirror-mode {
                    transform: scaleX(-1);
                    direction: rtl;
                    transition: transform 0.2s ease;
                }
                body.mirror-mode dialog {
                    transform: scaleX(-1);
                }
            `,document.head.appendChild(this.style))}toggle(){this.mirrorMode=!this.mirrorMode,document.body.classList.toggle("mirror-mode",this.mirrorMode)}destroy(){this.style?.parentNode&&(this.style.parentNode.removeChild(this.style),this.style=null),document.body.classList.remove("mirror-mode"),this.mirrorMode=!1}}export{r as MirrorMode};
//# sourceMappingURL=mirror-6QUT6_Q8.js.map
