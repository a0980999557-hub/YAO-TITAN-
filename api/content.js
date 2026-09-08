import {isAuthed,json,getFile,putFile} from './_github.js';

// Public repo fallback: Vercel serverless functions may not bundle root content.json.
// We read the published file from GitHub's raw endpoint first, then use the GitHub API
// for authenticated writes. This also makes the error message much more useful.
const OWNER='a0980999557-hub';
const REPO='YAO-TITAN-';
const BRANCH='main';

async function readPublishedContent(){
  const raw=`https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/content.json?ts=${Date.now()}`;
  const r=await fetch(raw,{cache:'no-store'});
  if(r.ok) return await r.json();
  throw new Error(`GitHub content.json 讀取失敗（HTTP ${r.status}）`);
}

export default async function handler(req,res){
  if(!isAuthed(req)) return json(res,401,{error:'未登入'});
  try{
    if(req.method==='GET'){
      const content=await readPublishedContent();
      return json(res,200,{content,source:'github-raw'});
    }
    if(req.method==='PUT'){
      const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
      if(!body.content) return json(res,400,{error:'缺少內容'});
      const f=await getFile('content.json');
      const b64=Buffer.from(JSON.stringify(body.content,null,2),'utf8').toString('base64');
      const out=await putFile('content.json',b64,'Update YAO TITAN website content',f?.sha);
      return json(res,200,{ok:true,commit:out.commit?.sha});
    }
    return json(res,405,{error:'Method not allowed'});
  }catch(e){
    console.error(e);
    return json(res,500,{error:`內容服務失敗：${e.message}`});
  }
}
