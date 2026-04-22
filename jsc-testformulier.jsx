import { useState, useMemo, useCallback, useRef, useEffect } from "react";

/* ═══════════════════════════════════════════
   EXERCISE DATABASE (from .doc)
   Format: [nr, name, category, muscle]
   ═══════════════════════════════════════════ */
const RAW = [
[1,"leg extension life","benen","quadriceps"],[2,"leg extension rom","benen","quadriceps"],[3,"seated leg curl","benen","hamstrings"],[4,"stand. leg curlhams","benen","hamstrings"],[5,"leg press nautilus","benen","quadriceps, glut. max."],[6,"squat: losse halter","benen","glut. max., quadriceps, hamstrings"],[7,"squat: rek","benen","zie 6"],[8,"horiz. press 135°","benen","quadriceps, glut. max, glut min."],[9,"prone leg curl nt","benen","hamstrings"],[10,"hip abduction nt","benen","glut. piriformis, abturator externus"],[11,"seated calf naut.","benen","soleus, gastrocnemius"],[12,"hip adduction nt","benen","Gracilis"],[13,"uitvalpas voor","benen","quadriceps, gluteus max, hamstrings"],[14,"uitvalpas achter","benen","quadriceps"],[15,"hamstring/bil","benen","hamstrings, glut. max"],[16,"standing gluteus","benen/bil","gluteus"],[17,"kleine bil","bil","glut. min."],[18,"abductie buiten","benen","gluteus max., tractus iliotibialis"],[19,"adductie binnen","benen","tensor fascae latae, gluteus medius"],[20,"knie-inzet/psoas","benen",""],[21,"kuit","benen","gastrocnemius, soleus"],[22,"sitting calf","benen","soleus"],[23,"scheenbeen s.calf","benen",""],[24,"high pull","schouder",""],[25,"voorslaan","schouder",""],[26,"lift press dumb.","benen",""],[27,"lift press barb.","benen",""],[28,"4-way neck vw. nt","schouder",""],[29,"kuit dumbell","benen",""],[30,"triceps ext. naut.","armen",""],[31,"10° chest nautilus","borst",""],[32,"incl. press wijd nt","borst",""],[33,"lateral raise nt","schouder",""],[34,"weight ass. dip. nt","armen",""],[35,"lower back naut.","rug","erector spinae"],[36,"abdom. cruch rom","buik","rectus abdominis"],[37,"abdominal nautilus","buik","rectus abdominis"],[38,"weight ass. chin. nt","rug",""],[39,"crunch rev ab. tr","buik",""],[40,"buik schuin: bank","buik","transversus abdominis"],[41,"sicilian crunch","buik",""],[42,"side ab crunch l/r","buik",""],[43,"basic ab crunch","buik","rectus abdominis"],[44,"lower back bench","rug","erector spinae"],[45,"lower back rom","rug","erector spinae"],[46,"buik recht crunch","buik","rectus abdominis"],[47,"lower ab crunch","buik","pyramidalis"],[48,"rotary torso","buik","transversus abdominis"],[49,"side bent dumbell","buik",""],[50,"cable crunch","buik","rectus abdominis"],[51,"arm curl","armen","biceps brachii"],[52,"preacher curl nt","armen","biceps brachii"],[53,"cencentration curl","armen",""],[54,"seated curl nt","armen","biceps brachii"],[55,"one arm rowing","armen","biceps brachii, trap. serr."],[56,"hammer curl","armen","biceps brachii, brachioradialis, radialis"],[57,"triceps press","armen","triceps brachii"],[58,"triceps press nt","armen","triceps brachii"],[59,"french press","armen",""],[60,"triceps kick-back","armen","triceps brachii"],[61,"triceps ext. naut","armen",""],[62,"seated abductor","armen",""],[63,"seaterd adductor","armen",""],[64,"dippiing easy p.st.","armen",""],[65,"chinning easy p. st","rug",""],[66,"alternating curl","armen",""],[67,"triceps push down","armen","triceps brachii"],[68,"chest press wijd","borst","pectoralis major, triceps brachi, deltoid"],[69,"fly/ pectoral","borst","pectoralis major,"],[70,"chest press small","borst","pectoralis minor, deltoid, triceps br."],[71,"bankdrukken","borst","pectoralis major, deltoid, triceps br."],[72,"bankdrukken smal","borst","pectoralis minor, deltoid, triceps br."],[73,"schuin bankdrukken","borst","pectoralis major"],[74,"pulse pully front","rug",""],[75,"fly dumbell press","schouder",""],[76,"dumbell fly","borst","pectoralis major"],[77,"dumbell fly incline","borst","pectoralis minor"],[78,"pullover dumbell","rug",""],[79,"vert. chest wijd nt","borst","onderkant bost, triceps, deltoid."],[80,"pullover: incline","rug","trapezius, rhomboideus, pectoralis maj"],[81,"pullover cable","rug","trapezius, rhomboideus, pectoralis maj"],[82,"pullover","rug","trapezius, rhomboideus, pectoralis maj"],[83,"cross bench pullover","rug",""],[84,"pull down sm.","rug",""],[85,"vert. traction wd.","rug",""],[87,"up-rowing","schouder","deltoideus, triceps, trapezius"],[88,"bent-over rowing","rug","trapezius, rhomboideus, erector spin."],[89,"side raises","schouder","deltoid lateral, trapezius, infraspinatus,"],[90,"low row/pulley","rug","erector spinae,"],[91,"lat machine voor","rug","trapezius, rhomboideus, deltoideus"],[93,"row small/deltoid","rug","rhomboideus, trap. biceps, deltoid."],[94,"rowing/deltoid wijd","rug","rhomb. trap. biceps, deltoid."],[95,"shoulder press sm.","schouder","deltoid anterior, triceps, trap. serratus."],[96,"shoulder press wb.","schouder","deltoid anterior, triceps, trap. serratus"],[97,"dumbell press","borst","pectoralis"],[98,"dumb. press schuin","borst","pectoralis"],[99,"front raises","schouder","deltoid anterior, pect maj. trap, serr."],[100,"front raises duim b.","schouder","deltoid anterior, pect maj. trap. serr"],[101,"reverse crunch","buik",""],[102,"side bent cable","buik","transversus abdominis"],[103,"buik sch. 2-banken","buik","transversus abd."],[104,"onderbuik incl.","buik","pyramidalis"],[105,"crunch decline","buik",""],[106,"abdominal life","buik","rectus abdominis"],[107,"torso rotation l/r","rug",""],[108,"abdominal hammerst","buik","rectus abdominis"],[109,"crunch incline-1","benen",""],[110,"buik sch. klem-grd","buik","transversus abd."],[111,"buik schuin incl. 1","buik","transversus abd."],[112,"buik schuin incl. 2","buik","transversus abd."],[113,"buik schuin decl. 2","buik",""],[114,"vert. chest smal nt","borst",""],[115,"shoulder dumb. pres","schouder","deltoid anterior, triceps, trap. serr."],[116,"anteversie elast.","benen",""],[117,"retroversie elast.","benen",""],[118,"abductie elastiek","benen",""],[119,"adductie elastiek","benen",""],[120,"knieinzet elastiek","benen",""],[121,"incl. press sml nt","borst",""],[122,"4-way neck aw nt","schouder",""],[123,"horiz. press 110°","benen","quadriceps, glut. max"],[124,"horiz. press 160°","benen","quadriceps, glut. max"],[125,"leg ext. rom 1-been","benen","quadriceps"],[126,"4-way neck zw. nt","schouder",""],[127,"kuit op horiz. press","benen","soleus, gastrocnemius"],[128,"uitvalspas acht. rek","benen","quadriceps, glut. max, hamstrings"],[129,"straight arm pudn.","rug","trap, erector spin. deltoid."],[130,"incl. pulley breed","rug",""],[131,"incl. pulley smal","rug",""],[132,"pulley mach. breed","rug",""],[133,"bent. over barb. row","rug","erector spin. rhomb. trap, triceps"],[134,"one arm cable row","rug",""],[135,"reverse triceps pd","armen","triceps brachii"],[136,"high tr. ext. erco.","armen","triceps brachii"],[137,"pul over reverse","schouder",""],[138,"bankdrukken rek","borst","pectoralis, triceps, deltoid."],[139,"front press rek","schouder",""],[140,"schuin bankdr. rek","borst","pectoralis, triceps deltoid"],[141,"smal bankdr. rek","borst","mediaal pectoralis, triceps, deltoid"],[142,"shoulder press rek","schouder","deltoid anterior, triceps, trap. serr."],[143,"up-rowing rek voor","schouder","deltoid, triceps, trap."],[144,"side raises staan","schouder","deltoid lateral, trapezius, infraspinatus"],[145,"up-rowing rek achter","schouder",""],[146,"bent ov. side raise","rug","Deltoidp posterior, trap, teres maj,"],[147,"bent over fly","rug","erector spinae, biceps brachii"],[148,"arm curl cable","armen","biceps brachii"],[149,"arm curl cable reverse","armen","biceps brachii"],[150,"preacher curl o.a.","armen","brachialis, bicepsbrachi,brachioradialis"],[151,"barbell curl","armen","biceps brachi, brachialis, brachiradialis"],[152,"barbell curl reverse","armen","biceps brachi, brachialis, brachiradialis"],[153,"one arm cable curl","armen","biceps brachii"],[154,"one arm triceps pd","armen","triceps brachii"],[155,"military press staan","schouder",""],[156,"e.z. barbell curl","armen","biceps brachii"],[157,"21-curl","armen","biceps brachi, brachialis, brachiradialis"],[158,"leg extension","benen","quadriceps"],[159,"triceps neck","armen",""],[160,"add. bal zijlig","benen",""],[161,"lift press steun","benen",""],[162,"bil op leg press","benen",""],[163,"m. soleus rel-lig","benen","soleus"],[164,"m. gastroc. rek-lig","benen","gastrocnemius"],[165,"gluteus op heuptr.","benen","glut. max"],[166,"side bent op lbb","buik",""],[167,"pullover alternat.","rug",""],[168,"rotary torso nt","rug",""],[169,"glut. hiel gr. st. sc.","benen",""],[170,"glut. kuit gr. st. sc.","benen",""],[171,"up-rowing barbell","schouder",""],[172,"dead-lift bent leg","benen/rug","quadriceps, erector spinae"],[173,"stiff leg deadlift","benen/rug","quadriceps, erector spinae,"],[174,"step-ups stepvar.","benen","quadriceps"],[175,"step-ups plant fl.","benen","tibialis anterior"],[176,"step-ups knieinz.","benen",""],[177,"military press var","schouder",""],[178,"onderbeen, plan+dor","benen","tibialis anterior, ext. dig. lon.,"],[179,"rope pushdown","armen","triceps brachii"],[180,"schouder draai","schouder",""],[181,"torso rotation","buik","transversus abd."],[182,"reverse row sport","rug",""],[183,"gr. base high pull","rug",""],[184,"kniebuigen 1-been","benen",""],[185,"horz. press 1-been","benen","quadriceps, glut. max."],[186,"hack sqaut h. press","benen",""],[187,"shrugs","schouder","trapezius,"],[188,"retrov. cable erco.","benen",""],[189,"abd. cable erco.","benen",""],[190,"add. cable erco.","benen",""],[191,"antev. calble erco.","benen",""],[192,"retrov. buiklig elastiek","benen",""],[193,"hor. leg press bal","benen","quadriceps, rectus abdom."],[194,"shrugs high pull","rug",""],[195,"gr. base high pull","rug",""],[196,"soleus muur kn. 90°","benen","soleus"],[197,"side raises zijlig","schouder",""],[198,"exorot. cable erco.","schouder",""],[199,"endorot. cable erco","schouder",""],[200,"s.raises cbl erco","schouder",""],[264,"roeien","benen/rug","W.U. erector spinae, quadriceps"],[275,"crostrainer","bene/armen","W.U. quadriceps, delt., biceps, triceps"],[291,"steppen","benen","W.U. soleus, gastr. quadriceps"],[322,"climbing","benen",""],[332,"exorotatie dumb.","schouder",""],[333,"knieoptr. rek schn.","buik","transversus abd."],[334,"anteversie cable","benen",""],[335,"retroversie cable","benen",""],[336,"knieinzet cable","benen",""],[337,"gluteus staan cable","benen","gluteus max."],[338,"service imitatie","schouder",""],[339,"knieoptrek rek","buik","rectus abdominis"],[340,"arnold press","schouder","deltoid ant. triceps, trap. serr."],[341,"knieoptr. rek schn.","buik",""],[342,"later. box shuffle","benen",""],[343,"front box jumps","benen",""],[344,"adductor","benen",""],[345,"barbell complex","benen",""],[346,"wisselsprongen","benen",""],[347,"skipping stop","benen",""],[348,"abductor","benen",""],[350,"depressie tr. press","schouder",""],[351,"squat l.h. 1-been","benen",""],[352,"easy rider","rug",""],[353,"uitvp. step + elastiek","benen",""],[354,"uitvp. step1+ elastiek","benen",""],[355,"uitvp. step2+ elastiek","benen",""],[356,"uitvp. step3+ elastiek","benen",""],[357,"rugstrekken grond","rug","erector spinae"],[358,"squat armen n. voor","benen",""],[359,"step-up var. + matje","benen",""],[360,"pully row+ draai sn","rug",""],[361,"semi crunch+extens","buik",""],[362,"semi cru.+ext. + dw","buik",""],[363,"semi cru. + ext. + sr.","buik",""],[364,"hstr. bil=bal. sec.","benen","hamstrings"],[365,"balans extens. bal","rug",""],[366,"step-up pl. flx+ mat","benen",""],[367,"ham/bil bal 1-been","benen",""],[368,"forward ball rolls","buik","rectus abdominis"],[369,"semi crunch ball","buik","rectus abdominis"],[370,"hstr/bil. bal herh","benen",""],[371,"butt. blast. bl. 1b","benen",""],[372,"alt. superman ball","buik",""],[373,"lower back reverse","buik",""],[374,"adductor bal","benen",""],[375,"abd. standing glut.","buik",""],[376,"reverse crunch ball","buik",""],[377,"woodchop op erco","buik",""],[378,"h. squat h. press 1b","schouder",""],[379,"rev. crunch dec-2","buik",""],[380,"seated posture bal","rug",""],[381,"vertical row l/r","rug","erector spinae, latiss. rhomb."],[382,"adductie arm erco","rug",""],[383,"lat pulldown l/r","rug","latissimus dorsi, erec. spin. deltoideus, rhomb. triceps"],[384,"back ext. + draai","rug","erector spinae"],[385,"leg ext. zit elast","benen","quadriceps,"],[386,"around the world","borst",""],[387,"chinning schouders","rug",""],[388,"leg press disc 1-b","benen",""],[389,"triceps p. dwn l/r","armen","triceps"],[390,"adductie elastiek","buik",""],[391,"abductie elastiek","borst",""],[392,"incline side raise","schouder","deltoid, trap, serr."],[393,"cable front raises","armen",""],[394,"protractie","armen",""],[395,"retractie","armen",""],[396,"semi-crunch incl. 2","armen",""],[397,"trampoline-hup 1=b","benen",""],[398,"st. bradford press","schouder",""],[399,"lying cable curl","armen","biceps brachii"],[400,"decl. french press","armen",""],[401,"lying cable curl","armen","biceps brachii"],[402,"abductie","armen",""],[406,"lat pulldown","rug","latissimus dorsi, erec. spin. deltoideus, rhomb. triceps"]
];

