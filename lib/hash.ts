import bcrypt from 'bcrypt';

export function hashPass(pass:string){
    return bcrypt.hash(pass,10).then((hash:string)=>{
        return hash;
    })
} 

export function isSamePass(unHashPass:string , hashPass:string){
    return bcrypt.compare(unHashPass,hashPass).then((result:boolean)=>{
        return result;
    })
}