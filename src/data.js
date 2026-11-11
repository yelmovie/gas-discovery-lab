export const APP = { name: '기체 도시 대작전', version: '1.3.0', saveKey: 'gas-city-adventure-v1' };
export const STANDARDS = [
  ['4과15-01','실험을 통해 기체가 무게가 있음을 설명할 수 있다.'],
  ['4과15-02','온도나 압력에 따라 기체의 부피가 달라지는 현상을 관찰하고, 우리 주변에서 예를 찾을 수 있다.'],
  ['4과15-03','일상생활에서 이용되는 기체의 종류와 성질을 조사하고, 여러 가지 기체에 대해 흥미를 느낄 수 있다.'],
  ['4과15-04','기체의 성질을 이용하여 작동시킬 수 있는 장치를 설계하고 만들 수 있다.']
];
// 콘텐츠 검수 정보: 교사 검수 전이므로 needsReview는 true로 둔다(검수 후 reviewer·reviewedAt을 채운다).
export const CONTENT_REVIEW = {needsReview:true,reviewer:null,reviewedAt:null,sources:['2022 개정 과학과 교육과정 성취기준 [4과15-01]~[4과15-04]','경기도교육청 「초등 깊이있는 수업 프레임워크 부록」 77쪽(2026-11-08 확인): 입자 모형 설명은 범위 밖'],scope:'초등 4학년 과학 「여러 가지 기체」'};
export const STAGES = [
 {id:'flow',name:'바람 동력소',chapter:'끊어진 공기 길',short:'공기를 보내요',npc:'air',color:'teal',evidence:'공기 흐름 기록',badge:'바람길 개척자',description:'공기는 이동하며 물체를 밀 수 있어요. 관을 이어 팬에 공기를 보내요.',keyTerms:['공기','이동','밀'],bridge:'다음은 공기의 무게를 비교해요.',reward:'멈춘 풍차가 다시 돌아가요.',standard:'4과15-04',tasks:[
  {id:'flow-1',title:'멈춘 환기팬을 돌려요',goal:'관을 돌려 공기 길을 이어요.',pattern:0,why:'공기가 관을 따라 이동해 팬을 밀었어요.'},
  {id:'flow-2',title:'아래쪽 길도 이어 볼까요?',goal:'굽은 관을 이용해 아래로 돌아가요.',pattern:1,why:'굽은 관을 지나도 공기는 이동해요.'},
  {id:'flow-3',title:'중간에서 새는 바람을 찾아요',goal:'입구와 출구가 맞도록 관을 돌려요.',pattern:2,why:'관이 끊기면 팬까지 공기를 보낼 수 없어요.'},
  {id:'flow-4',title:'온실의 바람길까지 복구해요',goal:'지금까지 찾은 방법으로 새 길을 이어요.',pattern:3,why:'공기를 보낼 길이 이어져야 장치를 움직여요.'}
 ]},
 {id:'weight',name:'무게 연구소',chapter:'보이지 않는 무게',short:'무게를 비교해요',npc:'lumi',color:'blue',evidence:'기체 무게 측정 기록',badge:'꼼꼼한 측정가',description:'공기에도 무게가 있을까요? 같은 용기에서 공기의 양만 바꾸어 비교해요.',keyTerms:['무게','같은 용기','공기의 양','0점','수평'],bridge:'다음은 같은 공기의 부피를 비교해요.',reward:'마을의 물류 저울이 다시 작동해요.',standard:'4과15-01',tasks:[
  {id:'weight-1',title:'공기를 더 넣으면 어떨까요?',goal:'빈 저울을 맞춘 뒤, 공기를 넣기 전후를 재요.',direction:1,minDelta:1,initial:3,level:-2},
  {id:'weight-2',title:'공기를 빼면 어떨까요?',goal:'같은 용기에서 공기를 빼기 전후를 재요.',direction:-1,minDelta:1,initial:6,level:2},
  {id:'weight-3',title:'저울 조건부터 바르게 맞춰요',goal:'저울을 바르게 맞추고, 비교할 수 있는 기록을 만들어요.',direction:1,minDelta:2,initial:3,level:1},
  {id:'weight-4',title:'한 번 더 재도 같을까요?',goal:'다른 양의 공기로 다시 확인해요.',direction:-1,minDelta:2,initial:7,level:-1}
 ]},
 {id:'climate',name:'환경 관측소',chapter:'크기가 달라지는 공기',short:'부피 변화를 살펴요',npc:'lumi',color:'coral',evidence:'부피 변화 환경 기록',badge:'환경 탐구자',description:'부피는 차지하는 공간의 크기예요. 온도나 압력을 한 가지씩 바꾸어 비교해요.',keyTerms:['부피','온도','압력','같은 공기','공기','기체의 양','기체'],bridge:'다음은 여러 기체의 성질을 조사해요.',reward:'온실의 온도·압력 장치가 켜져요.',standard:'4과15-02',tasks:[
  {id:'climate-1',title:'따뜻한 곳으로 옮겨요',goal:'따뜻한 곳으로 바꾸고 처음 부피와 비교해요.',mode:'temperature',target:2,transfer:'공기가 든 풍선을 따뜻한 곳에 두면?',answer:'공기가 차지하는 부피가 커져요.',choices:['공기가 차지하는 부피가 커져요.','공기가 차지하는 부피가 작아져요.'],why:'기체의 양과 바깥 압력을 같게 두었어요. 온도가 높아지자 부피가 커졌어요.',retry:'따뜻한 곳으로 옮긴 뒤 부피 막대가 길어졌나요, 짧아졌나요? 다시 비교해 보아요.'},
  {id:'climate-2',title:'차가운 곳에서는 어떨까요?',goal:'차가운 곳으로 바꾸고 처음 부피와 비교해요.',mode:'temperature',target:0,transfer:'따뜻한 방의 풍선을 차가운 곳으로 옮기면?',answer:'풍선 속 공기의 부피가 작아져요.',choices:['풍선 속 공기의 부피가 커져요.','풍선 속 공기의 부피가 작아져요.'],why:'기체의 양과 바깥 압력을 같게 두었어요. 온도가 낮아지자 부피가 작아졌어요.',retry:'차가운 곳으로 옮긴 뒤 부피 막대가 길어졌나요, 짧아졌나요? 다시 비교해 보아요.'},
  {id:'climate-3',title:'피스톤으로 눌러 보아요',goal:'피스톤을 아래로 밀고 누르기 전 부피와 비교해요.',mode:'pressure',target:2,transfer:'공기가 새지 않는 주사기의 입구를 막고 누르면?',answer:'안에 있는 공기의 부피가 작아져요.',choices:['공기가 모두 사라져요.','안에 있는 공기의 부피가 작아져요.'],why:'기체의 양과 온도를 같게 두었어요. 누르는 압력이 커지자 같은 공기의 부피가 작아졌어요.',retry:'입구를 막아서 공기는 빠져나가지 못해요. 눌렀을 때 공기가 차지하는 공간을 다시 살펴봐요.'},
  {id:'climate-4',title:'높은 산의 과자 봉지',goal:'바깥 압력을 낮추고 처음 부피와 비교해요.',mode:'pressure',target:0,transfer:'밀봉한 과자 봉지를 높은 산으로 가져가면?',answer:'바깥 압력이 낮아져 봉지가 더 부풀어요.',choices:['바깥 압력이 낮아져 봉지가 더 부풀어요.','봉지 속 기체가 없어져 봉지가 줄어들어요.'],why:'기체의 양과 온도가 같을 때, 바깥 압력이 낮아지면 봉지 속 기체의 부피가 커질 수 있어요.',retry:'밀봉한 봉지라서 기체는 빠져나가지 않아요. 바깥 압력을 낮췄을 때 부피 막대를 다시 살펴봐요.'}
 ]},
 {id:'delivery',name:'기체 배송소',chapter:'알맞은 기체를 찾아요',short:'기체를 골라 보내요',npc:'popo',color:'gold',evidence:'기체 관제 보고서',badge:'기체 해결사',description:'성질은 물질이 가진 특징이에요. 기체의 성질을 조사해 알맞은 쓰임을 찾아요.',keyTerms:['질소','산소','이산화 탄소','성질','반응','호흡','물에 녹아','불이 타는 것을'],bridge:'다음은 공기로 움직이는 장치를 설계해요.',reward:'식품·생활 시설에 다시 불이 들어와요.',standard:'4과15-03',tasks:[
  {id:'delivery-1',title:'과자 포장실의 부탁',goal:'과자가 쉽게 변하지 않도록 도와줄 기체를 찾아요.',facility:'과자 포장실',prop:'packet',gas:'nitrogen',reason:'다른 물질과 쉽게 반응하지 않아요.',why:'질소는 다른 물질과 쉽게 반응하지 않는 성질을 이용해 식품 포장에 쓰여요.'},
  {id:'delivery-2',title:'호흡 지원실의 부탁',goal:'숨 쉬기를 돕는 장치에 넣을 기체를 보내 주세요.',facility:'호흡 지원실',prop:'jar',gas:'oxygen',reason:'사람의 호흡에 필요해요.',why:'산소는 사람의 호흡에 필요한 기체예요. 이곳은 성질과 이용을 살피는 가상 시설이에요.'},
  {id:'delivery-3',title:'탄산음료 공방의 부탁',goal:'톡 쏘는 탄산음료의 기포를 만들 기체를 찾아요.',facility:'탄산음료 공방',prop:'soda',gas:'carbon',reason:'물에 녹아 탄산음료를 만들어요.',why:'이산화 탄소가 물에 녹아 있는 탄산음료에서는 뚜껑을 열 때 기포를 볼 수 있어요.'},
  {id:'delivery-4',title:'안전 시설의 마지막 부탁',goal:'일부 소화기에 쓰이는 기체와 성질을 찾아요.',facility:'마을 안전 시설',prop:'toolbox',gas:'carbon',reason:'불이 타는 것을 돕지 않아요.',why:'이산화 탄소는 불이 타는 것을 돕지 않아 일부 소화기에 이용돼요. 실제 소화기 사용 실험은 하지 않아요.'}
 ]},
 {id:'engineering',name:'공기 공작소',chapter:'나만의 복구 장치',short:'조립하고 시험해요',npc:'air',color:'teal',evidence:'공기 장치 설계도',badge:'공기 엔지니어',description:'설계는 부품과 연결 방법을 정하는 일이에요. 공기로 움직이는 장치를 만들고 고쳐요.',keyTerms:['공기','공급부','관','노즐','밸브','방향','설계'],bridge:'이제 탐구 증거와 장치로 코어를 복구해요.',reward:'중앙 공기 코어의 연결부가 열려요.',standard:'4과15-04',tasks:[
  {id:'engineering-1',title:'공기로 작은 팬을 돌려요',goal:'공급부 → 관 → 노즐을 연결해 팬에 공기를 보내요.',target:'fan',nozzle:'forward',why:'공기를 모아 관으로 보내면 팬을 움직일 수 있어요.'},
  {id:'engineering-2',title:'다른 길로 풍차를 돌려요',goal:'굽은 관을 써서 공기를 풍차까지 보내요.',target:'windmill',nozzle:'forward',requireElbow:true,why:'공기 길은 여러 모양으로 만들 수 있어요. 연결과 방향이 중요해요.'},
  {id:'engineering-3',title:'풍선 자동차가 나아가게 해요',goal:'풍선에 모은 공기를 뒤로 내보내는 장치를 설계해요.',target:'car',requireSource:'balloon',nozzle:'backward',why:'공기가 뒤로 나가면서 풍선 자동차가 앞으로 움직여요.'},
  {id:'engineering-4',title:'중앙 코어의 복구 장치',goal:'공기를 코어 쪽으로 보내는 장치를 완성해요.',target:'core',nozzle:'forward',why:'공기의 이동을 이용한 내 장치로 중앙 코어를 다시 움직일 수 있어요.'}
 ]}
];
export const GASES = [
 {id:'nitrogen',name:'질소',symbol:'N₂',color:'#417f78',use:'식품 포장',facts:['다른 물질과 쉽게 반응하지 않아요.','과자 봉지 등 식품 포장에 이용돼요.']},
 {id:'oxygen',name:'산소',symbol:'O₂',color:'#4d79a1',use:'호흡 지원',facts:['사람의 호흡에 필요해요.','불이 타는 것을 도와요.']},
 {id:'carbon',name:'이산화 탄소',symbol:'CO₂',color:'#996a4d',use:'탄산음료 · 일부 소화기',facts:['물에 녹아 탄산음료를 만들어요.','불이 타는 것을 돕지 않아요.']}
];
export const STORY = [
 {title:'마을의 바람이 멈췄어요',text:'공기 코어가 멈추자 연구시설도 하나둘 멈췄어요. 여우 에어와 함께 고장 난 마을을 살펴볼까요?',image:'title',npc:'air'},
 {title:'직접 해 보고, 증거를 모아요',text:'관을 잇고, 무게를 재고, 부피를 비교해요. 다섯 연구시설을 도울 때마다 내 탐구 기록과 배지가 생겨요.',image:'weight',npc:'lumi'},
 {title:'내 장치로 마을을 되살려요',text:'모은 증거와 직접 만든 공기 장치로 중앙 코어를 움직여요. 모험 끝에는 나만의 연구 기록과 인증서가 남아요.',image:'ending',npc:'popo'}
];
export function stageById(id){return STAGES.find(s=>s.id===id);}
export function taskById(id){for(const s of STAGES){const t=s.tasks.find(t=>t.id===id);if(t)return {stage:s,task:t};}return null;}
