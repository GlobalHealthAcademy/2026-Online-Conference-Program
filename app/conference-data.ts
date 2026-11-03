import { SPEAKER_BIOGRAPHIES } from "./speaker-bios";
import { MASTER_SESSION_CONTENT } from "./master-session-content";
import SUBMITTED_BIOS from "./submitted-bios.json";
import SUBMITTED_PHOTOS from "./submitted-photos.json";
import SPEAKER_TITLES from "./speaker-titles.json";

/**
 * PROGRAM DATA
 * ------------------------
 * Verified against the September 2026 master program.
 * Existing session IDs are retained where possible so attendee-saved
 * selections continue to work after program updates.
 *
 * Routine program updates happen in this file.
 *
 * - Add or edit sessions in SESSIONS.
 * - Use p("Full Name") wherever a person appears. The speaker directory and
 *   initials avatars are generated automatically from those names.
 * - Add or edit biographies in speaker-bios.ts. Stored biographies are
 *   applied automatically when a matching person is added to the program.
 * - Add a photo URL in SPEAKER_PHOTOS. If omitted, initials appear.
 * - Keep times in 24-hour HH:MM format so sessions remain correctly sorted.
 * - Use "Room TBD" or "Location TBD" until the program confirms a location.
 */
export type Speaker = { id:string; name:string; role:string; organization?:string; bio:string; photo?:string; attendance?:"Virtual" };
export type SubSession = { time?:string; title:string; summary?:string; speakerIds?:string[] };
export type SessionType = "Registration"|"Plenary"|"Breakout"|"Break"|"Lunch"|"Special"|"Poster Session"|"Dinner"|"Workshop";
export type Session = {
  id:string; day:"2026-09-28"|"2026-09-29"|"2026-09-30"; start:string; end?:string;
  type:SessionType; title:string; summary?:string; room:string; moderatorId?:string; additionalModeratorIds?:string[];
  speakerIds:string[]; peopleLabel?:string; topics:string[]; subSessions?:SubSession[];
  learningObjectives?:string[]; recordingUrl?:string; recordingUnavailable?:boolean;
};

export const CONFERENCE = {
  name:"Fifth Annual Global Health Conference",
  shortName:"2026 Global Health Conference",
  dates:"September 28–30, 2026",
  venue:"Heritage Hotel & Conference Center",
  location:"Southbury, Connecticut, USA",
  theme:"From Partnership to Practice: Global Collaborators Shaping the Future of Education in Global Health",
  venueUrl:"https://www.heritagesouthbury.com/",
  mainWebsiteUrl:"https://www.theglobalhealthacademy.org",
};

const slugify=(name:string)=>name.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const assetUrl=(path?:string)=>path ? `${import.meta.env.BASE_URL}${path.replace(/^\/+/,"")}` : undefined;
const SPEAKER_BIOS:Record<string,string>=Object.fromEntries(
  SPEAKER_BIOGRAPHIES.flatMap((entry)=>[entry.name,...(entry.aliases||[])].map((name)=>[slugify(name),entry.bio]))
);
const people=new Map<string,string>();
const p=(name:string)=>{const id=slugify(name);people.set(id,name);return id};
const ROOM="Constitution Plenary Room";
const ROOM_TBD="Room TBD";
const LOCATION_TBD="Location TBD";

