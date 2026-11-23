// 코어 완료 시각은 복습 기록과 분리한다. 이전 저장의 없는 날짜를 추정하지 않는다.
export function validCompletionTimestamp(value) {
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value))return null;
 const date=new Date(value);
 return Number.isFinite(date.getTime())&&date.toISOString()===value?value:null;
}
export function completionDateText(save) {
 const value=save.finaleCompleted===true?validCompletionTimestamp(save.finaleCompletedAt):null;
 if(!value)return '날짜 기록 없음';
 const date=new Date(value);
 return `${date.getFullYear()}. ${date.getMonth()+1}. ${date.getDate()}.`;
}
