import { getStore } from '@netlify/blobs';

const store = getStore('localloop-data');
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const SITE_URL = process.env.URL || '';

const seedGuides = [
  { id: 1, name: 'Arun Kumar', city: 'Chennai', languages: ['English', 'Tamil', 'Hindi'], experience: '7 years', price: 1200, rating: 4.9, reviews: 128, specialties: ['Heritage', 'Food', 'Architecture'], bio: 'Local historian who loves turning Chennai walks into stories.', available: 1 },
  { id: 2, name: 'Meena Ravi', city: 'Chennai', languages: ['English', 'Tamil', 'French'], experience: '5 years', price: 1500, rating: 4.8, reviews: 94, specialties: ['Culture', 'Temples', 'Shopping'], bio: 'Friendly cultural guide specializing in first-time visitors.', available: 1 },
  { id: 3, name: 'Vikram S', city: 'Chennai', languages: ['English', 'Tamil', 'Telugu'], experience: '4 years', price: 1000, rating: 4.7, reviews: 76, specialties: ['Street Food', 'Local Life', 'Photography'], bio: 'Photographer and food lover for authentic local experiences.', available: 1 }
];
const seedPackages = [
  { id: 1, title: 'Chennai Heritage Day', city: 'Chennai', duration: '1 day', price: 299, places: ['Fort St. George', 'Kapaleeshwarar Temple', 'San Thome Basilica'], type: 'Heritage' },
  { id: 2, title: 'Madurai Temple & Food Trail', city: 'Madurai', duration: '1 day', price: 349, places: ['Meenakshi Amman Temple', 'Puthu Mandapam', 'Jigarthanda Trail'], type: 'Culture' },
  { id: 3, title: 'Kerala Backwater Escape', city: 'Kochi', duration: '2 days', price: 599, places: ['Fort Kochi', 'Alleppey Backwaters', 'Mattancherry'], type: 'Nature' },
  { id: 4, title: 'Goa Coast & Old Town', city: 'Goa', duration: '2 days', price: 499, places: ['Vagator Beach', 'Fontainhas', 'Old Goa'], type: 'Sightseeing' },
  { id: 5, title: 'Mumbai Icons', city: 'Mumbai', duration: '1 day', price: 399, places: ['Gateway of India', 'Colaba', 'Marine Drive'], type: 'City' },
  { id: 6, title: 'Jaipur Pink City', city: 'Jaipur', duration: '2 days', price: 549, places: ['Hawa Mahal', 'Amber Fort', 'City Palace'], type: 'Heritage' },
  { id: 7, title: 'Agra Taj Story', city: 'Agra', duration: '1 day', price: 449, places: ['Taj Mahal', 'Agra Fort', 'Mehtab Bagh'], type: 'Heritage' },
  { id: 8, title: 'Varanasi by the Ganges', city: 'Varanasi', duration: '2 days', price: 499, places: ['Dashashwamedh Ghat', 'Ganga Aarti', 'Old City Lanes'], type: 'Spiritual' },
  { id: 9, title: 'Delhi History Loop', city: 'Delhi', duration: '2 days', price: 449, places: ['Red Fort', 'India Gate', 'Old Delhi Food Walk'], type: 'Heritage' },
  { id: 10, title: 'Amritsar Soul & Flavours', city: 'Amritsar', duration: '1 day', price: 399, places: ['Golden Temple', 'Jallianwala Bagh', 'Local Food Trail'], type: 'Culture' },
  { id: 11, title: 'Hampi Time Machine', city: 'Hampi', duration: '2 days', price: 499, places: ['Virupaksha Temple', 'Vittala Temple', 'Hampi Bazaar'], type: 'Heritage' },
  { id: 12, title: 'Mysuru Royal Weekend', city: 'Mysuru', duration: '2 days', price: 449, places: ['Mysore Palace', 'Devaraja Market', 'Chamundi Hills'], type: 'Culture' },
  { id: 13, title: 'Hyderabad Charminar Nights', city: 'Hyderabad', duration: '1 day', price: 349, places: ['Charminar', 'Laad Bazaar', 'Old City Biryani Trail'], type: 'Food' },
  { id: 14, title: 'Leh High-Altitude Escape', city: 'Leh', duration: '3 days', price: 799, places: ['Leh Palace', 'Shanti Stupa', 'Old Leh Market'], type: 'Adventure' },
  { id: 15, title: 'Kolkata Culture Circuit', city: 'Kolkata', duration: '2 days', price: 449, places: ['Victoria Memorial', 'College Street', 'Kumartuli'], type: 'Culture' },
  { id: 16, title: 'Darjeeling Tea & Toy Train', city: 'Darjeeling', duration: '2 days', price: 599, places: ['Tiger Hill', 'Tea Estates', 'Toy Train'], type: 'Nature' },
  { id: 17, title: 'Konark Heritage Trail', city: 'Konark', duration: '1 day', price: 349, places: ['Sun Temple', 'Chandrabhaga Beach', 'Puri Coast'], type: 'Heritage' },
  { id: 18, title: 'Sanchi Buddhist Trail', city: 'Sanchi', duration: '1 day', price: 299, places: ['Great Stupa', 'Ashoka Pillar', 'Sanchi Museum'], type: 'Heritage' }
];
async function getState(){const state=await store.get('state',{type:'json'});if(state){const existing=new Set((state.packages||[]).map(p=>p.id));const missing=seedPackages.filter(p=>!existing.has(p.id));if(missing.length){state.packages=[...(state.packages||[]),...missing];await store.setJSON('state',state)}return state}const initial={guides:seedGuides,packages:seedPackages,bookings:[],reviews:[]};await store.setJSON('state',initial);return initial}
async function saveState(state){await store.setJSON('state',state)}
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*'}})}
function bookingCode(){return 'LL-'+Date.now().toString(36).toUpperCase()+'-'+Math.floor(100+Math.random()*900)}
function razorHeaders(){return {'Authorization':'Basic '+Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64'),'Content-Type':'application/json'}}
async function razorFetch(path,options={}){const response=await fetch(`https://api.razorpay.com/v1/${path}`,{...options,headers:{...razorHeaders(),...(options.headers||{})}});const data=await response.json();if(!response.ok)throw new Error(data.error?.description||'Razorpay API error');return data}
function signPayload(orderId,paymentId){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(orderId+'|'+paymentId))}
async function hmacHex(secret,message){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(message));return [...new Uint8Array(sig)].map(x=>x.toString(16).padStart(2,'0')).join('')}
export default async function handler(request){
 const url=new URL(request.url),path=url.pathname.replace(/^\/api\/?/,''),method=request.method.toUpperCase();
 if(method==='OPTIONS')return new Response(null,{status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,PATCH,OPTIONS','access-control-allow-headers':'Content-Type'}});
 try{
  const state=await getState();
  if(method==='GET'&&path==='health')return json({ok:true,service:'LocalLoop API (Netlify)',payments:RAZORPAY_KEY_ID?'razorpay':'demo'});
  if(method==='GET'&&path==='guides'){const destination=url.searchParams.get('destination')||'';const language=url.searchParams.get('language')||'All';let rows=state.guides.filter(g=>g.available===1);if(destination)rows=rows.filter(g=>g.city.toLowerCase().includes(destination.toLowerCase()));if(language!=='All')rows=rows.filter(g=>g.languages.includes(language));return json(rows)}
  const guideMatch=path.match(/^guides\/(\d+)$/);if(method==='GET'&&guideMatch){const guide=state.guides.find(g=>g.id===Number(guideMatch[1]));return guide?json(guide):json({error:'Guide not found'},404)}
  if(method==='POST'&&path==='guides'){const body=await request.json();const{name,city,languages,experience,price,specialties,bio}=body;if(!name||!city||!languages||!experience||!price||!specialties||!bio)return json({error:'All fields are required'},400);const id=Math.max(0,...state.guides.map(g=>g.id))+1;state.guides.push({id,name,city,languages:Array.isArray(languages)?languages:String(languages).split(','),experience,price:Number(price),rating:5,reviews:0,specialties:Array.isArray(specialties)?specialties:String(specialties).split(','),bio,available:1});await saveState(state);return json({id,message:'Guide created'},201)}
  if(method==='GET'&&path==='packages')return json(state.packages);
  if(method==='POST'&&path==='bookings'){
   const body=await request.json();const{kind,touristName,touristEmail,destination,tourDate,people=1,guideId,packageId,durationHours=1}=body;
   if(!kind||!['guide','package'].includes(kind)||!touristName||!touristEmail||!destination)return json({error:'Missing booking details'},400);
   let total,advance,remaining;
   if(kind==='guide'){const guide=state.guides.find(g=>g.id===Number(guideId));if(!guide)return json({error:'Guide not found'},404);total=guide.price*Number(durationHours);advance=Math.round(total*.10);remaining=total-advance}
   else{const pack=state.packages.find(p=>p.id===Number(packageId));if(!pack)return json({error:'Package not found'},404);total=pack.price*Number(people);advance=total;remaining=0}
   const booking={id:state.bookings.length?Math.max(...state.bookings.map(b=>b.id))+1:1,bookingCode:bookingCode(),kind,touristName,touristEmail,destination,tourDate:tourDate||null,people:Number(people),guideId:guideId?Number(guideId):null,packageId:packageId?Number(packageId):null,durationHours:Number(durationHours),total,advance,remaining,status:'PENDING_PAYMENT',paymentStatus:'UNPAID',paymentOrderId:null,paymentId:null,meetingLocation:kind==='guide'?'Meeting point will be shared after advance payment.':null,createdAt:new Date().toISOString()};
   state.bookings.push(booking);await saveState(state);return json({id:booking.id,bookingCode:booking.bookingCode,total,advance,remaining,status:booking.status,paymentRequired:advance},201)
  }
  const bookingMatch=path.match(/^bookings\/([^/]+)$/);
  if(method==='GET'&&bookingMatch){const booking=state.bookings.find(b=>b.bookingCode===bookingMatch[1]);if(!booking)return json({error:'Booking not found'},404);const guide=booking.guideId?state.guides.find(g=>g.id===booking.guideId):null;const pack=booking.packageId?state.packages.find(g=>g.id===booking.packageId):null;return json({...booking,guide_name:guide?.name||null,guide_languages:guide?.languages||null,package_title:pack?.title||null})}
  if(method==='POST'&&path==='payments/create-order'){
   const {bookingCode}=await request.json();const booking=state.bookings.find(b=>b.bookingCode===bookingCode);if(!booking)return json({error:'Booking not found'},404);
   if(booking.paymentStatus==='PAID')return json({error:'Booking already paid'},400);
   if(!RAZORPAY_KEY_ID||!RAZORPAY_KEY_SECRET){booking.status='CONFIRMED';booking.paymentStatus='DEMO_PAID';await saveState(state);return json({demo:true,keyId:null,amount:booking.advance*100,currency:'INR',bookingCode},200)}
   const order=await razorFetch('orders',{method:'POST',body:JSON.stringify({amount:booking.advance*100,currency:'INR',receipt:booking.bookingCode,notes:{bookingCode:booking.bookingCode,kind:booking.kind}})});
   booking.paymentOrderId=order.id;await saveState(state);return json({demo:false,keyId:RAZORPAY_KEY_ID,orderId:order.id,amount:order.amount,currency:order.currency,bookingCode})
  }
  if(method==='POST'&&path==='payments/verify'){
   const {bookingCode,razorpay_order_id,razorpay_payment_id,razorpay_signature}=await request.json();const booking=state.bookings.find(b=>b.bookingCode===bookingCode);if(!booking)return json({error:'Booking not found'},404);if(!RAZORPAY_KEY_SECRET)return json({error:'Payment gateway is not configured'},503);if(!booking.paymentOrderId||booking.paymentOrderId!==razorpay_order_id)return json({error:'Payment order mismatch'},400);const expected=await hmacHex(RAZORPAY_KEY_SECRET,`${razorpay_order_id}|${razorpay_payment_id}`);if(expected!==razorpay_signature)return json({error:'Payment signature verification failed'},400);booking.paymentId=razorpay_payment_id;booking.paymentStatus='PAID';booking.status='CONFIRMED';await saveState(state);return json({ok:true,message:'Payment verified'})
  }
  if(method==='PATCH'&&bookingMatch){const body=await request.json();if(!['CONFIRMED','COMPLETED','CANCELLED'].includes(body.status))return json({error:'Invalid status'},400);const booking=state.bookings.find(b=>b.bookingCode===bookingMatch[1]);if(!booking)return json({error:'Booking not found'},404);booking.status=body.status;await saveState(state);return json({message:'Status updated'})}
  if(method==='POST'&&path==='reviews'){const{bookingId,guideId,rating,comment=''}=await request.json();const booking=state.bookings.find(b=>b.id===Number(bookingId)&&b.status==='COMPLETED');if(!booking)return json({error:'Booking must be completed before reviewing'},400);if(!booking.guideId||Number(booking.guideId)!==Number(guideId))return json({error:'Invalid guide for this booking'},400);const review={id:state.reviews.length+1,bookingId:Number(bookingId),guideId:Number(guideId),rating:Number(rating),comment,createdAt:new Date().toISOString()};state.reviews.push(review);const guideReviews=state.reviews.filter(r=>r.guideId===Number(guideId));const guide=state.guides.find(g=>g.id===Number(guideId));if(guide){guide.rating=Number((guideReviews.reduce((s,r)=>s+r.rating,0)/guideReviews.length).toFixed(1));guide.reviews=guideReviews.length}await saveState(state);return json({message:'Review added'},201)}
  if(method==='GET'&&path==='admin/stats')return json({guides:state.guides.length,packages:state.packages.length,bookings:state.bookings.length,revenue:state.bookings.filter(b=>b.status!=='CANCELLED').reduce((s,b)=>s+b.advance,0),paidOnline:state.bookings.filter(b=>b.paymentStatus==='PAID').reduce((s,b)=>s+b.advance,0)});
  return json({error:'Not found'},404)
 }catch(error){console.error(error);return json({error:'Server error',message:error.message},500)}
}
