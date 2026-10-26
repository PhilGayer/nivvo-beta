// Only drafts and retry operations live here. The cloud remains authoritative.
export class Outbox {
 constructor(storage,userId){this.storage=storage;this.userId=userId;this.key=`nivvo:outbox:${userId}`;}
 read(){try{const a=JSON.parse(this.storage.getItem(this.key)||'[]');return Array.isArray(a)?a.filter(x=>x.user_id===this.userId):[];}catch{return [];}}
 put(item){const a=this.read().filter(x=>x.write_id!==item.write_id);a.push({...item,user_id:this.userId});this.storage.setItem(this.key,JSON.stringify(a));}
 drop(id){this.storage.setItem(this.key,JSON.stringify(this.read().filter(x=>x.write_id!==id)));}
 clear(){this.storage.removeItem(this.key);}
}