const EXERCISES_DB = RAW.map(([nr,name,cat,muscle]) => ({nr,name,category:cat,muscle}));
const CATEGORIES = [...new Set(EXERCISES_DB.map(e=>e.category))].filter(Boolean).sort();

/* ═══════════════════════════════════════════
   1RM & METHODE TABLES
   ═══════════════════════════════════════════ */
const RM_TABLE = {1:1,2:.95,3:.9,4:.9,5:.85,6:.8,7:.775,8:.75,9:.725,10:.7,11:.675,12:.65,13:.6333,14:.6167,15:.6,16:.5833,17:.5667,18:.55,19:.525,20:.5,21:.45,22:.45,23:.45,24:.45,25:.45,26:.4,27:.4,28:.4,29:.4,30:.4,31:.35,32:.35,33:.35,34:.35,35:.35,36:.35,37:.35,38:.35,39:.35,40:.3,41:.3,42:.3,43:.3,44:.3,45:.3,46:.3,47:.3,48:.3,49:.3,50:.3};

const METHODE = {
  "1-sterk":[[0,"18x55%"],[.51,"18x50%"]],"1-zwak":[[0,"18x55%"],[.06,"20x50%"],[.13,"20x45%"],[.26,"20x40%"]],
  "2-sterk":[[0,"15x60%"],[.51,"15x55%"]],"2-zwak":[[0,"15x60%"],[.06,"18x55%"],[.13,"18x50%"],[.26,"18x45%"]],
  "3-sterk":[[0,"12x65%"],[.51,"12x60%"]],"3-zwak":[[0,"12x65%"],[.06,"15x60%"],[.13,"15x55%"],[.26,"15x50%"],[.51,"15x45%"]],
  "4-sterk":[[0,"10x70%"],[.51,"15x55%"]],"4-zwak":[[0,"10x70%"],[.06,"12x65%"],[.13,"12x60%"],[.26,"12x55%"],[.51,"18x45%"]],
  "5-sterk":[[0,"8x75%"],[.06,"12x65%"],[.51,null]],"5-zwak":[[0,"8x75%"],[.06,"15x60%"],[.13,"15x55%"],[.51,null]],
  "6-sterk":[[0,"vermogen"],[.06,"10x70%"],[.26,null]],"6-zwak":[[0,"vermogen"],[.06,"12x65%"],[.13,"12x60%"],[.26,null]],
};
const SETS_S = {1:"2X",2:"3X",3:"3X",4:"4X",5:"4X",6:"4X"};
const SETS_Z = {1:"3X",2:"4X",3:"4X",4:"5X",5:"5X",6:"5X"};

