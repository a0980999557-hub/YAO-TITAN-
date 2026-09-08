import {isAuthed,json,putFile,getFile,env} from './_github.js';
export default async function handler(req,res){
  if(!isAuthed(req)) return json(res,401,{error:'未登入'});
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
    const name=String(body.name||'').replace(/[^a-zA-Z0-9._-]/g,'-');
    if(!name || !/^.+\.(jpg|jpeg|png|webp)$/i.test(name)) return json(res,400,{error:'只支援 JPG、PNG、WebP'});
    const b64=String(body.base64||'').replace(/^data:[^;]+;base64,/,'');
    if(!b64) return json(res,400,{error:'沒有圖片資料'});
    const bytes=Buffer.byteLength(b64,'base64');
    if(bytes>6*1024*1024) return json(res,400,{error:'單張圖片請控制在 6MB 以內'});
    const {GITHUB_OWNER,GITHUB_REPO}=env();
    const path=`history/${Date.now()}-${name}`;
    try{
      const existing=await getFile(path);
      const out=await putFile(path,b64,`Upload YAO TITAN image ${name}`,existing?.sha);
      return json(res,200,{ok:true,path,commit:out.commit?.sha});
    }catch(e){
      const detail=e.status===404
        ? `GitHub 找不到或拒絕存取 repository「${GITHUB_OWNER}/${GITHUB_REPO}」。請確認 Vercel 的 GITHUB_OWNER、GITHUB_REPO 正確，且 GITHUB_TOKEN 對這個 repository 開啟 Contents: Read and write。`
        : e.status===403
          ? 'GitHub 拒絕寫入。請確認 GITHUB_TOKEN 的 Contents 權限為 Read and write。'
          : `GitHub 上傳失敗：${e.message}`;
      return json(res,500,{error:detail});
    }
  }catch(e){ return json(res,500,{error:e.message||'上傳失敗'}); }
}
