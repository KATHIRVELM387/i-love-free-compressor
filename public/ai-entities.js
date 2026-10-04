// The recognizer sometimes changes PER/ORG labels inside a name. Join only
// adjacent recognized token positions, then require a whole, literal source span.
export function recognizedNameSpans(tokens,decode,source){
 const groups=[];
 for(const token of tokens){if(!/-(PER|ORG)$/.test(token.entity))continue;const last=groups.at(-1);if(last&&token.index===last.end+1)last.end=token.index;else groups.push({start:token.index,end:token.index});}
 const names=[];
 for(const group of groups){const text=decode(group.start,group.end+1).trim();if(!text||text.includes('##'))continue;let index=source.indexOf(text),found=false;while(index>=0){if(!/[\p{L}\p{N}]/u.test(source[index-1]||'')&&!/[\p{L}\p{N}]/u.test(source[index+text.length]||'')){found=true;break;}index=source.indexOf(text,index+1);}if(found)names.push(text);}
 return [...new Set(names)];
}