function get1RM(hh,kg){if(!hh||!kg)return null;return kg/(RM_TABLE[Math.min(Math.max(Math.round(hh),1),50)]||.3)}
function getVerschil(a,b){if(a==null||b==null)return null;const m=Math.max(a,b);return m===0?0:Math.abs(a-b)/m}
function getMethode(f,z,v){const t=METHODE[`${f}-${z}`];if(!t)return null;let r=t[0][1];for(const[th,m]of t)if(v>=th)r=m;return r}
function parseM(m){if(!m||m==="vermogen"||m==="-")return null;const x=m.match(/(\d+)x(\d+)%/);return x?{hh:+x[1],pct:+x[2]/100}:null}
function fmt(n,d=2){if(n==null||isNaN(n))return"";return n.toFixed(d).replace(".",",")}

/* ═══════════════════════════════════════════
   COLORS
   ═══════════════════════════════════════════ */
const C = {
  bg:"#0b1120",surface:"#111827",border:"#1e293b",
  accent:"#f59e0b",accentDark:"#78350f",
  green:"#10b981",red:"#ef4444",yellow:"#eab308",blue:"#3b82f6",
  text:"#f1f5f9",dim:"#94a3b8",muted:"#64748b",
  input:"#1e293b",inputBdr:"#334155",
};
const CAT_CLR = {benen:"#3b82f6",armen:"#ef4444",borst:"#f59e0b",rug:"#10b981",buik:"#8b5cf6",schouder:"#ec4899",bil:"#f97316","benen/rug":"#06b6d4","benen/bil":"#14b8a6","bene/armen":"#6366f1",bost:"#f59e0b"};
const SLOT_CLR = ["#eab308","#eab308","#3b82f6","#3b82f6","#10b981","#10b981","#ef4444","#ef4444","#6b7280","#6b7280","#6b7280","","","#eab308","#eab308"];

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function App() {
  const [screen, setScreen] = useState("setup");
  const [naam, setNaam] = useState("");
  const [datum, setDatum] = useState(new Date().toISOString().slice(0,10));
  const [fase, setFase] = useState(2);
  const [vetpct, setVetpct] = useState("");
  const [slots, setSlots] = useState(() => Array.from({length:15},(_,i)=>({
    id:i+1, exercise:null, hhL:"",kgL:"",hhR:"",kgR:"",wattL:"",wattR:"",
    note:"", type:"normal", hasRight: [0,2,3,6,7,8,10,13,14].includes(i),
  })));
  const [pickerOpen, setPickerOpen] = useState(null);
  // User-overridable methode values (null = use auto-calculated)
  const [ovSterkHH, setOvSterkHH] = useState("");
  const [ovSterkPct, setOvSterkPct] = useState("");
  const [ovSterkSets, setOvSterkSets] = useState("");
  const [ovZwakHH, setOvZwakHH] = useState("");
  const [ovZwakPct, setOvZwakPct] = useState("");
  const [ovZwakSets, setOvZwakSets] = useState("");
  const [ovPauzeSterk, setOvPauzeSterk] = useState("");
  const [ovPauzeZwak, setOvPauzeZwak] = useState("");

  const upSlot = useCallback((id,f,v)=>setSlots(p=>p.map(s=>s.id===id?{...s,[f]:v}:s)),[]);

  const results = useMemo(()=>{
    const comp = slots.map(s=>{
      const hL=parseFloat(s.hhL)||0, kL=parseFloat(s.kgL)||0;
      const hR=parseFloat(s.hhR)||0, kR=parseFloat(s.kgR)||0;
      const r1L=(hL&&kL)?get1RM(hL,kL):null, r1R=(hR&&kR)?get1RM(hR,kR):null;
      const v=getVerschil(r1L,r1R);
      return{...s,hhLn:hL,kgLn:kL,hhRn:hR,kgRn:kR,r1L,r1R,verschil:v};
    });
    const sig=comp.filter(e=>e.verschil!=null&&e.verschil>.05).map(e=>e.verschil);
    const avg=sig.length?sig.reduce((a,b)=>a+b,0)/sig.length:0;
    // Auto-calculated methode from table
    const autoSM=getMethode(fase,"sterk",avg), autoZM=getMethode(fase,"zwak",avg);
    // If user has overrides, build methode string from them; otherwise use auto
    const sM = (ovSterkHH && ovSterkPct) ? `${ovSterkHH}x${ovSterkPct}%` : autoSM;
    const zM = (ovZwakHH && ovZwakPct) ? `${ovZwakHH}x${ovZwakPct}%` : autoZM;
    const sP=parseM(sM), zP=parseM(zM);
    // Sets: override or default
    const setsS = ovSterkSets || SETS_S[fase];
    const setsZ = ovZwakSets || SETS_Z[fase];

    const withTrain=comp.map(ex=>{
      if(!ex.exercise)return{...ex,tL:null,tR:null};
      const lStrong=ex.r1L!=null&&ex.r1R!=null?ex.r1L>=ex.r1R:ex.r1L!=null;
      let tL=null,tR=null;
      if(ex.r1L!=null){const m=lStrong?sP:zP,ms=lStrong?sM:zM,se=lStrong?setsS:setsZ;
        if(m)tL={hh:m.hh,kg:m.pct*ex.r1L,ms,se,unit:ex.type==="keer"?"keer":ex.type==="graden"?"graden":null};}
      if(ex.r1R!=null){const rS=ex.r1L!=null?ex.r1R>ex.r1L:true;
        const m=rS?sP:zP,ms=rS?sM:zM,se=rS?setsS:setsZ;
        if(m)tR={hh:m.hh,kg:m.pct*ex.r1R,ms,se,unit:ex.type==="keer"?"keer":ex.type==="graden"?"graden":null};}
      return{...ex,tL,tR};
    });
    return{exercises:withTrain,avg,sM,zM,setsS,setsZ,autoSM,autoZM};
  },[slots,fase,ovSterkHH,ovSterkPct,ovSterkSets,ovZwakHH,ovZwakPct,ovZwakSets]);

  if(pickerOpen!=null)return <ExercisePicker slotId={pickerOpen}
    onSelect={(ex)=>{upSlot(pickerOpen,"exercise",ex);setPickerOpen(null)}}
    onClose={()=>setPickerOpen(null)} />;

  if(screen==="setup")return <Setup {...{naam,setNaam,datum,setDatum,fase,setFase,vetpct,setVetpct}} onNext={()=>setScreen("input")}/>;
  if(screen==="input")return <Input slots={slots} upSlot={upSlot} openPicker={setPickerOpen}
    onBack={()=>setScreen("setup")} onResults={()=>setScreen("results")} />;
  return <Results naam={naam} datum={datum} fase={fase} vetpct={vetpct} results={results} onBack={()=>setScreen("input")}
    ov={{ovSterkHH,setOvSterkHH,ovSterkPct,setOvSterkPct,ovSterkSets,setOvSterkSets,
         ovZwakHH,setOvZwakHH,ovZwakPct,setOvZwakPct,ovZwakSets,setOvZwakSets,
         ovPauzeSterk,setOvPauzeSterk,ovPauzeZwak,setOvPauzeZwak}} />;
}

