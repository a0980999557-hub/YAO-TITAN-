import {isAuthed,json,putFile} from './_github.js';
import {getFile} from './_github.js';
export default async function handler(req,res){
  if(!isAuthed(req)) return json(res,401,{error:'未登入'});
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    const name=String(body.name||'').replace(/[^a-zA-Z0-9._-]/g,'-');
    if(!name || !/^.+\.(jpg|jpeg|png|webp)$/i.test(name)) return json(res,400,{error:'只支援 JPG、PNG、WebP'});
    const b64=String(body.base64||'').replace(/^data:[^;]+;base64,/,''); if(!b64) return json(res,400,{error:'沒有圖片資料'});
    if(Buffer.byteLength(b64,'base64')>6*1024*1024) return json(res,400,{error:'單張圖片請控制在 6MB 以內'});
    const path=`history/${Date.now()}-${name}`; const existing=await getFile(path); const out=await putFile(path,b64,`Upload YAO TITAN image ${name}`,existing?.sha);
    return json(res,200,{ok:true,path,commit:out.commit?.sha});
  }catch(e){return json(res,500,{error:e.message});}
}
