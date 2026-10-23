const $ = (id) => document.getElementById(id);
const KEY_NEWS = "jkArchiv.news.v1";
const KEY_PHOTOS = "jkArchiv.photos.v1";
const DEMO_PASS = "archiv32"; // Demo only: not secure authentication.
let news = load(KEY_NEWS, [
 {id:crypto.randomUUID(),title:"档案示例：基米希赛后采访",date:"2026-10-21",category:"新闻",source:"示例条目（请替换）",language:"德语",url:"",body:"这里是演示用的占位条目。请添加原文链接、德语原文和自己的中文翻译。此条目并非真实报道。",tags:["采访","示例"],rights:"演示内容"}
]);
let photos = load(KEY_PHOTOS, []);
let localUnlocked = false;

function load(key, fallback){try{const v=JSON.parse(localStorage.getItem(key));return Array.isArray(v)?v:fallback}catch{return fallback}}
function save(){localStorage.setItem(KEY_NEWS,JSON.stringify(news));localStorage.setItem(KEY_PHOTOS,JSON.stringify(photos));render()}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function fmtDate(d){if(!d)return "日期未记";return d}
function yearOf(d){return d&&d.slice(0,4)}
function showArchive(){ $("loginScreen").hidden=true;$("archiveApp").hidden=false;localUnlocked=true;render() }
function lockArchive(){ $("loginScreen").hidden=false;$("archiveApp").hidden=true;localUnlocked=false;$("passcode").value="" }
$("today").textContent=new Intl.DateTimeFormat("zh-CN",{year:"numeric",month:"long",day:"numeric"}).format(new Date());
$("loginBtn").addEventListener("click",()=>{if($("passcode").value===DEMO_PASS){$("loginMessage").textContent="已进入本地演示档案。";showArchive()}else{$("loginMessage").textContent="口令不正确，请再试一次。"}});
$("passcode").addEventListener("keydown",e=>{if(e.key==="Enter")$("loginBtn").click()});
$("lockBtn").addEventListener("click",lockArchive);
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.close).close()));
$("closeDetail").addEventListener("click",()=>$("detailDialog").close());
$("addNewsBtn").addEventListener("click",()=>openNews());
$("addPhotoBtn").addEventListener("click",()=>openPhoto());
document.querySelectorAll("[data-add-category]").forEach(b=>b.addEventListener("click",()=>openNews({category:b.dataset.addCategory})));
$("searchInput").addEventListener("input",render);
$("categoryFilter").addEventListener("change",render);
$("yearFilter").addEventListener("change",render);

function openNews(item=null){
 $("newsForm").reset();$("newsId").value=item?.id||"";$("newsTitle").value=item?.title||"";$("newsDate").value=item?.date||new Date().toISOString().slice(0,10);
 $("newsCategory").value=item?.category||"采访";$("newsSource").value=item?.source||"";$("newsLanguage").value=item?.language||"德语";
 $("newsUrl").value=item?.url||"";$("newsVideoUrl").value=item?.videoUrl||"";$("newsBody").value=item?.body||"";$("newsTags").value=(item?.tags||[]).join(", ");$("newsRights").value=item?.rights||"";
 $("newsDialog").showModal();
}
$("newsForm").addEventListener("submit",e=>{e.preventDefault();const id=$("newsId").value||crypto.randomUUID();const item={id,title:$("newsTitle").value.trim(),date:$("newsDate").value,category:$("newsCategory").value,source:$("newsSource").value.trim(),language:$("newsLanguage").value,url:$("newsUrl").value.trim(),videoUrl:$("newsVideoUrl").value.trim(),body:$("newsBody").value.trim(),tags:$("newsTags").value.split(",").map(x=>x.trim()).filter(Boolean),rights:$("newsRights").value.trim()};const idx=news.findIndex(x=>x.id===id);if(idx>=0)news[idx]=item;else news.unshift(item);$("newsDialog").close();save()});
function openPhoto(item=null){
 $("photoForm").reset();$("photoId").value=item?.id||"";$("photoTitle").value=item?.title||"";$("photoDate").value=item?.date||new Date().toISOString().slice(0,10);
 $("photoSource").value=item?.source||"";$("photoUrl").value=item?.url||"";$("photoImageUrl").value=item?.imageUrl||"";$("photoRights").value=item?.rights||"";$("photoNotes").value=item?.notes||"";$("photoFile").value="";
 $("photoDialog").showModal();
}
$("photoForm").addEventListener("submit",async e=>{e.preventDefault();const id=$("photoId").value||crypto.randomUUID();const old=photos.find(x=>x.id===id);let imageData=old?.imageData||"";const file=$("photoFile").files[0];if(file){if(file.size>1200000){alert("演示版单张图片请小于约 1.2 MB。正式站点建议使用图片存储服务。");return}imageData=await fileToDataURL(file)}
 const item={id,title:$("photoTitle").value.trim(),date:$("photoDate").value,source:$("photoSource").value.trim(),url:$("photoUrl").value.trim(),imageUrl:$("photoImageUrl").value.trim(),imageData,rights:$("photoRights").value.trim(),notes:$("photoNotes").value.trim()};
 const idx=photos.findIndex(x=>x.id===id);if(idx>=0)photos[idx]=item;else photos.unshift(item);$("photoDialog").close();try{save()}catch(err){alert("浏览器存储空间可能已满。请减少本地图片大小或改用图片链接。")}
});
function fileToDataURL(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
function render(){
 const q=$("searchInput").value.toLowerCase().trim(), cat=$("categoryFilter").value, yr=$("yearFilter").value;
 const yea