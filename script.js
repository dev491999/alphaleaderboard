const firebaseConfig={
  apiKey:"YOUR_API_KEY",
  authDomain:"arena-stopwatch.firebaseapp.com",
  databaseURL:"https://arena-stopwatch-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:"arena-stopwatch"
};

firebase.initializeApp(firebaseConfig);
const db=firebase.database();

const podium=document.getElementById("podium");
const leaderboard=document.getElementById("leaderboard");
const podiumTitle=document.getElementById("podium-title");
const metaFinishers=document.getElementById("meta-finishers");
const metaUpdated=document.getElementById("meta-updated");

let PARTICIPANTS={},DATA=[],ACTIVE="M";

fetch("participants.json")
  .then(r=>r.json())
  .then(j=>PARTICIPANTS=j);

function fmt(ms){
  if (ms <= 0) return "DNF";
  const m = Math.floor(ms / 60000);
  const s = Math.floor(ms / 1000) % 60;
  const c = Math.floor(ms / 10) % 100;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}:${String(c).padStart(2,"0")}`;
}

function updateMeta(n){
  metaFinishers.textContent=`Finishers: ${n}`;
  metaUpdated.textContent=`Last update: ${new Date().toLocaleTimeString()}`;
}

function render(){
  const all = DATA.filter(x => PARTICIPANTS[x.bib]?.gender === ACTIVE);

    const finishers = all
  .filter(x => x.timeMs > 0)
  .sort((a,b)=>a.timeMs - b.timeMs);

    const dnfs = all.filter(x => x.timeMs <= 0);

    const list = [...finishers, ...dnfs];

  podium.innerHTML="";
  [1,0,2].forEach(i=>{
    const r=list[i];
    if(!r){podium.innerHTML+=`<div class="card"></div>`;return;}
    const p=PARTICIPANTS[r.bib]||{};
    podium.innerHTML+=`
      <div class="card ${i===0?"first":""}">
        <div class="pos">#${i+1}</div>
        <div class="name">${p.name||"Unknown"}</div>
        <div class="time">${fmt(r.timeMs)}</div>
      </div>`;
  });

  if(!list.length){
    leaderboard.innerHTML=`<div class="empty">No finishers yet.</div>`;
    updateMeta(0);
    return;
  }

  let h=`<table><thead><tr><th>Rank</th><th>Name</th><th>BIB</th><th>Time</th></tr></thead><tbody>`;
  list.forEach((r,i)=>{
    const p=PARTICIPANTS[r.bib]||{};
    h+=`<tr>
      <td class="rank">${i+1}</td>
      <td>${p.name}</td>
      <td class="bib">${r.bib}</td>
      <td class="time">${fmt(r.timeMs)}</td>
    </tr>`;
  });
  h+="</tbody></table>";
  leaderboard.innerHTML=h;

  updateMeta(list.length);
  podiumTitle.textContent=ACTIVE==="M"?"Top 3 – Men":"Top 3 – Women";
}

document.querySelectorAll(".tab").forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    ACTIVE=b.dataset.gender;
    render();
  };
});

db.ref("leaderboard").on("value",s=>{
  DATA=s.val()?Object.values(s.val()):[];
  render();
});
