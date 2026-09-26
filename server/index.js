import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const db=new Database(path.join(__dirname,'localloop.db'));
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS guides(
 id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,city TEXT NOT NULL,
 languages TEXT NOT NULL,experience TEXT NOT NULL,price INTEGER NOT NULL,
 rating REAL DEFAULT 5,reviews INTEGER DEFAULT 0,specialties TEXT NOT NULL,bio TEXT NOT NULL,
 available INTEGER DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS packages(
 id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT NOT NULL,city TEXT NOT NULL,
 duration TEXT NOT NULL,price INTEGER NOT NULL,places TEXT NOT NULL,type TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS bookings(
 id INTEGER PRIMARY KEY AUTOINCREMENT,booking_code TEXT UNIQUE NOT NULL,kind TEXT NOT NULL,
 tourist_name TEXT NOT NULL,tourist_email TEXT NOT NULL,destination TEXT NOT NULL,
 tour_date TEXT,people INTEGER DEFAULT 1,guide_id INTEGER,package_id INTEGER,
 duration_hours INTEGER,total INTEGER NOT NULL,advance INTEGER NOT NULL,remaining INTEGER NOT NULL,
 status TEXT DEFAULT 'CONFIRMED',meeting_location TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(guide_id) REFERENCES guides(id),FOREIGN KEY(package_id) REFERENCES packages(id)
);
CREATE TABLE IF NOT EXISTS reviews(
 id INTEGER PRIMARY KEY AUTOINCREMENT,booking_id INTEGER NOT NULL,guide_id INTEGER NOT NULL,
 rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),comment TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(booking_id) REFERENCES bookings(id),FOREIGN KEY(guide_id) REFERENCES guides(id)
);
`);

const seedGuides=[
['Arun Kumar','Chennai','English,Tamil,Hindi','7 years',1200,4.9,128,'Heritage,Food,Architecture','Local historian who loves turning Chennai walks into stories.'],
['Meena Ravi','Chennai','English,Tamil,French','5 years',1500,4.8,94,'Culture,Temples,Shopping','Friendly cultural guide specializing in first-time visitors.'],
['Vikram S','Chennai','English,Tamil,Telugu','4 years',1000,4.7,76,'Street Food,Local Life,Photography','Photographer and food lover for authentic local experiences.']
];
if(db.prepare('SELECT COUNT(*) c FROM guides').get().c===0){
 const s=db.prepare('INSERT INTO guides(name,city,languages,experience,price,rating,reviews,specialties,bio) VALUES(?,?,?,?,?,?,?,?,?)');
 for(const g of seedGuides)s.run(...g);
}
const seedPackages=[
['Chennai Heritage Day','Chennai','1 day',299,'Fort St. George,Kapaleeshwarar Temple,San Thome Basilica','Heritage'],
['Chennai Food Trail','Chennai','4 hours',199,'Mylapore,T. Nagar,George Town','Food'],
['Marina & City Highlights','Chennai','3 hours',149,'Marina Beach,Light House,Besant Nagar','Sightseeing']
];
if(db.prepare('SELECT COUNT(*) c FROM packages').get().c===0){
 const s=db.prepare('INSERT INTO packages(title,city,duration,price,places,type) VALUES(?,?,?,?,?,?)');
 for(const p of seedPackages)s.run(...p);
}

const app=express();
app.use(cors()); app.use(express.json());

app.get('/api/health',(req,res)=>res.json({ok:true,service:'LocalLoop API'}));

app.get('/api/guides',(req,res)=>{
 const {destination='',language='All'}=req.query;
 let rows=db.prepare('SELECT * FROM guides WHERE available=1').all();
 if(destination)rows=rows.filter(g=>g.city.toLowerCase().includes(destination.toLowerCase()));
 if(language && language!=='All')rows=rows.filter(g=>g.languages.split(',').includes(language));
 res.json(rows.map(g=>({...g,languages:g.languages.split(','),specialties:g.specialties.split(',')})));
});
app.get('/api/guides/:id',(req,res)=>{
 const g=db.prepare('SELECT * FROM guides WHERE id=?').get(req.params.id);
 if(!g)return res.status(404).json({error:'Guide not found'});
 res.json({...g,languages:g.languages.split(','),specialties:g.specialties.split(',')});
});
app.post('/api/guides',(req,res)=>{
 const {name,city,languages,experience,price,specialties,bio}=req.body;
 if(!name||!city||!languages||!experience||!price||!specialties||!bio)return res.status(400).json({error:'All fields are required'});
 const r=db.prepare('INSERT INTO guides(name,city,languages,experience,price,specialties,bio) VALUES(?,?,?,?,?,?,?)')
   .run(name,city,Array.isArray(languages)?languages.join(','):languages,experience,Number(price),Array.isArray(specialties)?specialties.join(','):specialties,bio);
 res.status(201).json({id:r.lastInsertRowid,message:'Guide created'});
});
app.get('/api/packages',(req,res)=>{
 const rows=db.prepare('SELECT * FROM packages ORDER BY id').all();
 res.json(rows.map(p=>({...p,places:p.places.split(',')})));
});

function code(){return 'LL-'+Date.now().toString(36).toUpperCase()+'-'+Math.floor(100+Math.random()*900)}
app.post('/api/bookings',(req,res)=>{
 const {kind,touristName,touristEmail,destination,tourDate,people=1,guideId,packageId,durationHours=1}=req.body;
 if(!kind||!touristName||!touristEmail||!destination)return res.status(400).json({error:'Missing booking details'});
 let total;
 if(kind==='guide'){
   const g=db.prepare('SELECT * FROM guides WHERE id=?').get(guideId);
   if(!g)return res.status(404).json({error:'Guide not found'});
   total=g.price*Number(durationHours);
 }else{
   const p=db.prepare('SELECT * FROM packages WHERE id=?').get(packageId);
   if(!p)return res.status(404).json({error:'Package not found'});
   total=p.price*Number(people);
 }
 const advance=Math.round(total*.10),remaining=total-advance,bookingCode=code();
 const r=db.prepare(`INSERT INTO bookings
 (booking_code,kind,tourist_name,tourist_email,destination,tour_date,people,guide_id,package_id,duration_hours,total,advance,remaining,meeting_location)
 VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(bookingCode,kind,touristName,touristEmail,destination,tourDate||null,people,guideId||null,packageId||null,durationHours,total,advance,remaining,kind==='guide'?'Meeting point will be shared after advance payment.':null);
 res.status(201).json({id:r.lastInsertRowid,bookingCode,total,advance,remaining,status:'CONFIRMED'});
});
app.get('/api/bookings/:code',(req,res)=>{
 const b=db.prepare(`SELECT b.*,g.name guide_name,g.languages guide_languages,p.title package_title
 FROM bookings b LEFT JOIN guides g ON g.id=b.guide_id LEFT JOIN packages p ON p.id=b.package_id WHERE booking_code=?`).get(req.params.code);
 if(!b)return res.status(404).json({error:'Booking not found'});
 res.json(b);
});
app.patch('/api/bookings/:code/status',(req,res)=>{
 const allowed=['CONFIRMED','COMPLETED','CANCELLED'];
 if(!allowed.includes(req.body.status))return res.status(400).json({error:'Invalid status'});
 const r=db.prepare('UPDATE bookings SET status=? WHERE booking_code=?').run(req.body.status,req.params.code);
 if(!r.changes)return res.status(404).json({error:'Booking not found'});
 res.json({message:'Status updated'});
});
app.post('/api/reviews',(req,res)=>{
 const {bookingId,guideId,rating,comment=''}=req.body;
 if(!bookingId||!guideId||!rating)return res.status(400).json({error:'Missing review details'});
 const booking=db.prepare('SELECT * FROM bookings WHERE id=? AND status=?').get(bookingId,'COMPLETED');
 if(!booking)return res.status(400).json({error:'Booking must be completed before reviewing'});
 const tx=db.transaction(()=>{
   db.prepare('INSERT INTO reviews(booking_id,guide_id,rating,comment) VALUES(?,?,?,?)').run(bookingId,guideId,rating,comment);
   const stats=db.prepare('SELECT AVG(rating) avg,COUNT(*) count FROM reviews WHERE guide_id=?').get(guideId);
   db.prepare('UPDATE guides SET rating=?,reviews=? WHERE id=?').run(Number(stats.avg.toFixed(1)),stats.count,guideId);
 });
 tx(); res.status(201).json({message:'Review added'});
});

app.get('/api/admin/stats',(req,res)=>{
 const stats={
   guides:db.prepare('SELECT COUNT(*) c FROM guides').get().c,
   packages:db.prepare('SELECT COUNT(*) c FROM packages').get().c,
   bookings:db.prepare('SELECT COUNT(*) c FROM bookings').get().c,
   revenue:db.prepare('SELECT COALESCE(SUM(advance),0) c FROM bookings WHERE status<>\'CANCELLED\'').get().c
 };
 res.json(stats);
});

app.listen(4000,()=>console.log('LocalLoop API running on http://localhost:4000'));