const PROGRAM_SESSIONS:Session[]=[
  // MONDAY, SEPTEMBER 28
  {id:"mon-registration",day:"2026-09-28",start:"07:30",end:"08:30",type:"Registration",title:"Registration and Breakfast",room:"Lower Lobby",speakerIds:[],topics:["Registration","Breakfast"]},
  {id:"mon-welcome",day:"2026-09-28",start:"08:30",end:"09:00",type:"Special",title:"Welcome and Introductions",room:ROOM,speakerIds:[p("Aparna Oltikar"),p("Michelle Robertson")],peopleLabel:"Leads",topics:["Welcome","Introductions"]},
  {id:"mon-plenary-1",day:"2026-09-28",start:"09:00",end:"10:00",type:"Plenary",title:"Plenary Session #1: The Practice of Partnership: Collaborating to Transform Global Health Education",room:ROOM,moderatorId:p("Aparna Oltikar"),speakerIds:[p("Bulat Ziganshin"),p("Nelson Sewankambo"),p("Igor Gembitsky")],peopleLabel:"Speakers",topics:["Partnership","Global Health Education","Artificial Intelligence"],subSessions:[
    {title:"Keynote Address: From Vision to Action: Major Goals and Strategic Directions for the Global Health Academy",speakerIds:[p("Bulat Ziganshin")]},
    {title:"Keynote Address: Academic Responsibility in Global Health Partnerships",speakerIds:[p("Nelson Sewankambo")]},
    {title:"Sneak peek: Introducing the GHA Workshop on Artificial Intelligence for Global Health Practice",speakerIds:[p("Igor Gembitsky")]},
  ]},
  {id:"mon-coffee-am",day:"2026-09-28",start:"10:00",end:"10:30",type:"Break",title:"Coffee Break and Poster Viewing",room:"Lincoln Room",speakerIds:[],topics:["Coffee Break","Posters"]},
  {id:"mon-breakout-1",day:"2026-09-28",start:"10:30",end:"12:00",type:"Breakout",title:"Breakout #1: Global Health Innovation Idea Challenge Pitchfest – Presentations of Finalists",room:ROOM,moderatorId:p("Stephen Scholand"),speakerIds:[p("Jean Annette Ibo"),p("Cladious Verenga"),p("Catherine Nakibuule"),p("Joshua Matsiko"),p("Albert Balace"),p("Patricia Grau Grullon"),p("Maria Della C. Raneses"),p("Sula Matovu Ntanda"),p("Ruby Espares"),p("Quoc Bao Nguyen")],peopleLabel:"Finalists",topics:["Global Health Innovation","Pitchfest","Finalists"],subSessions:[
    {title:"Tahan Na: A Filipino Mental Health App Connecting Users to Licensed Professionals and Peer Spaces",speakerIds:[p("Jean Annette Ibo")]},
    {title:"MAMA-LINK Zimbabwe: A FetaMed-Enabled Community-to-Tertiary Maternal Risk, Ultrasound, Referral and Audit Network",speakerIds:[p("Cladious Verenga")]},
    {title:"Every Visit Counts: Integrating Equitable Early Autism Screening into Immunization Clinics in Uganda",speakerIds:[p("Catherine Nakibuule")]},
    {title:"ContinuCare: Integrated Medication Access, Continuity and Safety Ecosystem",speakerIds:[p("Joshua Matsiko")]},
    {title:"Sea Ambulance for Island Women of Malilipot",speakerIds:[p("Albert Balace")]},
    {title:"Scalable Quality Assurance System for Dental Light-Curing in Low-Resource Public Health Settings",speakerIds:[p("Patricia Grau Grullon")]},
    {title:"Climate-Resilient Community Health Preparedness During Extreme Weather Events in Legazpi City",speakerIds:[p("Maria Della C. Raneses")]},
    {title:"CareLink: Talk to a Specialist Doctor. Anytime. Anywhere.",speakerIds:[p("Sula Matovu Ntanda")]},
    {title:"Project Blood Connect Plus: Community Blood Donor Ecosystem for Emergency Blood Access",speakerIds:[p("Ruby Espares")]},
    {title:"On-Demand Healthcare Workforce Platform for LMICs and Southeast Asia",speakerIds:[p("Quoc Bao Nguyen")]},
  ]},
  {id:"mon-breakout-2",day:"2026-09-28",start:"10:30",end:"12:00",type:"Breakout",title:"Breakout #2: Co-Creating a Transnational Curriculum for Global Education in Healthcare",room:"Congress Room",moderatorId:p("Marcos Nunez"),speakerIds:[p("Mark Kaddumukasa"),p("Abhay Gaidhane"),p("Ofelia Samar-Sy"),p("Fiona Makoni"),p("Lam Dinh Tuan Hai"),p("Chuchard Punsawad"),p("Alexander Bazarchyan"),p("Vincent Setlhare"),p("Tracy Evans-Gilbert"),p("Christa Zehle"),p("Baby Boy Benjamin D. Nebres")],peopleLabel:"Panelists and Speakers",topics:["Curriculum","Global Education","Healthcare Education"],subSessions:[
    {title:"Designing a Transnational Curriculum with GH Academy Partners",speakerIds:[p("Marcos Nunez")]},
    {title:"From Partnership to Practice: Bicol University as a University for Humanity Advancing Global Health Education through Sustainable Community Collaboration",speakerIds:[p("Baby Boy Benjamin D. Nebres")]},
  ]},
  {id:"mon-breakout-3",day:"2026-09-28",start:"10:30",end:"12:00",type:"Breakout",title:"Breakout #3: Strengthening Global Mental Health: Building Capacity Through Education and Collaboration",room:"Madison Room",moderatorId:p("Charles Herrick"),speakerIds:[p("Krista Buckley"),p("Noeline Nakasujja"),p("Rudy Ruggles"),p("Arinda Vivian"),p("Innocent Immaculate Acan"),p("Nankya Josephine"),p("Fatumah Ali"),p("Keneilwe Molebatsi"),p("Elina Mukhametshina")],peopleLabel:"Panelists and Speakers",topics:["Global Mental Health","Education","Collaboration"],subSessions:[
    {title:"Opening Remarks: From Scholars to Systems—Multiplying Impact in Global Mental Health",speakerIds:[p("Rudy Ruggles")]},
    {title:"Prevalence and Factors Associated with Depression Among Primary Caregivers of Children with Autism Spectrum Disorder in Kampala, Uganda",speakerIds:[p("Arinda Vivian")]},
    {title:"Substance Use Disorders Among Adults with Bipolar Disorder at Butabika National Referral Mental Hospital",speakerIds:[p("Innocent Immaculate Acan")]},
    {title:"Prevalence and Factors Associated with Recurrences Among Older Patients with Bipolar Disorder at Two National Referral Hospitals in Uganda",speakerIds:[p("Nankya Josephine")]},
    {title:"Prevalence, Associated Factors and Common Co-Occurring Mental Health Conditions of Gambling Disorder Among Makerere University Students",speakerIds:[p("Fatumah Ali")]},
    {title:"Learning through Stories and Encounters – Creating Meaningful Cultural Experiences in Healthcare Education",speakerIds:[p("Keneilwe Molebatsi")]},
    {title:"Introducing the New Partner-Wide Global Mental Health Initiative",speakerIds:[p("Elina Mukhametshina")]},
  ]},
  {id:"mon-breakout-4",day:"2026-09-28",start:"10:30",end:"12:00",type:"Breakout",title:"Breakout #4: Empowering the Next Generation: The Elvis A. Novas Youth Academy for Leaders",room:"Senate Room",moderatorId:p("Aparna Oltikar"),speakerIds:[p("Dawn Myles"),p("Elvis Novas"),p("Jason Nova"),p("Eva Duran"),p("Jacqueline Cabrera"),p("Javier Rincon"),p("Carolyn Guarino"),p("Bulat Ziganshin")],peopleLabel:"Panelists",topics:["Youth Academy","Leadership"]},
  {id:"mon-breakout-5",day:"2026-09-28",start:"10:30",end:"12:00",type:"Breakout",title:"Breakout #5: Global Perspectives on Women’s Health: Challenges, Innovation, and Partnership",room:"Jefferson Room",moderatorId:p("Linus Chuang"),additionalModeratorIds:[p("Cosima Neumann")],speakerIds:[p("Ewalina Jeyanesan"),p("Sandra Lindsay"),p("Xavier Brown"),p("Cladious Verenga"),p("Catherine Nakibuule")],peopleLabel:"Speakers",topics:["Women’s Health","Innovation","Partnership"],subSessions:[
    {title:"Going Global: Transforming Gynecologic Cancer Care Through Education, Training, and Partnership",speakerIds:[p("Linus Chuang")]},
    {title:"Global Health Elective in Obstetrics and Gynecology in Botswana",speakerIds:[p("Cosima Neumann")]},
    {title:"Uterine Rupture: Management of an Obstetric Emergency at a Government Hospital in Botswana (abstract presentation)",speakerIds:[p("Ewalina Jeyanesan")]},
    {title:"Establishing a Women’s Health Program in Jamaica",speakerIds:[p("Sandra Lindsay"),p("Xavier Brown")]},
    {title:"Training Frontline Providers in Basic Obstetric Ultrasound to Promote Healthy Pregnancy in Zimbabwe (abstract presentation)",speakerIds:[p("Cladious Verenga")]},
    {title:"Helping Babies Breathe, Helping Mothers Survive: Seven Years of Transformative Global Partnership and Practice at St. Stephen’s Hospital, Uganda (abstract presentation)",speakerIds:[p("Catherine Nakibuule")]},
  ]},
  {id:"mon-thematic-lunch",day:"2026-09-28",start:"12:00",end:"13:00",type:"Lunch",title:"Lunch Break with Thematic Discussions",summary:"Global Mental Health; Journal of the Global Health Academy; Artificial Intelligence in Global Health; Networking opportunities; Collaboration in Research; Multidirectional Exchange; GHIIC Pitchfest; Nursing in Global Health; Global Health Electives; Youth Academy; Entrepreneurship and Innovation in Global Health; Global Health Scholars Program; Women’s Health.",room:"Terrace Room",speakerIds:[],topics:["Lunch","Thematic Discussions"]},
  {id:"mon-plenary-2",day:"2026-09-28",start:"13:00",end:"14:30",type:"Plenary",title:"Plenary Session #2: Research Collaborations in Global Health: Strengthening the Role of the Global South",room:ROOM,moderatorId:p("Aída Mencía Ripley"),speakerIds:[p("Zahir Quazi"),p("Abhay Gaidhane"),p("Deepak Saxena")],peopleLabel:"Keynote Speakers",topics:["Research Collaboration","Global South","Global Health"],subSessions:[
    {title:"Keynote Lecture: Research Collaborations in Global Health: Strengthening the Role of the Global South",speakerIds:[p("Zahir Quazi"),p("Abhay Gaidhane"),p("Deepak Saxena")]},
    {title:"Plenary Panel Discussion",speakerIds:[p("Marcos Nunez"),p("Auemphon Mordmuang"),p("Alexander Bazarchyan"),p("Phung Nguyen The Nguyen"),p("Lany Maceda"),p("Vincent Setlhare"),p("Shalote Chipamaunga Bamu"),p("Tracy Evans-Gilbert"),p("Mark Kaddumukasa")]},
  ]},
  {id:"mon-group-photo",day:"2026-09-28",start:"14:30",end:"14:45",type:"Special",title:"Group Photo of All Conference Attendees",room:ROOM,speakerIds:[],topics:["Group Photo"]},
  {id:"mon-coffee-pm",day:"2026-09-28",start:"14:45",end:"15:00",type:"Break",title:"Coffee Break and Poster Viewing",room:"Lincoln Room",speakerIds:[],topics:["Coffee Break","Posters"]},
  {id:"mon-plenary-3",day:"2026-09-28",start:"15:00",end:"17:00",type:"Plenary",title:"Plenary Session #3: Global Health Electives as a Catalyst for Medical Education",room:ROOM,moderatorId:p("Mariah McNamara"),speakerIds:[p("Shushanik Isahakyan"),p("Karen Gregorio"),p("Nonthapan Phasuk"),p("Pamela Jimenez Taveras"),p("Keneilwe Molebatsi"),p("Vo Ngoc Anh Tho"),p("Hamnah Khan"),p("Stephen Ash"),p("Anastasia Zholud"),p("Jerelyn Adviento"),p("Arya Kale"),p("Eunice Suberu"),p("Christopher Muyshondt"),p("Paul Wright"),p("Christina Laird"),p("Sunaina Rao")],peopleLabel:"Panelists and Speakers",topics:["Global Health Electives","Medical Education","Clinical Competencies"],subSessions:[
    {title:"Presentation #1: Global Health Electives for Students and Residents",speakerIds:[p("Anastasia Zholud")]},
    {title:"Presentation #2: Global Health Elective Curriculum at Bicol University",speakerIds:[p("Jerelyn Adviento")]},
    {title:"Abstract Presentation #3: GHE Electives Develop Clinical Competencies and Increase Physician Engagement with Underserved Communities",speakerIds:[p("Arya Kale"),p("Eunice Suberu")]},
    {title:"Abstract Presentation #4: Beyond the Clinic: Personal Reflections on a Six-Week Global Health Elective and the Case for Broader Exposure",speakerIds:[p("Christopher Muyshondt")]},
    {title:"Presentation #5: Establishing a Neurology-focused Partnership with the University of Botswana",speakerIds:[p("Paul Wright"),p("Christina Laird")]},
    {title:"Presentation #6: Global Health Electives for Neurology Residents in Botswana",speakerIds:[p("Sunaina Rao")]},
  ]},
  {id:"mon-poster",day:"2026-09-28",start:"17:00",end:"18:00",type:"Poster Session",title:"The Linde Poster Session",summary:"Global Health Sites Presentations; Global Health Innovation Idea Challenge Projects; Global Local: Youth Academy Posters.",room:"Lincoln Room",speakerIds:[p("Mariah McNamara"),p("Stephen Scholand"),p("Aparna Oltikar"),p("Stanley Kowalski")],peopleLabel:"Poster Professors",topics:["Posters","Global Health Sites","Global Health Innovation Idea Challenge","Youth Academy"]},
  {id:"mon-gala",day:"2026-09-28",start:"18:00",end:"20:30",type:"Dinner",title:"Gala Dinner and Awards Ceremony (By Invitation Only)",room:"Timbers Room",speakerIds:[],topics:["Gala Dinner","Awards Ceremony"]},

  // TUESDAY, SEPTEMBER 29
  {id:"tue-registration",day:"2026-09-29",start:"07:30",end:"08:30",type:"Registration",title:"Registration and Breakfast",room:"Lower Lobby",speakerIds:[],topics:["Registration","Breakfast"]},
  {id:"tue-plenary-4",day:"2026-09-29",start:"08:30",end:"10:00",type:"Plenary",title:"Plenary Session #4: Presentations of Applicant-Sites to Host the 2027 GH Conference",room:ROOM,moderatorId:p("Elina Mukhametshina"),speakerIds:[p("Evangeline Honrado"),p("Deepak Saxena")],peopleLabel:"Presenters",topics:["2027 Conference","Host Site"],subSessions:[
    {title:"Presentation #1: Application of the Philippines Partner-Site to Host the 2027 GH Conference",speakerIds:[p("Evangeline Honrado")]},
    {title:"Presentation #2: Application of the India Partner-Site to Host the 2027 GH Conference",speakerIds:[p("Deepak Saxena")]},
  ]},
  {id:"tue-coffee-am",day:"2026-09-29",start:"10:00",end:"10:30",type:"Break",title:"Coffee Break and Poster Viewing",room:"Lincoln Room",speakerIds:[],topics:["Coffee Break","Posters"]},
  {id:"tue-breakout-6",day:"2026-09-29",start:"10:30",end:"12:00",type:"Breakout",title:"Breakout #6: Learning Across Cultures: Advancing Intercultural Competence in Global Health",room:"Congress Room",moderatorId:p("Beth West"),speakerIds:[p("Judy Huang"),p("Andreas Hövener"),p("Pamela Jimenez Taveras"),p("Shushanik Isahakyan"),p("Moagisi Mogalakwe"),p("Karen Gregorio"),p("Pirada Yincharoen"),p("Ngo Van Cong"),p("Xavier Brown"),p("Aliyah Khan"),p("Susan Byekwaso"),p("Dilyara Nurkhametova"),p("Xenia Clemena"),p("All session participants")],peopleLabel:"Panelists and Speakers",topics:["Intercultural Competence","Global Health"],subSessions:[
    {title:"Why Intercultural Learning Matters in Global Health",speakerIds:[p("Beth West")]},
    {title:"Intercultural Development Curriculum Project: GHA Experience and Future Directions",speakerIds:[p("Dilyara Nurkhametova")]},
    {title:"GlobalUp Participant Reflection",speakerIds:[p("Pamela Jimenez Taveras")]},
    {title:"Global Health Scholar Reflection",speakerIds:[p("Xenia Clemena")]},
    {title:"Learning through Stories and Encounters – Creating Meaningful Cultural Experiences in Healthcare Education",speakerIds:[p("Andreas Hövener")]},
    {title:"Facilitated Discussion in Small Groups",speakerIds:[p("All session participants")]},
  ]},
  {id:"tue-breakout-7",day:"2026-09-29",start:"10:30",end:"12:00",type:"Breakout",title:"Breakout #7: Strengthening Health Professions Education in Zimbabwe: A Joint Master’s Program in Practice",room:"Madison Room",moderatorId:p("Shalote Chipamaunga Bamu"),speakerIds:[p("Cladious Verenga"),p("Blessing Chataika"),p("Fungisai Mapindu"),p("Zedson Phiri"),p("Regina Ashley Chigweremba"),p("Aparna Oltikar"),p("Elina Mukhametshina"),p("Remilyn Gonzales-Bates")],peopleLabel:"Panelists",topics:["Health Professions Education","Zimbabwe","Master’s Program"]},
  {id:"tue-breakout-8",day:"2026-09-29",start:"10:30",end:"12:00",type:"Breakout",title:"Breakout #8: Strengthening Medical Education Through Research and Scholarship",room:"Jefferson Room",moderatorId:p("Abhay Gaidhane"),speakerIds:[p("Lany Maceda"),p("Chuchard Punsawad"),p("Aída Mencía Ripley"),p("Deepak Saxena"),p("Shari Jardine"),p("Evangeline Honrado"),p("Douladel Tyndale"),p("Kevin Dieckhaus"),p("Robert Kalyesubula"),p("Andrea Green")],peopleLabel:"Panelists",topics:["Medical Education","Research","Scholarship"]},
  {id:"tue-breakout-9",day:"2026-09-29",start:"10:30",end:"12:00",type:"Breakout",title:"Breakout #9: Connecting Partner Sites: Multidirectional Exchange Across the Global Health Network",room:"Senate Room",moderatorId:p("Bulat Ziganshin"),speakerIds:[p("Alexander Bazarchyan"),p("Darlene Melk"),p("Vincent Setlhare"),p("Marcos Nunez"),p("Zahir Quazi"),p("Ofelia Samar-Sy"),p("Nonthapan Phasuk"),p("Vo Ngoc Anh Tho"),p("Tracy Evans-Gilbert"),p("Nelson Sewankambo"),p("Fiona Makoni"),p("Mariah McNamara"),p("Eric Cioe-Pena")],peopleLabel:"Panelists",topics:["Partner Sites","Multidirectional Exchange","Global Health Network"]},
  {id:"tue-poster",day:"2026-09-29",start:"12:00",end:"13:00",type:"Poster Session",title:"The Linde Poster Session",summary:"Global Health Sites Presentations; Student Presentations; Research Projects.",room:"Lincoln Room",speakerIds:[p("Marcos Nunez"),p("Vincent Setlhare"),p("Anastasia Zholud"),p("Darlene Melk")],peopleLabel:"Poster Professors",topics:["Posters","Global Health Sites","Student Presentations","Research Projects"]},
  {id:"tue-lunch",day:"2026-09-29",start:"13:00",end:"14:00",type:"Lunch",title:"Lunch Break with Thematic Discussions",summary:"Global Mental Health; Journal of the Global Health Academy; Artificial Intelligence in Global Health; Networking opportunities; Collaboration in Research; Multidirectional Exchange; GHIIC Pitchfest; Nursing in Global Health; Global Health Electives; Youth Academy; Entrepreneurship and Innovation in Global Health; Global Health Scholars Program; Women’s Health.",room:"Terrace Room",speakerIds:[],topics:["Lunch","Thematic Discussions"]},
  {id:"tue-plenary-5",day:"2026-09-29",start:"14:00",end:"15:00",type:"Plenary",title:"Plenary Session #5: Climate Change and Disaster Resilience: Lessons from Our Global Partner Network",room:ROOM,moderatorId:p("Deepak Saxena"),speakerIds:[p("Marcos Nunez"),p("Fiona Makoni"),p("Ricardo Isip"),p("Darlene Melk"),p("Jonathan Berkowitz"),p("Craig Smith")],peopleLabel:"Speakers",topics:["Climate Change","Disaster Resilience","Global Partner Network"],subSessions:[
    {title:"Presentation #1: Hurricane Response in Dominican Republic",speakerIds:[p("Marcos Nunez")]},
    {title:"Presentation #2: Extreme Drought and Severe Flooding in Zimbabwe",speakerIds:[p("Fiona Makoni")]},
    {title:"Presentation #3: Typhoon and Volcano Eruption Response in the Philippines",speakerIds:[p("Ricardo Isip")]},
    {title:"Presentation #4: Extreme Heat Perspective from Arizona",speakerIds:[p("Darlene Melk")]},
    {title:"Presentation #5: Strengthening Emergency Medical Systems: Lessons from Guyana",speakerIds:[p("Jonathan Berkowitz"),p("Craig Smith")]},
  ]},
  {id:"tue-coffee-pm",day:"2026-09-29",start:"15:00",end:"15:30",type:"Break",title:"Coffee Break and Poster Viewing",room:"Lincoln Room",speakerIds:[],topics:["Coffee Break","Posters"]},
  {id:"tue-breakout-10",day:"2026-09-29",start:"15:30",end:"17:00",type:"Breakout",title:"Breakout #10: Advancing Nursing in Global Health: Education, Leadership, and Partnership",room:"Jefferson Room",moderatorId:p("Jasper Tolarba"),speakerIds:[p("Jean Annette Ibo"),p("Remilyn Gonzales-Bates"),p("Michelle Vesce"),p("Cynthia O'Sullivan"),p("Heather Ferrillo"),p("Irina Ellison"),p("Michelle Lea"),p("Shalote Chipamaunga Bamu"),p("Maria Della C. Raneses"),p("Sopida Thipsawat"),p("Estherloy Katali"),p("Virginia Mawerewere")],peopleLabel:"Panelists",topics:["Nursing","Education","Leadership","Partnership"]},
  {id:"tue-breakout-11",day:"2026-09-29",start:"15:30",end:"17:00",type:"Breakout",title:"Breakout #11: Building a Global Platform for Scholarship: The Journal of the Global Health Academy",room:"Senate Room",moderatorId:p("Mitra Sadigh"),speakerIds:[p("Ritesh Vidhun"),p("Zahir Quazi"),p("Vincent Setlhare"),p("Alexander Bazarchyan"),p("Tracy Evans-Gilbert"),p("Ofelia Samar-Sy"),p("Aída Mencía Ripley"),p("Phung Nguyen The Nguyen"),p("Chuchard Punsawad"),p("Stephen Scholand"),p("Shari Jardine"),p("Christa Zehle"),p("Sean Nuremberg"),p("Bulat Ziganshin")],peopleLabel:"Panelists",topics:["Scholarship","Journal of the Global Health Academy"]},
  {id:"tue-breakout-12",day:"2026-09-29",start:"15:30",end:"17:00",type:"Breakout",title:"Breakout #12: Navigating Misinformation in Healthcare: Building Trust in an Era of Uncertainty",room:"Madison Room",moderatorId:p("Marcos Nunez"),speakerIds:[p("Daniil Anisimov"),p("Igor Gembitsky"),p("Deepak Saxena"),p("Moagisi Mogalakwe"),p("Nguyen Ngoc Tu"),p("Ricardo Isip"),p("Xavier Brown"),p("Nonthapan Phasuk"),p("Mariah McNamara"),p("Eric Cioe-Pena")],peopleLabel:"Panelists",topics:["Misinformation","Healthcare","Trust"]},
  {id:"tue-breakout-13",day:"2026-09-29",start:"15:30",end:"17:00",type:"Breakout",title:"Breakout #13: From Recognition to Impact: Reflections from GHIIC Winners, Award Recipients, and Scholars",room:"Congress Room",moderatorId:p("Stanley Kowalski"),speakerIds:[p("Auemphon Mordmuang"),p("Sabrina Kitaka"),p("Abhay Gaidhane"),p("Jerelyn Adviento"),p("Ninoska Abreu Placeres"),p("Tan Thi Minh Nguyen"),p("Keneilwe Molebatsi"),p("Thi Thu Thao Le"),p("Pimol Kanchalearnpong"),p("Cyrus A. Barrameda")],peopleLabel:"Panelists",topics:["GHIIC","Awards","Scholars"]},
  {id:"tue-break",day:"2026-09-29",start:"17:00",end:"17:30",type:"Break",title:"Break and Poster Viewing",room:"Lincoln Room",speakerIds:[],topics:["Break","Posters"]},
  {id:"tue-plenary-6",day:"2026-09-29",start:"17:30",end:"19:00",type:"Plenary",title:"Plenary Session #6: Presentation of New Partner Sites and Voting for the Host of the 2027 GH Conference",room:ROOM,moderatorId:p("Aparna Oltikar"),speakerIds:[p("Tracy Evans-Gilbert"),p("Darlene Melk"),p("Representatives of International Partner Sites")],peopleLabel:"Presenters",topics:["Partner Sites","2027 Conference","Voting"],subSessions:[
    {title:"Presentation of the Jamaica Site",speakerIds:[p("Tracy Evans-Gilbert")]},
    {title:"Presentation of the Arizona Site: Primary Healthcare for ALL on the US/Mexico Border",speakerIds:[p("Darlene Melk")]},
    {title:"PosterSpark Awards"},
    {title:"Vote for the Host of the 2027 Global Health Conference",speakerIds:[p("Representatives of International Partner Sites")]},
  ]},
  {id:"tue-international-dinner",day:"2026-09-29",start:"19:00",end:"21:00",type:"Dinner",title:"International Guests Dinner (International Guests only)",room:"Terrace Room",speakerIds:[],topics:["Dinner","International Guests"]},

  // WEDNESDAY, SEPTEMBER 30
  {id:"wed-registration",day:"2026-09-30",start:"07:30",end:"08:30",type:"Registration",title:"Registration and Breakfast",room:"Lower Lobby",speakerIds:[],topics:["Registration","Breakfast"]},
  {id:"wed-plenary-7",day:"2026-09-30",start:"08:30",end:"10:30",type:"Workshop",title:"Plenary Session #7: GH Academy Special Workshop: Artificial Intelligence for Global Health Practice: Practical Tools, Research, Education, and Equity (part 1)",room:ROOM,moderatorId:p("Stanley Kowalski"),speakerIds:[p("David Park"),p("Diane Kantaros")],peopleLabel:"Speakers",topics:["Artificial Intelligence","Global Health Practice","Equity"],subSessions:[
    {title:"AI and the Future of Global Health: Capability, Responsibility, and Equity",speakerIds:[p("David Park")]},{title:"Practical AI Tools for Everyday Work in Resource-Limited Settings",speakerIds:[p("Diane Kantaros")]},
  ]},
  {id:"wed-coffee",day:"2026-09-30",start:"10:30",end:"11:00",type:"Break",title:"Coffee Break and Poster Viewing",room:"Lincoln Room",speakerIds:[],topics:["Coffee Break","Posters"]},
  {id:"wed-plenary-8",day:"2026-09-30",start:"11:00",end:"13:00",type:"Workshop",title:"Plenary Session #8: Artificial Intelligence for Global Health Practice: Practical Tools, Research, Education, and Equity (part 2)",room:ROOM,moderatorId:p("Stanley Kowalski"),speakerIds:[p("Igor Gembitsky"),p("Daniil Anisimov")],peopleLabel:"Speakers",topics:["Artificial Intelligence","Education","Research","Scholarship"],subSessions:[
    {title:"Using AI for Education and Faculty Development",speakerIds:[p("Igor Gembitsky")]},{title:"Using AI for Research and Scholarship",speakerIds:[p("Daniil Anisimov")]},
  ]},
  {id:"wed-adjourned",day:"2026-09-30",start:"13:00",type:"Special",title:"Conference adjourned",room:LOCATION_TBD,speakerIds:[],topics:["Conference Close"]},
  {id:"wed-lunch",day:"2026-09-30",start:"13:00",end:"14:00",type:"Lunch",title:"Lunch",room:"Terrace Room",speakerIds:[],topics:["Lunch"]},
];