/* ═══════════════════════════════════════════
   EXERCISE PICKER
   ═══════════════════════════════════════════ */
function ExercisePicker({slotId, onSelect, onClose}){
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const inputRef = useRef();
  useEffect(()=>{setTimeout(()=>inputRef.current?.focus(),100)},[]);

  const filtered = useMemo(()=>{
    let list = EXERCISES_DB;
    if(cat!=="all") list = list.filter(e=>e.category===cat);
    if(q.trim()){
      const terms = q.toLowerCase().split(/\s+/);
      list = list.filter(e=>{
        const hay = `${e.nr} ${e.name} ${e.category} ${e.muscle}`.toLowerCase();
        return terms.every(t=>hay.includes(t));
      });
    }
    return list.slice(0,60);
  },[q,cat]);

  return(
    <div style={{...S.container,padding:0}}>
      <div style={{position:"sticky",top:0,zIndex:10,background:C.bg,padding:"12px 12px 0",borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <button onClick={onClose} style={{...S.backBtn,fontSize:20,padding:"2px 6px"}}>✕</button>
          <div style={{flex:1,position:"relative"}}>
            <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
              placeholder="Zoek op naam, nr of spiergroep..."
              style={{...S.input,paddingLeft:14,margin:0,fontSize:15,borderRadius:12}} />
          </div>
        </div>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:10,msOverflowStyle:"none",scrollbarWidth:"none"}}>
          <Pill label="Alles" active={cat==="all"} onClick={()=>setCat("all")} color={C.accent}/>
          {CATEGORIES.map(c=><Pill key={c} label={c} active={cat===c} onClick={()=>setCat(c)} color={CAT_CLR[c]||C.dim}/>)}
        </div>
      </div>
      <div style={{padding:"4px 12px 40px"}}>
        {filtered.length===0 && <div style={{textAlign:"center",padding:40,color:C.muted,fontSize:14}}>Geen oefeningen gevonden</div>}
        {filtered.map(ex=>(
          <button key={`${ex.nr}-${ex.name}`} onClick={()=>onSelect(ex)}
            style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"11px 8px",
              background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,cursor:"pointer",textAlign:"left"}}>
            <span style={{minWidth:38,height:28,borderRadius:8,background:CAT_CLR[ex.category]||C.input,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"#fff",
              fontFamily:"monospace"}}>{ex.nr}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:600,color:C.text,fontFamily:"'DM Sans',sans-serif",
                textTransform:"capitalize",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ex.name}</div>
              <div style={{fontSize:11,color:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {ex.category}{ex.muscle?` · ${ex.muscle}`:""}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Pill({label,active,onClick,color}){
  return <button onClick={onClick} style={{
    padding:"5px 14px",borderRadius:20,border:`1.5px solid ${active?color:C.border}`,
    background:active?color+"20":"transparent",color:active?color:C.dim,
    fontSize:12,fontWeight:600,whiteSpace:"nowrap",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",
    textTransform:"capitalize",flexShrink:0,
  }}>{label}</button>;
}

/* ═══════════════════════════════════════════
   SETUP SCREEN
   ═══════════════════════════════════════════ */
function Setup({naam,setNaam,datum,setDatum,fase,setFase,vetpct,setVetpct,onNext}){
  return(
    <div style={S.container}>
      <div style={{textAlign:"center",padding:"40px 0 24px"}}>
        <div style={{fontSize:38,fontWeight:900,color:C.accent,letterSpacing:-1.5,fontFamily:"'DM Sans',sans-serif"}}>JSC</div>
        <div style={{fontSize:16,color:C.text,fontWeight:600,fontFamily:"'DM Sans',sans-serif",marginTop:-2}}>Toptraining</div>
        <div style={{fontSize:12,color:C.muted,marginTop:6}}>Testformulier & Schema Generator</div>
      </div>
      <div style={S.card}>
        <Lab>Naam</Lab>
        <input style={S.input} value={naam} onChange={e=>setNaam(e.target.value)} placeholder="Naam sporter"/>
        <Lab>Datum</Lab>
        <input style={S.input} type="date" value={datum} onChange={e=>setDatum(e.target.value)}/>
        <Lab>Fase</Lab>
        <div style={{display:"flex",gap:6}}>
          {[1,2,3,4,5,6].map(f=><button key={f} onClick={()=>setFase(f)}
            style={{...S.faseBtn,...(fase===f?S.faseBtnA:{})}}>{f}</button>)}
        </div>
        <Lab>Vetpercentage</Lab>
        <input style={S.input} value={vetpct} onChange={e=>setVetpct(e.target.value)} placeholder="Optioneel"/>
      </div>
      <button style={S.primary} onClick={onNext}>Oefeningen invullen →</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   INPUT SCREEN
   ═══════════════════════════════════════════ */
function Input({slots,upSlot,openPicker,onBack,onResults}){
  const filled=slots.filter(s=>s.exercise&&(s.hhL||s.kgL)).length;
  const [open,setOpen]=useState(null);
  return(
    <div style={S.container}>
      <div style={{...S.topBar,position:"sticky",top:0,background:C.bg,zIndex:10}}>
        <button style={S.backBtn} onClick={onBack}>← Terug</button>
        <span style={{flex:1,fontSize:17,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>Testresultaten</span>
        <span style={{background:C.accentDark,color:C.accent,padding:"2px 10px",borderRadius:10,fontSize:13,fontWeight:700}}>{filled}</span>
      </div>
      <div style={{paddingBottom:100}}>
        {slots.map((s,i)=><SlotCard key={s.id} slot={s} idx={i} isOpen={open===s.id}
          onToggle={()=>setOpen(open===s.id?null:s.id)} upSlot={upSlot} openPicker={()=>openPicker(s.id)} />)}
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 16px",
        paddingBottom:"max(12px,env(safe-area-inset-bottom))",
        background:`linear-gradient(transparent,${C.bg} 30%)`,zIndex:10}}>
        <button style={S.primary} onClick={onResults}>Schema bekijken →</button>
      </div>
    </div>
  );
}

function SlotCard({slot:s,idx,isOpen,onToggle,upSlot,openPicker}){
  const hasData=s.hhL||s.kgL||s.hhR||s.kgR;
  const clr=SLOT_CLR[idx]||"transparent";
  return(
    <div style={{background:C.surface,borderRadius:12,marginBottom:8,border:`1px solid ${isOpen?C.accent:C.border}`,
      borderLeft:`4px solid ${clr}`,overflow:"hidden",...(isOpen?{background:"#131c2e"}:{})}}>
      <div onClick={onToggle} style={{display:"flex",alignItems:"center",padding:"12px 14px",cursor:"pointer",gap:8}}>
        <span style={{width:24,height:24,borderRadius:7,background:s.exercise?CAT_CLR[s.exercise.category]||C.input:C.input,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:11,fontWeight:700,color:"#fff",flexShrink:0,fontFamily:"monospace"}}>{s.exercise?s.exercise.nr:s.id}</span>
        <span style={{flex:1,fontSize:14,fontWeight:600,color:s.exercise?C.text:C.muted,fontFamily:"'DM Sans',sans-serif",
          textTransform:"capitalize",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
          {s.exercise?s.exercise.name:"Tik om oefening te kiezen"}</span>
        {hasData&&<span style={{color:C.green,fontSize:13,fontWeight:700}}>✓</span>}
        <span style={{color:C.muted,fontSize:14}}>{isOpen?"▲":"▼"}</span>
      </div>
      {isOpen&&(
        <div style={{padding:"0 14px 14px"}}>
          <button onClick={openPicker} style={{width:"100%",padding:"10px 12px",background:C.input,
            border:`1.5px dashed ${C.accent}55`,borderRadius:10,color:C.accent,fontSize:13,fontWeight:600,
            cursor:"pointer",marginBottom:10,fontFamily:"'DM Sans',sans-serif",textAlign:"left",textTransform:"capitalize"}}>
            {s.exercise?`🔄 ${s.exercise.nr}. ${s.exercise.name}`:"🔍 Oefening selecteren..."}
          </button>

          {s.exercise&&<div style={{fontSize:11,color:C.muted,marginBottom:8}}>
            {s.exercise.category}{s.exercise.muscle?` · ${s.exercise.muscle}`:""}</div>}

          <MiniField label="Notitie" value={s.note} onChange={v=>upSlot(s.id,"note",v)} placeholder="bijv. Breed, st 7, +6kg"/>

          <div style={{display:"flex",gap:5,margin:"10px 0",flexWrap:"wrap"}}>
            {["normal","keer","keiser","graden"].map(t=>
              <TBtn key={t} active={s.type===t} onClick={()=>upSlot(s.id,"type",t)}>{t}</TBtn>)}
            <TBtn active={s.hasRight} onClick={()=>upSlot(s.id,"hasRight",!s.hasRight)}
              clr={C.blue}>R: {s.hasRight?"Ja":"Nee"}</TBtn>
          </div>

          <Side color="#60a5fa" label="Links"/>
          <div style={{display:"flex",gap:8,marginBottom:4}}>
            <Num label="HH" value={s.hhL} onChange={v=>upSlot(s.id,"hhL",v)}/>
            <Num label={s.type==="graden"?"Graden":"KG"} value={s.kgL} onChange={v=>upSlot(s.id,"kgL",v)}/>
            {s.type==="keiser"&&<Num label="Watt" value={s.wattL} onChange={v=>upSlot(s.id,"wattL",v)}/>}
          </div>

          {s.hasRight&&<>
            <Side color="#f87171" label="Rechts"/>
            <div style={{display:"flex",gap:8}}>
              <Num label="HH" value={s.hhR} onChange={v=>upSlot(s.id,"hhR",v)}/>
              <Num label={s.type==="graden"?"Graden":"KG"} value={s.kgR} onChange={v=>upSlot(s.id,"kgR",v)}/>
              {s.type==="keiser"&&<Num label="Watt" value={s.wattR} onChange={v=>upSlot(s.id,"wattR",v)}/>}
            </div>
          </>}
        </div>
      )}
    </div>
  );
}

function Side({color,label}){return <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,color:C.dim,margin:"10px 0 5px"}}>
  <div style={{width:8,height:8,borderRadius:4,background:color}}/>{label}</div>}

function Num({label,value,onChange}){return <div style={{flex:1}}>
  <div style={{fontSize:10,color:C.muted,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>{label}</div>
  <input type="number" inputMode="decimal" value={value} onChange={e=>onChange(e.target.value)} placeholder="—"
    style={{width:"100%",padding:"10px 4px",background:C.input,border:`1px solid ${C.inputBdr}`,borderRadius:8,
      color:C.text,fontSize:18,fontWeight:600,textAlign:"center",outline:"none",boxSizing:"border-box",
      fontFamily:"'DM Sans',sans-serif"}}/></div>}

function MiniField({label,value,onChange,placeholder}){return <div>
  <div style={{fontSize:10,color:C.muted,marginBottom:3,textTransform:"uppercase",fontWeight:600}}>{label}</div>
  <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={{width:"100%",padding:"8px 10px",background:C.input,border:`1px solid ${C.inputBdr}`,borderRadius:8,
      color:C.text,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"}}/></div>}

function TBtn({active,onClick,children,clr=C.accent}){return <button onClick={onClick}
  style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${active?clr:C.inputBdr}`,
    background:active?clr+"22":"transparent",color:active?clr:C.muted,
    fontSize:11,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>{children}</button>}

/* ═══════════════════════════════════════════
   RESULTS SCREEN
   ═══════════════════════════════════════════ */
function Results({naam,datum,fase,vetpct,results,onBack,ov}){
  const{exercises,avg,sM,zM,setsS,setsZ,autoSM,autoZM}=results;
  const fd=d=>{if(!d)return"";const p=d.split("-");return`${p[2]}-${p[1]}-${p[0]}`};
  const autoSP=parseM(autoSM), autoZP=parseM(autoZM);
  const isSterkOverridden = ov.ovSterkHH || ov.ovSterkPct || ov.ovSterkSets;
  const isZwakOverridden = ov.ovZwakHH || ov.ovZwakPct || ov.ovZwakSets;

  return(
    <div style={S.container}>
      <div style={{...S.topBar,position:"sticky",top:0,background:C.bg,zIndex:10}}>
        <button style={S.backBtn} onClick={onBack}>← Aanpassen</button>
        <span style={{flex:1,fontSize:17,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>Schema</span>
      </div>
      {/* Header info */}
      <div style={{...S.card,marginTop:4}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"'DM Sans',sans-serif"}}>{naam||"—"}</div>
            <div style={{fontSize:13,color:C.dim,marginTop:2}}>{fd(datum)}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{color:C.muted,fontSize:11}}>Fase</div>
            <div style={{color:C.accent,fontWeight:900,fontSize:28,lineHeight:1,fontFamily:"'DM Sans',sans-serif"}}>{fase}</div>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginTop:14,flexWrap:"wrap"}}>
          <Ch label="Gem. verschil" value={`${Math.round(avg*100)}%`} vc={avg>.1?C.yellow:C.green}/>
          {vetpct&&<Ch label="Vetpct" value={`${vetpct}%`}/>}
        </div>
      </div>

      {/* Editable Methode card */}
      <div style={{...S.card,padding:16}}>
        <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>
          Methode keuze
        </div>

        {/* STERK */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <div style={{width:8,height:8,borderRadius:4,background:C.green}}/>
            <span style={{fontSize:12,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:.5}}>Sterk</span>
            {isSterkOverridden&&<span style={{fontSize:10,color:C.accent,marginLeft:"auto"}}>aangepast</span>}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
            <div style={{flex:1}}>
              <div style={S.miniLab}>HH</div>
              <input type="number" inputMode="numeric" value={ov.ovSterkHH}
                onChange={e=>ov.setOvSterkHH(e.target.value)}
                placeholder={autoSP?String(autoSP.hh):"—"}
                style={S.methInput}/>
            </div>
            <div style={{color:C.muted,fontSize:16,paddingBottom:10}}>×</div>
            <div style={{flex:1}}>
              <div style={S.miniLab}>%</div>
              <input type="number" inputMode="numeric" value={ov.ovSterkPct}
                onChange={e=>ov.setOvSterkPct(e.target.value)}
                placeholder={autoSP?String(Math.round(autoSP.pct*100)):"—"}
                style={S.methInput}/>
            </div>
            <div style={{flex:1}}>
              <div style={S.miniLab}>Sets</div>
              <input type="number" inputMode="numeric" value={ov.ovSterkSets.replace(/\D/g,"")}
                onChange={e=>ov.setOvSterkSets(e.target.value?e.target.value+"X":"")}
                placeholder={SETS_S[fase]?.replace("X","")}
                style={S.methInput}/>
            </div>
            <div style={{flex:1}}>
              <div style={S.miniLab}>Pauze</div>
              <input type="number" inputMode="numeric" value={ov.ovPauzeSterk}
                onChange={e=>ov.setOvPauzeSterk(e.target.value)}
                placeholder="60"
                style={S.methInput}/>
            </div>
          </div>
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>
            Actief: <span style={{color:C.text,fontWeight:600}}>{sM||"—"}</span> · <span style={{color:C.text,fontWeight:600}}>{setsS}</span> · <span style={{color:C.text}}>{ov.ovPauzeSterk||"60"}s pauze</span>
          </div>
        </div>

        {/* ZWAK */}
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <div style={{width:8,height:8,borderRadius:4,background:C.yellow}}/>
            <span style={{fontSize:12,fontWeight:700,color:C.yellow,textTransform:"uppercase",letterSpacing:.5}}>Zwak</span>
            {isZwakOverridden&&<span style={{fontSize:10,color:C.accent,marginLeft:"auto"}}>aangepast</span>}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"flex-end"}}>
            <div style={{flex:1}}>
              <div style={S.miniLab}>HH</div>
              <input type="number" inputMode="numeric" value={ov.ovZwakHH}
                onChange={e=>ov.setOvZwakHH(e.target.value)}
                placeholder={autoZP?String(autoZP.hh):"—"}
                style={S.methInput}/>
            </div>
            <div style={{color:C.muted,fontSize:16,paddingBottom:10}}>×</div>
            <div style={{flex:1}}>
              <div style={S.miniLab}>%</div>
              <input type="number" inputMode="numeric" value={ov.ovZwakPct}
                onChange={e=>ov.setOvZwakPct(e.target.value)}
                placeholder={autoZP?String(Math.round(autoZP.pct*100)):"—"}
                style={S.methInput}/>
            </div>
            <div style={{flex:1}}>
              <div style={S.miniLab}>Sets</div>
              <input type="number" inputMode="numeric" value={ov.ovZwakSets.replace(/\D/g,"")}
                onChange={e=>ov.setOvZwakSets(e.target.value?e.target.value+"X":"")}
                placeholder={SETS_Z[fase]?.replace("X","")}
                style={S.methInput}/>
            </div>
            <div style={{flex:1}}>
              <div style={S.miniLab}>Pauze</div>
              <input type="number" inputMode="numeric" value={ov.ovPauzeZwak}
                onChange={e=>ov.setOvPauzeZwak(e.target.value)}
                placeholder="60"
                style={S.methInput}/>
            </div>
          </div>
          <div style={{fontSize:11,color:C.muted,marginTop:4}}>
            Actief: <span style={{color:C.text,fontWeight:600}}>{zM||"—"}</span> · <span style={{color:C.text,fontWeight:600}}>{setsZ}</span> · <span style={{color:C.text}}>{ov.ovPauzeZwak||"60"}s pauze</span>
          </div>
        </div>
      </div>

      {/* Exercise results */}
      <div style={{paddingBottom:32}}>
        {exercises.filter(e=>e.exercise).map((ex,i)=><RCard key={ex.id} ex={ex} idx={i}/>)}
      </div>
    </div>
  );
}

function Ch({label,value,vc=C.text}){return <div style={{display:"flex",flexDirection:"column",gap:2,
  background:C.input,padding:"6px 12px",borderRadius:10,fontSize:13}}>
  <span style={{color:C.muted,fontSize:11}}>{label}</span>
  <span style={{color:vc,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{value}</span></div>}

function RCard({ex,idx}){
  const clr=SLOT_CLR[idx]||"transparent";
  const vp=ex.verschil!=null?Math.round(ex.verschil*100):null;
  const hi=vp!=null&&vp>5;
  return(
    <div style={{background:C.surface,borderRadius:12,padding:14,marginBottom:8,border:`1px solid ${C.border}`,borderLeft:`4px solid ${clr}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,minWidth:0,flex:1}}>
          <span style={{width:24,height:24,borderRadius:7,background:CAT_CLR[ex.exercise?.category]||C.input,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",
            flexShrink:0,fontFamily:"monospace"}}>{ex.exercise?.nr}</span>
          <span style={{color:C.text,fontWeight:600,fontSize:14,fontFamily:"'DM Sans',sans-serif",
            textTransform:"capitalize",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{ex.exercise?.name}</span>
        </div>
        {vp!=null&&<span style={{background:hi?"#422006":"#052e16",color:hi?C.yellow:C.green,
          padding:"2px 10px",borderRadius:12,fontSize:13,fontWeight:700,flexShrink:0,marginLeft:8}}>{vp}%</span>}
      </div>
      <div style={{borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`}}>
        <div style={{display:"flex",padding:"5px 8px",background:C.bg}}>
          <div style={{width:55}}/><div style={S.colH}>HH</div><div style={S.colH}>KG</div><div style={S.colH}>1RM</div>
        </div>
        {(ex.hhLn||ex.kgLn)?<RRow l="Test L" c="#60a5fa" h={ex.hhLn} k={ex.kgLn} r={ex.r1L}/>:null}
        {ex.hasRight&&(ex.hhRn||ex.kgRn)?<RRow l="Test R" c="#f87171" h={ex.hhRn} k={ex.kgRn} r={ex.r1R}/>:null}
        {ex.tL&&<TrRow l="Train L" c="#93c5fd" t={ex.tL} ex={ex}/>}
        {ex.tR&&<TrRow l="Train R" c="#fca5a5" t={ex.tR} ex={ex}/>}
      </div>
      {ex.note&&<div style={{fontSize:11,color:C.muted,marginTop:6,fontStyle:"italic"}}>{ex.note}</div>}
    </div>
  );
}

function RRow({l,c,h,k,r}){return <div style={{display:"flex",padding:"7px 8px",alignItems:"center"}}>
  <div style={{width:55,fontSize:11,fontWeight:600,color:c,flexShrink:0}}>{l}</div>
  <div style={S.cell}>{h||"—"}</div><div style={S.cell}>{k||"—"}</div>
  <div style={{...S.cell,color:C.accent}}>{fmt(r)}</div></div>}

function TrRow({l,c,t,ex}){return <div style={{display:"flex",padding:"7px 8px",alignItems:"center",
  background:"#0c1425",borderTop:`1px solid ${C.border}`}}>
  <div style={{width:55,fontSize:11,fontWeight:600,color:c,flexShrink:0}}>{l}</div>
  <div style={S.cell}>{t.unit?t.se?.replace("X","x"):t.hh}</div>
  <div style={S.cell}>{fmt(t.kg,1)}</div>
  <div style={{...S.cell,fontSize:10,color:C.muted}}>{t.unit||""}</div></div>}

function Lab({children}){return <div style={{fontSize:12,fontWeight:600,color:C.dim,marginBottom:6,marginTop:16,
  textTransform:"uppercase",letterSpacing:.5}}>{children}</div>}

/* ═══════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════ */
const S = {
  container:{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans',-apple-system,sans-serif",maxWidth:480,margin:"0 auto",padding:"0 12px"},
  card:{background:C.surface,borderRadius:16,padding:20,marginBottom:16,border:`1px solid ${C.border}`},
  input:{width:"100%",padding:"12px 14px",background:C.input,border:`1px solid ${C.inputBdr}`,borderRadius:10,
    color:C.text,fontSize:15,outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"},
  faseBtn:{flex:1,padding:"10px 0",background:C.input,border:`1px solid ${C.inputBdr}`,borderRadius:10,
    color:C.dim,fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  faseBtnA:{background:C.accentDark,borderColor:C.accent,color:C.accent},
  primary:{width:"100%",padding:"16px",background:`linear-gradient(135deg,${C.accent},#d97706)`,border:"none",
    borderRadius:14,color:"#000",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  topBar:{display:"flex",alignItems:"center",padding:"14px 0 8px",gap:12},
  backBtn:{background:"none",border:"none",color:C.accent,fontSize:14,fontWeight:600,cursor:"pointer",
    padding:0,fontFamily:"'DM Sans',sans-serif"},
  colH:{flex:1,textAlign:"center",fontSize:10,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:.5},
  cell:{flex:1,textAlign:"center",fontSize:14,fontWeight:600,color:C.text,fontFamily:"'DM Sans',sans-serif"},
  methInput:{width:"100%",padding:"9px 4px",background:C.input,border:`1px solid ${C.inputBdr}`,borderRadius:8,
    color:C.text,fontSize:16,fontWeight:600,textAlign:"center",outline:"none",boxSizing:"border-box",
    fontFamily:"'DM Sans',sans-serif"},
  miniLab:{fontSize:10,color:C.muted,marginBottom:3,textTransform:"uppercase",fontWeight:600,textAlign:"center"},
};
