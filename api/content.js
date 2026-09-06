import {isAuthed,json,env,getFile,putFile} from './_github.js';
export default async function handler(req,res){
  if(!isAuthed(req)) return json(res,401,{error:'未登入'});
  try{
    if(req.method==='GET'){
      const f=await getFile('content.json'); if(!f) return json(res,404,{error:'content.json 不存在'});
      return json(res,200,{content:JSON.parse(Buffer.from(f.content,'base64').toString('utf8')),sha:f.sha});
    }
    if(req.method==='PUT'){
      const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{}); if(!body.content) return json(res,400,{error:'缺少內容'});
      const f=await getFile('content.json'); const b64=Buffer.from(JSON.stringify(body.content,null,2),'utf8').toString('base64');
      const out=await putFile('content.json',b64,'Update YAO TITAN website content',f?.sha); return json(res,200,{ok:true,commit:out.commit?.sha});
    }
    return json(res,405,{error:'Method not allowed'});
  }catch(e){return json(res,500,{error:e.message});}
}