// Recording playlists are assigned by stable session ID. Breakouts 11 and 12
// have no recording because of technical issues.
const RECORDING_URLS:Record<string,string>={
  "mon-plenary-1":"https://youtu.be/GUyJDsyEgdU",
  "mon-plenary-2":"https://youtu.be/-CagKZORXpQ",
  "mon-plenary-3":"https://youtu.be/f5eONuBr7iM",
  "tue-plenary-4":"https://youtu.be/r7WXtT65CLk",
  "tue-plenary-5":"https://youtu.be/QFf1nk-C7jM",
  "tue-plenary-6":"https://youtu.be/yRRXX53-B6Y",
  "wed-plenary-7":"https://youtu.be/0y3ZA2Eqpuc",
  "wed-plenary-8":"https://youtu.be/GGMBMMXoGH8",
  "mon-breakout-1":"https://youtu.be/XHvj8_ECmjA",
  "mon-breakout-2":"https://youtu.be/aM6SV4ptdDs",
  "mon-breakout-3":"https://youtu.be/XcoAFd0l4QM",
  "mon-breakout-4":"https://youtu.be/whoeKqdEyQ4",
  "mon-breakout-5":"https://youtu.be/iqB3uRaFqV4",
  "tue-breakout-6":"https://youtu.be/IC5r4S5HRpk",
  "tue-breakout-7":"https://youtu.be/kPDidNtt4lo",
  "tue-breakout-8":"https://youtu.be/HFHF_HCG9Bg",
  "tue-breakout-9":"https://youtu.be/KysWu_sgyj0",
  "tue-breakout-10":"https://youtu.be/NE-yZLDrSek",
  "tue-breakout-13":"https://youtu.be/FMGV-V4-4jQ",
};
const RECORDING_UNAVAILABLE=new Set(["tue-breakout-11","tue-breakout-12"]);

