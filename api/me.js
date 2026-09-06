import {isAuthed,json} from './_github.js'; export default function handler(req,res){json(res,200,{authenticated:!!isAuthed(req)});}
