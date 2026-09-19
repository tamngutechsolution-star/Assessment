
const KEY='school_admin_v3';
const defaults={
 school:{name:'Example Primary & Secondary School',code:'SCH-001',address:'Port Moresby, Papua New Guinea',phone:'+675 000 0000',email:'school@example.com',principal:'School Principal',motto:'Education for Excellence'},
 students:[
  {id:'ST001',name:'John Peter',gender:'Male',dob:'2012-03-12',className:'Grade 6',guardian:'Peter John',status:'Active'},
  {id:'ST002',name:'Mary Simon',gender:'Female',dob:'2011-08-20',className:'Grade 6',guardian:'Simon Mary',status:'Active'},
  {id:'ST003',name:'David Paul',gender:'Male',dob:'2010-11-02',className:'Grade 7',guardian:'Paul David',status:'Active'}
 ],
 teachers:[
  {id:'T001',name:'Mr. James Kari',phone:'70000001',email:'james@school.com',subject:'Mathematics',className:'Grade 6'},
  {id:'T002',name:'Ms. Anna Kila',phone:'70000002',email:'anna@school.com',subject:'English',className:'Grade 7'}
 ],
 classes:[
  {id:'C001',name:'Grade 6',stream:'A',room:'Room 6',teacher:'Mr. James Kari',status:'Active'},
  {id:'C002',name:'Grade 7',stream:'A',room:'Room 7',teacher:'Ms. Anna Kila',status:'Active'}
 ],
 subjects:[
  {id:'SUB001',code:'MAT',name:'Mathematics',department:'Science',teacher:'Mr. James Kari',max:100},
  {id:'SUB002',code:'ENG',name:'English',department:'Languages',teacher:'Ms. Anna Kila',max:100},
  {id:'SUB003',code:'SCI',name:'Science',department:'Science',teacher:'Mr. James Kari',max:100}
 ],
 assessments:[
  {id:'A001',student:'ST001',subject:'Mathematics',term:'Term 1',assessment:'Mid Term',mark:82},
  {id:'A002',student:'ST001',subject:'English',term:'Term 1',assessment:'Mid Term',mark:76},
  {id:'A003',student:'ST002',subject:'Mathematics',term:'Term 1',assessment:'Mid Term',mark:91}
 ],
 attendance:[
  {id:'AT001',date:'2026-01-15',student:'ST001',className:'Grade 6',status:'Present',remarks:''},
  {id:'AT002',date:'2026-01-15',student:'ST002',className:'Grade 6',status:'Present',remarks:''},
  {id:'AT003',date:'2026-01-15',student:'ST003',className:'Grade 7',status:'Absent',remarks:'Sick'}
 ],
 grades:[
  {id:'G1',grade:'A',min:80,max:100,remark:'Excellent'},
  {id:'G2',grade:'B',min:70,max:79,remark:'Very Good'},
  {id:'G3',grade:'C',min:60,max:69,remark:'Good'},
  {id:'G4',grade:'D',min:50,max:59,remark:'Satisfactory'},
  {id:'G5',grade:'E',min:0,max:49,remark:'Needs Improvement'}
 ],
 users:[{id:'U001',username:'admin',name:'System Administrator',role:'Administrator',status:'Active'}],
 settings:{year:'2026',term:'1',motto:'Education for Excellence',currency:'PGK'}
};
let db=JSON.parse(localStorage.getItem(KEY)||'null')||structuredClone(defaults), editState=null;

function saveDB(){localStorage.setItem(KEY,JSON.stringify(db));refreshAll()}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function id(prefix){return prefix+Date.now().toString(36).slice(-6).toUpperCase()}
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function toggleMenu(){document.getElementById('sidebar').classList.toggle('open')}
function showPage(page){
 document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));document.getElementById(page).classList.add('active');
 document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
 const labels={dashboard:'Dashboard',students:'Students',teachers:'Teachers',classes:'Classes',subjects:'Subjects',assessments:'Assessments',attendance:'Attendance',reports:'Report Cards',school:'School Profile',grading:'Grading Scale',users:'Users',settings:'Settings'};
 document.getElementById('pageTitle').textContent=labels[page]||'Dashboard';document.getElementById('sidebar').classList.remove('open');
}
document.querySelectorAll('.nav button').forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.getElementById('dateText').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});