export const SESSIONS:Session[]=PROGRAM_SESSIONS.map((session)=>{
  const content=MASTER_SESSION_CONTENT[session.id];
  return {
    ...session,
    ...content,
    recordingUrl:RECORDING_URLS[session.id],
    recordingUnavailable:RECORDING_UNAVAILABLE.has(session.id),
  };
});

// Add confirmed headshot URLs here, keyed by the generated speaker id.
// Example: "aparna-oltikar": "https://example.org/aparna.jpg"
/**
 * Site-hosted speaker portraits. Keys use the same normalized format produced
 * by slugify(), so a stored portrait is picked up automatically if that person
 * is added to the program later. Unused portraits remain in this library.
 *
 * An alternate Charles Herrick portrait is retained at
 * /speakers/charles-herrick-alt.webp but is not currently displayed.
 */
const SPEAKER_PHOTOS:Record<string,string>={
  "abhay-gaidhane":"/speakers/abhay-gaidhane.webp",
  "aparna-oltikar":"/speakers/aparna-oltikar.webp",
  "bulat-ziganshin":"/speakers/bulat-ziganshin.webp",
  "charles-herrick":"/speakers/charles-herrick.webp",
  "elina-mukhametshina":"/speakers/elina-mukhametshina.webp",
  "fiona-makoni":"/speakers/fiona-makoni.webp",
  "gohar-shahsuvaryan":"/speakers/gohar-shahsuvaryan.webp",
  "jasper-tolarba":"/speakers/jasper-tolarba.webp",
  "jon-melk":"/speakers/jon-melk.webp",
  "johnathan-melk":"/speakers/jon-melk.webp",
  "jonathan-melk":"/speakers/jon-melk.webp",
  "kaveh-khoshnood":"/speakers/kaveh-khoshnood.webp",
  "kirk-scirto":"/speakers/kirk-scirto.webp",
  "majd-soudan":"/speakers/majd-soudan.webp",
  "sabih-rahman":"/speakers/sabih-rahman.webp",
  "shalote-chapamaunga":"/speakers/shalote-chipamaunga-bamu.webp",
  "shalote-chipamaunga-bamu":"/speakers/shalote-chipamaunga-bamu.webp",
  "stephen-scholand":"/speakers/stephen-scholand.webp",
  "syed-zahiruddin-quazi":"/speakers/syed-zahiruddin-quazi.webp",
  "zahir-quazi":"/speakers/syed-zahiruddin-quazi.webp",
};
export const SPEAKERS:Speaker[]=[...people.entries()].map(([id,name])=>({
  id,name,role:(SPEAKER_TITLES as Record<string,string>)[id]||"2026 Conference Participant",
  bio:(SUBMITTED_BIOS as Record<string,string>)[id]||SPEAKER_BIOS[id]||`A complete professional biography for ${name} has not yet been provided.`,
  photo:assetUrl((SUBMITTED_PHOTOS as Record<string,string>)[id]||SPEAKER_PHOTOS[id]),
  attendance:id==="vo-ngoc-anh-tho"?("Virtual" as const):undefined,
})).sort((a,b)=>a.name.localeCompare(b.name));

