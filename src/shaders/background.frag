precision mediump float;
    uniform vec2 resolution; uniform float time; uniform float scroll;
    uniform float speed; uniform float scrollSpeed; uniform float flamingoStrength; uniform float intensity;
    uniform float warp; uniform float contrast; uniform float kuwaharaStrength; uniform float kuwaharaRadius;
    uniform vec3 deep; uniform vec3 violet; uniform vec3 cyan; uniform vec3 flamingo;
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
    float noise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y); }
    float fbm(vec2 p){ float value=0.; float amplitude=.5; for(int i=0;i<3;i++){ value+=amplitude*noise(p); p=p*2.02+vec2(17.1,9.2); amplitude*=.5; } return value; }
    float kuwahara(vec2 p){
      float bestMean=0.; float bestVariance=999.;
      for(int region=0;region<4;region++){
        float sx=(region==1||region==3)?1.:-1.;
        float sy=(region>=2)?1.:-1.;
        vec2 c=p+vec2(sx,sy)*kuwaharaRadius;
        float a=noise(c+vec2(sx,0.)*kuwaharaRadius*.5);
        float b=noise(c+vec2(0.,sy)*kuwaharaRadius*.5);
        float d=noise(c+vec2(sx,sy)*kuwaharaRadius*.5);
        float mean=(a+b+d)/3.;
        float variance=(a-mean)*(a-mean)+(b-mean)*(b-mean)+(d-mean)*(d-mean);
        if(variance<bestVariance){bestVariance=variance;bestMean=mean;}
      }
      return bestMean;
    }
    vec3 palette(float t, float scrollAmount){ t=clamp(t,0.,1.); vec3 c=mix(deep,violet,smoothstep(0.,.38,t)); c=mix(c,cyan,smoothstep(.28,.72,t)); float pink=smoothstep(.08,.92,scrollAmount)*flamingoStrength; return mix(c,flamingo,pink); }
    void main(){
      vec2 uv=(gl_FragCoord.xy-.5*resolution.xy)/min(resolution.x,resolution.y); float t=time*speed+scroll*scrollSpeed;

      float domeRadius=length(uv*.92);
      float domeDepth=sqrt(max(0.0,1.0-domeRadius*domeRadius));
      float domeEdge=smoothstep(.42,1.02,domeRadius);
      vec2 domeUv=uv*(1.0+.24*domeEdge);
      domeUv+=normalize(uv+vec2(.0001))*(1.0-domeDepth)*.045;
      vec2 p=domeUv+vec2(sin(scroll*3.2)*.12,scroll*.22);

      vec2 q=vec2(fbm(p*1.8+t*.18),fbm(p*1.8+vec2(4.2,1.7)-t*.14)); p+= (q-.5)*warp;
      float field=fbm(p*2.25+vec2(t*.35,-t*.22)); float flow=fbm(p*4.0+q*2.4-vec2(t*.5,-t*.32));
      float radius=length(p); float angle=atan(p.y,p.x); float rings=sin(radius*17.0-flow*3.5-t*2.2+sin(angle*5.0+t)*.55)*.5+.5;
      float rawCloud=field*.72+flow*.28;
      float paintedCloud=kuwahara(p*2.15+vec2(t*.08,-t*.06));
      float cloudField=mix(rawCloud,paintedCloud,kuwaharaStrength);
      float fluffyCloud=smoothstep(.28,.72,cloudField);
      float filament=smoothstep(.72,.98,fbm(p*3.5+vec2(sin(t),cos(t)))); float signal=clamp(mix(cloudField,fluffyCloud,.62)+rings*.08+filament*.08,0.,1.);
      float glow=exp(-radius*1.8)*.22; vec3 color=palette(signal+glow,scroll); color*=1.-smoothstep(.62,1.12,radius)*.32; color*=mix(1.04,.70,smoothstep(.58,1.04,domeRadius)); color=pow(max(color,0.),vec3(1.0/contrast));

      float pigmentShape=noise(p*6.0+vec2(t*.14,-t*.10));
      float pigmentWobble=(pigmentShape-.5)*.005;
      float lineA=1.0-step(.004,abs(signal-(.19+pigmentWobble)));
      float lineB=1.0-step(.004,abs(signal-(.50+pigmentWobble)));
      float lineMask=clamp(lineA+lineB,0.0,1.0);
      float lineColorNoise=noise(p*100.0+vec2(t*.35,-t*.25));
      vec3 outlineColor=mix(vec3(.28,.88,.98),vec3(1.0,.46,.78),lineColorNoise);
      color=mix(color,outlineColor,lineMask);
      float cyanHalo=exp(-length(p-vec2(.52,.08))*3.4);
      float pinkHalo=exp(-length(p-vec2(-.38,-.28))*3.0)*smoothstep(.08,.82,scroll);
      float arc=exp(-abs(sin(radius*8.0-angle*2.0-t*.18))*9.0);
      color+=cyan*cyanHalo*.14;
      color+=flamingo*pinkHalo*.12;
      color+=mix(cyan,flamingo,smoothstep(.18,.82,scroll))*arc*.025;
      float innerRim=exp(-abs(domeRadius-.82)*26.0);
      color+=mix(cyan,flamingo,smoothstep(.22,.82,scroll))*innerRim*.085;
      float rayNoise=noise(vec2(angle*7.0+t*.08,radius*4.0-t*.06));
      float rayPattern=pow(max(0.0,sin(angle*24.0+rayNoise*1.4)),18.0);
      float rays=rayPattern*smoothstep(.52,.86,domeRadius)*(1.0-smoothstep(.86,1.02,domeRadius));
      color+=mix(cyan,flamingo,smoothstep(.18,.82,scroll))*rays*.075;

      float fireProgress=smoothstep(.08,.78,scroll);
      float fireTop=mix(-.46,.34,fireProgress);
      float fireRise=smoothstep(-.48,fireTop,uv.y)*(1.0-smoothstep(fireTop-.08,fireTop+.03,uv.y));
      float fireT=clamp((uv.y+.46)/max(fireTop+.46,.01),0.,1.);
      vec3 backgroundColor=color;
      float fireNoise=fbm(vec2(uv.x*4.2,uv.y*3.1-t*.42)+vec2(0.,fireProgress*.35));
      float fireDetail=fbm(vec2(uv.x*8.0,uv.y*5.4-t*.68));
      float fireWobble=(noise(vec2(uv.x*7.0+t*.12,uv.y*3.6-t*.55))-.5)*.11*(.35+.65*fireT);
      float fireWidth=mix(.30,.055,fireT)+fireWobble;
      float fireBody=1.0-smoothstep(fireWidth,fireWidth+.075,abs(uv.x+.12+fireWobble*.45));
      float fireTongues=smoothstep(.30,.76,fireNoise);
      float fireTips=smoothstep(.50,.88,fireDetail)*smoothstep(.08,.82,fireT);
      float fireMask=fireRise*fireBody*mix(.48,1.0,fireTongues)*mix(.72,1.0,fireTips*.65)*fireProgress;
      vec3 fireColor=mix(violet,flamingo,smoothstep(.12,.72,fireT));
      fireColor=mix(fireColor,cyan,smoothstep(.72,1.0,fireT)*.35);
      float fireGlow=exp(-abs(uv.x+.12)*5.0)*fireRise*fireProgress;
      color=mix(backgroundColor,fireColor,fireMask*.42)+fireColor*fireMask*.25+fireColor*fireGlow*.12;

      float alpha=clamp(mix(.38,.68,lineMask)+fireMask*.46,.0,1.); gl_FragColor=vec4(max(color,0.)*intensity,alpha);
    }
