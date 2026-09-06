import {env,json,sessionToken} from './_github.js';
export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  try{env(); const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{}); if(body.password!==process.env.ADMIN_PASSWORD) return json(res,401,{error:'密碼錯誤'}); res.setHeader('Set-Cookie',`yao_admin=${sessionToken()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`); return json(res,200,{ok:true});}catch(e){return json(res,500,{error:e.message});}
}