function renderDashboard(){
 document.getElementById('statStudents').textContent=db.students.length;document.getElementById('statTeachers').textContent=db.teachers.length;
 document.getElementById('statClasses').textContent=db.classes.length;document.getElementById('statAssessments').textContent=db.assessments.length;
 const avg=db.assessments.length?db.assessments.reduce((a,b)=>a+Number(b.mark),0)/db.assessments.length:0;
 const ar=db.attendance.length?db.attendance.filter(x=>x.status==='Present').length/db.attendance.length*100:0;
 document.getElementById('avgScore').textContent=avg.toFixed(1)+'%';document.getElementById('avgBar').style.width=Math.min(avg,100)+'%';
 document.getElementById('attendanceRate').textContent=ar.toFixed(1)+'%';document.getElementById('attendanceBar').style.width=Math.min(ar,100)+'%';
 document.getElementById('currentTerm').textContent=db.settings.term;
 const rows=db.students.slice(-5).reverse().map(s=>`<tr><td><b>${esc(s.name)}</b></td><td>${esc(s.id)}</td><td>${esc(s.className)}</td><td>${esc(s.gender)}</td><td><span class="badge green">${esc(s.status)}</span></td><td><button class="btn sm secondary" onclick="editRecord('student','${s.id}')">✏ Edit</button></td></tr>`).join('');
 document.getElementById('recentStudents').innerHTML=rows||'<tr><td colspan="6" class="empty">No students found.</td></tr>';
}
function renderStudents(){
 const q=(document.getElementById('studentSearch')?.value||'').toLowerCase(), f=document.getElementById('studentClassFilter');
 if(f)f.innerHTML='<option value="">All Classes</option>'+db.classes.map(c=>`<option>${esc(c.name)}</option>`).join('');
 const filter=f?.value||'';
 const rows=db.students.filter(s=>(!q||[s.id,s.name,s.className].join(' ').toLowerCase().includes(q))&&(!filter||s.className===filter)).map(s=>`<tr><td>${esc(s.id)}</td><td><b>${esc(s.name)}</b></td><td>${esc(s.gender)}</td><td>${esc(s.dob)}</td><td>${esc(s.className)}</td><td>${esc(s.guardian)}</td><td><span class="badge green">${esc(s.status)}</span></td><td><button class="btn sm secondary" onclick="editRecord('student','${s.id}')">✏ Edit</button> <button class="btn sm danger" onclick="deleteRecord('students','${s.id}')">🗑 Delete</button></td></tr>`).join('');
 document.getElementById('studentTable').innerHTML=rows||'<tr><td colspan="8" class="empty">No students found.</td></tr>';
}
function renderTeachers(){
 const q=(document.getElementById('teacherSearch')?.value||'').toLowerCase();
 const rows=db.teachers.filter(t=>[t.id,t.name,t.subject,t.className].join(' ').toLowerCase().includes(q)).map(t=>`<tr><td>${t.id}</td><td><b>${esc(t.name)}</b></td><td>${esc(t.phone)}</td><td>${esc(t.email)}</td><td>${esc(t.subject)}</td><td>${esc(t.className)}</td><td><button class="btn sm secondary" onclick="editRecord('teacher','${t.id}')">✏ Edit</button> <button class="btn sm danger" onclick="deleteRecord('teachers','${t.id}')">🗑 Delete</button></td></tr>`).join('');
 document.getElementById('teacherTable').innerHTML=rows||'<tr><td colspan="7" class="empty">No teachers found.</td></tr>';
}
function renderClasses(){document.getElementById('classTable').innerHTML=db.classes.map(c=>`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.stream)}</td><td>${esc(c.room)}</td><td>${esc(c.teacher)}</td><td>${db.students.filter(s=>s.className===c.name).length}</td><td><span class="badge green">${esc(c.status)}</span></td><td><button class="btn sm secondary" onclick="editRecord('class','${c.id}')">✏ Edit</button> <button class="btn sm danger" onclick="deleteRecord('classes','${c.id}')">🗑 Delete</button></td></tr>`).join('')||'<tr><td colspan="7" class="empty">No classes found.</td></tr>'}
function renderSubjects(){document.getElementById('subjectTable').innerHTML=db.subjects.map(s=>`<tr><td>${esc(s.code)}</td><td><b>${esc(s.name)}</b></td><td>${esc(s.department)}</td><td>${esc(s.teacher)}</td><td>${esc(s.max)}</td><td><button class="btn sm secondary" onclick="editRecord('subject','${s.id}')">✏ Edit</button> <button class="btn sm danger" onclick="deleteRecord('subjects','${s.id}')">🗑 Delete</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No subjects found.</td></tr>'}
function studentName(id){return db.students.find(x=>x.id===id)?.name||id}
function renderAssessments(){
 const term=document.getElementById('assessmentTerm')?.value||'Term 1';
 const rows=db.assessments.filter(a=>a.term===term).map(a=>`<tr><td>${esc(studentName(a.student))}</td><td>${esc(a.subject)}</td><td>${esc(a.term)}</td><td>${esc(a.assessment)}</td><td><b>${a.mark}%</b></td><td><span class="badge ${grade(a.mark)==='A'?'green':grade(a.mark)==='E'?'red':'blue'}">${grade(a.mark)}</span></td><td><button class="btn sm secondary" onclick="editRecord('assessment','${a.id}')">✏ Edit</button> <button class="btn sm danger" onclick="deleteRecord('assessments','${a.id}')">🗑 Delete</button></td></tr>`).join('');
 document.getElementById('assessmentTable').innerHTML=rows||'<tr><td colspan="7" class="empty">No assessments for this term.</td></tr>';
}
function renderAttendance(){document.getElementById('attendanceTable').innerHTML=db.attendance.slice().reverse().map(a=>`<tr><td>${esc(a.date)}</td><td>${esc(studentName(a.student))}</td><td>${esc(a.className)}</td><td><span class="badge ${a.status==='Present'?'green':'red'}">${esc(a.status)}</span></td><td>${esc(a.remarks)}</td><td><button class="btn sm secondary" onclick="editRecord('attendance','${a.id}')">✏ Edit</button> <button class="btn sm danger" onclick="deleteRecord('attendance','${a.id}')">🗑 Delete</button></td></tr>`).join('')||'<tr><td colspan="6" class="empty">No attendance records.</td></tr>'}
function grade(mark){const g=db.grades.find(x=>Number(mark)>=Number(x.min)&&Number(mark)<=Number(x.max));return g?.grade||'N/A'}
function renderReports(){
 const term=document.getElementById('reportTerm')?.value||'Yearly';
 document.getElementById('reportCards').innerHTML=db.students.map(s=>{
   const arr=db.assessments.filter(a=>a.student===s.id&&(term==='Yearly'||a.term===term));
   const avg=arr.length?arr.reduce((x,a)=>x+Number(a.mark),0)/arr.length:0;
   const subjects=arr.length?arr.map(a=>`<div class="grade-box"><span>${esc(a.subject)} <small style="color:#94a3b8">(${esc(a.term)})</small></span><b>${a.mark}% • ${grade(a.mark)}</b></div>`).join(''):'<p style="color:#64748b">No assessment records available.</p>';
   return `<div class="panel report-card"><div class="panel-head"><div><h3>${esc(s.name)}</h3><small>${esc(s.id)} • ${esc(s.className)}</small></div><div><b>Average: ${avg.toFixed(1)}%</b><br><span class="badge blue">Position calculated from records</span></div></div>${subjects}</div>`;
 }).join('')||'<div class="empty">No students found.</div>';
}
function renderSchool(){const s=db.school;document.getElementById('schoolProfile').innerHTML=`<div class="report-card"><h2>${esc(s.name)}</h2><p>${esc(s.motto)}</p><div class="form-grid"><div><b>School Code</b><p>${esc(s.code)}</p></div><div><b>Principal</b><p>${esc(s.principal)}</p></div><div><b>Address</b><p>${esc(s.address)}</p></div><div><b>Phone</b><p>${esc(s.phone)}</p></div><div><b>Email</b><p>${esc(s.email)}</p></div></div></div>`}
function renderGrades(){document.getElementById('gradeTable').innerHTML=db.grades.map(g=>`<tr><td><b>${g.grade}</b></td><td>${g.min}%</td><td>${g.max}%</td><td>${esc(g.remark)}</td><td><button class="btn sm secondary" onclick="editRecord('grade','${g.id}')">✏ Edit</button> <button class="btn sm danger" onclick="deleteRecord('grades','${g.id}')">🗑 Delete</button></td></tr>`).join('')}
function renderUsers(){document.getElementById('userTable').innerHTML=db.users.map(u=>`<tr><td>${esc(u.username)}</td><td>${esc(u.name)}</td><td>${esc(u.role)}</td><td><span class="badge green">${esc(u.status)}</span></td><td><button class="btn sm secondary" onclick="editRecord('user','${u.id}')">✏ Edit</button> <button class="btn sm danger" onclick="deleteRecord('users','${u.id}')">🗑 Delete</button></td></tr>`).join('')}
function refreshAll(){renderDashboard();renderStudents();renderTeachers();renderClasses();renderSubjects();renderAssessments();renderAttendance();renderReports();renderSchool();renderGrades();renderUsers();document.getElementById('setYear').value=db.settings.year;document.getElementById('setTerm').value=db.settings.term;document.getElementById('setMotto').value=db.settings.motto;document.getElementById('setCurrency').value=db.settings.currency}

const forms={
student:{title:'Student',collection:'students',fields:[['id','Student ID','text'],['name','Full Name','text'],['gender','Gender','select','Male|Female|Other'],['dob','Date of Birth','date'],['className','Class','selectClass'],['guardian','Parent / Guardian','text'],['status','Status','select','Active|Inactive']]},
teacher:{title:'Teacher',collection:'teachers',fields:[['id','Teacher ID','text'],['name','Full Name','text'],['phone','Phone','text'],['email','Email','email'],['subject','Main Subject','text'],['className','Class','selectClass']]},
class:{title:'Class',collection:'classes',fields:[['id','Class ID','text'],['name','Class Name','text'],['stream','Stream','text'],['room','Room','text'],['teacher','Class Teacher','selectTeacher'],['status','Status','select','Active|Inactive']]},
subject:{title:'Subject',collection:'subjects',fields:[['id','Subject ID','text'],['code','Subject Code','text'],['name','Subject Name','text'],['department','Department','text'],['teacher','Teacher','selectTeacher'],['max','Maximum Mark','number']]},
assessment:{title:'Assessment',collection:'assessments',fields:[['id','Assessment ID','text'],['student','Student','selectStudent'],['subject','Subject','selectSubject'],['term','Term','select','Term 1|Term 2|Term 3|Term 4'],['assessment','Assessment Type','select','Class Test|Assignment|Mid Term|End Term|Examination'],['mark','Mark (%)','number']]},
attendance:{title:'Attendance',collection:'attendance',fields:[['id','Attendance ID','text'],['date','Date','date'],['student','Student','selectStudent'],['className','Class','selectClass'],['status','Status','select','Present|Absent|Late|Excused'],['remarks','Remarks','text']]},
grade:{title:'Grading Scale',collection:'grades',fields:[['id','Grade ID','text'],['grade','Grade','text'],['min','Minimum %','number'],['max','Maximum %','number'],['remark','Remark','text']]},
user:{title:'User',collection:'users',fields:[['id','User ID','text'],['username','Username','text'],['name','Full Name','text'],['role','Role','select','Administrator|Principal|Teacher|Staff'],['status','Status','select','Active|Inactive']]}
};
function fieldHTML(f,v=''){
 const [key,label,type,opt]=f;let input='';
 if(type==='select')input=`<select name="${key}" ${key==='id'?'disabled':''}>${opt.split('|').map(o=>`<option ${String(v)===o?'selected':''}>${o}</option>`).join('')}</select>`;
 else if(type==='selectClass')input=`<select name="${key}">${db.classes.map(c=>`<option ${v===c.name?'selected':''}>${esc(c.name)}</option>`).join('')}</select>`;
 else if(type==='selectTeacher')input=`<select name="${key}">${db.teachers.map(t=>`<option ${v===t.name?'selected':''}>${esc(t.name)}</option>`).join('')}</select>`;
 else if(type==='selectStudent')input=`<select name="${key}">${db.students.map(s=>`<option value="${s.id}" ${v===s.id?'selected':''}>${esc(s.name)} (${s.id})</option>`).join('')}</select>`;
 else if(type==='selectSubject')input=`<select name="${key}">${db.subjects.map(s=>`<option ${v===s.name?'selected':''}>${esc(s.name)}</option>`).join('')}</select>`;
 else input=`<input type="${type}" name="${key}" value="${esc(v)}" ${key==='id'?'readonly':''} required>`;
 return `<div class="field"><label>${label}</label>${input}</div>`;
}
function openModal(type,data=null){
 editState=data?{type,id:data.id}:null;const f=forms[type];document.getElementById('modalTitle').textContent=(data?'Edit ':'Add ')+f.title;
 document.getElementById('modalBody').innerHTML=f.fields.map(x=>fieldHTML(x,data?.[x[0]]|| (x[0]==='id'?id(type.substring(0,2).toUpperCase()):''))).join('');
 document.getElementById('modal').classList.add('open');
}
function closeModal(){document.getElementById('modal').classList.remove('open');editState=null}
function saveModal(e){
 e.preventDefault();const data=Object.fromEntries(new FormData(e.target).entries());const type=editState?.type||Object.keys(forms).find(k=>forms[k].collection===currentCollection);
 const f=forms[type];const arr=db[f.collection];const idx=editState?arr.findIndex(x=>x.id===editState.id):-1;
 if(['mark','min','max'].some(k=>k in data)){} if(data.mark!==undefined)data.mark=Math.max(0,Math.min(100,Number(data.mark)));if(data.min!==undefined)data.min=Number(data.min);if(data.max!==undefined)data.max=Number(data.max);if(data.max!==undefined)data.max=Number(data.max);
 if(idx>=0)arr[idx]={...arr[idx],...data};else arr.push(data);closeModal();saveDB();toast(editState?'Record updated successfully':'Record added successfully');
}
let currentCollection='students';
function editRecord(type,recordId){const f=forms[type],data=db[f.collection].find(x=>x.id===recordId);if(data)openModal(type,data)}
function deleteRecord(collection,recordId){if(confirm('Delete this record? This action cannot be undone.')){db[collection]=db[collection].filter(x=>x.id!==recordId);saveDB();toast('Record deleted successfully')}}
function editSchool(){
 const fields=[['name','School Name','text'],['code','School Code','text'],['address','Address','text'],['phone','Phone','text'],['email','Email','email'],['principal','Principal','text'],['motto','School Motto','text']];
 document.getElementById('modalTitle').textContent='Edit School Profile';document.getElementById('modalBody').innerHTML=fields.map(f=>fieldHTML(f,db.school[f[0]])).join('');
 document.getElementById('modalForm').onsubmit=e=>{e.preventDefault();db.school={...db.school,...Object.fromEntries(new FormData(e.target).entries())};closeModal();saveDB();toast('School profile updated')};document.getElementById('modal').classList.add('open');
}
function saveSettings(){db.settings={year:document.getElementById('setYear').value,term:document.getElementById('setTerm').value,motto:document.getElementById('setMotto').value,currency:document.getElementById('setCurrency').value};db.school.motto=db.settings.motto;saveDB();toast('Settings saved')}
function exportData(){const blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='school-admin-backup.json';a.click();URL.revokeObjectURL(a.href);toast('Backup exported')}
function importData(e){const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);saveDB();toast('Backup imported')}catch{alert('Invalid backup file')}};r.readAsText(file)}
function resetData(){if(confirm('Reset all data to the original demo data?')){db=structuredClone(defaults);saveDB();toast('Demo data restored')}}
function printReports(){const content=document.getElementById('reportCards').innerHTML;const w=window.open('','_blank');w.document.write(`<html><head><title>School Report Cards</title><style>body{font-family:Arial;padding:30px}.panel{border:1px solid #ddd;padding:18px;margin:15px 0;border-radius:10px}.grade-box{display:flex;justify-content:space-between;padding:8px;border-bottom:1px solid #ddd}</style></head><body><h1>${esc(db.school.name)}</h1><p>${esc(db.school.address)}</p>${content}</body></html>`);w.document.close();w.print()}
refreshAll();