export const speakerById=(id?:string)=>SPEAKERS.find((speaker)=>speaker.id===id);
export const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map((part)=>part[0]).join("").toUpperCase();
export const formatTime=(time:string)=>{const [hours,minutes]=time.split(":").map(Number);return (hours%12||12)+":"+String(minutes).padStart(2,"0")+" "+(hours>=12?"PM":"AM")};
export const TIME_ZONE_ABBR="EDT";
export const formatTimeRange=(start:string,end?:string)=>`${formatTime(start)} ${TIME_ZONE_ABBR}${end?`–${formatTime(end)} ${TIME_ZONE_ABBR}`:""}`;

/**
 * Conference dates fall within Eastern Daylight Time (UTC−4). The end time is
 * exclusive so a session ending at 8:30 AM hands the live state directly to a
 * session beginning at 8:30 AM.
 */
export const isSessionLiveAt=(session:Session,nowMs:number)=>{
  if(!session.end)return false;
  const start=Date.parse(`${session.day}T${session.start}:00-04:00`);
  const end=Date.parse(`${session.day}T${session.end}:00-04:00`);
  return nowMs>=start&&nowMs<end;
};
export const dayLabel=(day:Session["day"])=>({"2026-09-28":"Monday, September 28","2026-09-29":"Tuesday, September 29","2026-09-30":"Wednesday, September 30"}[day]);
