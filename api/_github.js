import crypto from 'node:crypto';

export function env(){
  const {GITHUB_TOKEN,GITHUB_OWNER,GITHUB_REPO,ADMIN_PASSWORD}=process.env;
  if(!GITHUB_TOKEN||!GITHUB_OWNER||!GITHUB_REPO||!ADMIN_PASSWORD) throw new Error('Missing Vercel environment variables');
  return {GITHUB_TOKEN,GITHUB_OWNER,GITHUB_REPO,ADMIN_PASSWORD};
}
export function sessionToken(){ const {ADMIN_PASSWORD}=env(); return crypto.createHmac('sha256',ADMIN_PASSWORD).update('YAO-TITAN-CMS').digest('hex'); }
export function isAuthed(req){ const c=req.headers.cookie||''; const m=c.match(/yao_admin=([^;]+)/); return m && m[1]===sessionToken(); }
export function json(res,status,data){ res.status(status).setHeader('Content-Type','application/json; charset=utf-8'); res.end(JSON.stringify(data)); }
export async function gh(path, options={}){
  const {GITHUB_TOKEN}=env();
  const r=await fetch(`https://api.github.com${path}`,{...options,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${GITHUB_TOKEN}`,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json',...(options.headers||{})}});
  const text=await r.text(); let data; try{data=JSON.parse(text)}catch{data={message:text}};
  if(!r.ok) throw new Error(data.message||`GitHub API ${r.status}`); return data;
}
export async function getFile(path){ const {GITHUB_OWNER,GITHUB_REPO}=env(); try{return await gh(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=main`)}catch(e){if(/Not Found/i.test(e.message)) return null; throw e;} }
export async function putFile(path, contentBase64, message, sha){ const {GITHUB_OWNER,GITHUB_REPO}=env(); const body={message,content:contentBase64,branch:'main'}; if(sha) body.sha=sha; return gh(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,{method:'PUT',body:JSON.stringify(body)}); }
