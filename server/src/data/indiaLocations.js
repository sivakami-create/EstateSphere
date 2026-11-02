const city = (name, localities = []) => ({ name, localities });

export const indiaLocations = [
  { name: "Andhra Pradesh", type: "state", cities: [city("Visakhapatnam", ["Madhurawada", "MVP Colony", "Rushikonda"]), city("Vijayawada", ["Benz Circle", "Governorpet", "Moghalrajpuram"]), city("Guntur"), city("Tirupati"), city("Kurnool")] },
  { name: "Arunachal Pradesh", type: "state", cities: [city("Itanagar"), city("Naharlagun"), city("Pasighat"), city("Tawang")] },
  { name: "Assam", type: "state", cities: [city("Guwahati", ["Beltola", "Dispur", "Paltan Bazaar"]), city("Silchar"), city("Dibrugarh"), city("Jorhat"), city("Tezpur")] },
  { name: "Bihar", type: "state", cities: [city("Patna", ["Boring Road", "Danapur", "Kankarbagh"]), city("Gaya"), city("Muzaffarpur"), city("Bhagalpur"), city("Darbhanga")] },
  { name: "Chhattisgarh", type: "state", cities: [city("Raipur", ["Avanti Vihar", "Shankar Nagar", "Tatibandh"]), city("Bhilai"), city("Bilaspur"), city("Korba"), city("Durg")] },
  { name: "Goa", type: "state", cities: [city("Panaji", ["Altinho", "Miramar", "Porvorim"]), city("Margao"), city("Vasco da Gama"), city("Mapusa"), city("Ponda")] },
  { name: "Gujarat", type: "state", cities: [city("Ahmedabad", ["Bodakdev", "Maninagar", "Navrangpura", "Satellite", "SG Highway"]), city("Surat", ["Adajan", "City Light", "Vesu"]), city("Vadodara", ["Alkapuri", "Gotri", "Manjalpur"]), city("Rajkot"), city("Gandhinagar"), city("Bhavnagar"), city("Jamnagar")] },
  { name: "Haryana", type: "state", cities: [city("Gurugram", ["DLF Phase 1", "Golf Course Road", "Sector 14", "Sohna Road"]), city("Faridabad", ["NIT", "Sector 15", "Sector 21"]), city("Panipat"), city("Ambala"), city("Hisar"), city("Karnal")] },
  { name: "Himachal Pradesh", type: "state", cities: [city("Shimla", ["Chotta Shimla", "New Shimla", "Sanjauli"]), city("Dharamshala"), city("Solan"), city("Mandi"), city("Kullu")] },
  { name: "Jharkhand", type: "state", cities: [city("Ranchi", ["Argora", "Bariatu", "Harmu"]), city("Jamshedpur", ["Bistupur", "Kadma", "Sakchi"]), city("Dhanbad"), city("Bokaro"), city("Hazaribagh")] },
  { name: "Karnataka", type: "state", cities: [city("Bengaluru", ["Electronic City", "Indiranagar", "Jayanagar", "Koramangala", "Whitefield"]), city("Mysuru", ["Gokulam", "Jayalakshmipuram", "Vijayanagar"]), city("Mangaluru", ["Bejai", "Kadri", "Kankanady"]), city("Hubballi-Dharwad"), city("Belagavi"), city("Kalaburagi"), city("Shivamogga")] },
  { name: "Kerala", type: "state", cities: [city("Thiruvananthapuram", ["Kazhakkoottam", "Kowdiar", "Pattom"]), city("Kochi", ["Edappally", "Kakkanad", "Marine Drive", "Panampilly Nagar"]), city("Kozhikode", ["Beypore", "Mavoor Road", "Thondayad"]), city("Thrissur"), city("Kollam"), city("Kannur"), city("Kottayam")] },
  { name: "Madhya Pradesh", type: "state", cities: [city("Bhopal", ["Arera Colony", "Bawadia Kalan", "MP Nagar"]), city("Indore", ["AB Road", "Palasia", "Rau", "Vijay Nagar"]), city("Jabalpur"), city("Gwalior"), city("Ujjain"), city("Sagar")] },
  { name: "Maharashtra", type: "state", cities: [city("Mumbai", ["Andheri", "Bandra", "Borivali", "Dadar", "Powai"]), city("Pune", ["Aundh", "Baner", "Hinjawadi", "Kothrud", "Pashan", "Viman Nagar", "Wakad"]), city("Nagpur", ["Dharampeth", "Manish Nagar", "Sitabuldi"]), city("Nashik", ["College Road", "Gangapur Road", "Indira Nagar"]), city("Thane", ["Ghodbunder Road", "Hiranandani Estate", "Majiwada"]), city("Navi Mumbai", ["Airoli", "Kharghar", "Nerul", "Vashi"]), city("Chhatrapati Sambhajinagar"), city("Kolhapur"), city("Solapur"), city("Amravati")] },
  { name: "Manipur", type: "state", cities: [city("Imphal"), city("Thoubal"), city("Churachandpur"), city("Bishnupur")] },
  { name: "Meghalaya", type: "state", cities: [city("Shillong", ["Laitumkhrah", "Police Bazaar", "Upper Shillong"]), city("Tura"), city("Jowai"), city("Nongpoh")] },
  { name: "Mizoram", type: "state", cities: [city("Aizawl", ["Dawrpui", "Durtlang", "Zarkawt"]), city("Lunglei"), city("Champhai"), city("Serchhip")] },
  { name: "Nagaland", type: "state", cities: [city("Kohima"), city("Dimapur"), city("Mokokchung"), city("Wokha")] },
  { name: "Odisha", type: "state", cities: [city("Bhubaneswar", ["Patia", "Saheed Nagar", "Unit 4", "Unit 8"]), city("Cuttack"), city("Rourkela"), city("Sambalpur"), city("Berhampur")] },
  { name: "Punjab", type: "state", cities: [city("Ludhiana", ["Civil Lines", "Model Town", "Sarabha Nagar"]), city("Amritsar", ["Green Avenue", "Ranjit Avenue", "White Avenue"]), city("Jalandhar"), city("Patiala"), city("Bathinda"), city("Mohali", ["Aerocity", "Phase 3B2", "Sector 70"])] },
  { name: "Rajasthan", type: "state", cities: [city("Jaipur", ["C Scheme", "Malviya Nagar", "Mansarovar", "Vaishali Nagar"]), city("Jodhpur", ["Chopasni Housing Board", "Paota", "Ratanada"]), city("Udaipur"), city("Kota"), city("Ajmer"), city("Bikaner"), city("Alwar"), city("Bharatpur")] },
  { name: "Sikkim", type: "state", cities: [city("Gangtok", ["Deorali", "Tadong", "Zero Point"]), city("Namchi"), city("Gyalshing"), city("Mangan")] },
  { name: "Tamil Nadu", type: "state", cities: [city("Chennai", ["Adyar", "Anna Nagar", "Guindy", "OMR", "Velachery"]), city("Coimbatore", ["Gandhipuram", "Peelamedu", "RS Puram"]), city("Madurai", ["Anna Nagar", "KK Nagar", "Tallakulam"]), city("Tiruchirappalli"), city("Salem"), city("Tirunelveli"), city("Erode"), city("Vellore")] },
  { name: "Telangana", type: "state", cities: [city("Hyderabad", ["Banjara Hills", "Gachibowli", "Hitech City", "Kondapur", "Madhapur"]), city("Warangal"), city("Karimnagar"), city("Nizamabad"), city("Khammam")] },
  { name: "Tripura", type: "state", cities: [city("Agartala", ["Banamalipur", "Indranagar", "Pratapgarh"]), city("Udaipur"), city("Dharmanagar"), city("Kailashahar")] },
  { name: "Uttar Pradesh", type: "state", cities: [city("Lucknow", ["Aliganj", "Gomti Nagar", "Hazratganj", "Indira Nagar"]), city("Kanpur", ["Arya Nagar", "Kakadeo", "Swaroop Nagar"]), city("Varanasi", ["Bhelupur", "Lanka", "Sigra"]), city("Agra", ["Dayal Bagh", "Kamla Nagar", "Sikandra"]), city("Prayagraj"), city("Noida", ["Sector 18", "Sector 50", "Sector 62", "Sector 137"]), city("Ghaziabad"), city("Meerut"), city("Gorakhpur"), city("Bareilly")] },
  { name: "Uttarakhand", type: "state", cities: [city("Dehradun", ["Dalanwala", "Rajpur Road", "Sahastradhara Road"]), city("Haridwar"), city("Rishikesh"), city("Haldwani"), city("Roorkee"), city("Rudrapur")] },
  { name: "West Bengal", type: "state", cities: [city("Kolkata", ["Ballygunge", "New Town", "Salt Lake", "Tollygunge"]), city("Howrah"), city("Durgapur"), city("Asansol"), city("Siliguri", ["Matigara", "Sevoke Road", "Pradhan Nagar"]), city("Kharagpur")] },
  { name: "Andaman and Nicobar Islands", type: "union territory", cities: [city("Sri Vijaya Puram"), city("Diglipur"), city("Mayabunder"), city("Car Nicobar")] },
  { name: "Chandigarh", type: "union territory", cities: [city("Chandigarh", ["Sector 17", "Sector 22", "Sector 35", "Sector 43"])] },
  { name: "Dadra and Nagar Haveli and Daman and Diu", type: "union territory", cities: [city("Daman"), city("Diu"), city("Silvassa")] },
  { name: "Delhi", type: "union territory", cities: [city("New Delhi", ["Dwarka", "Lajpat Nagar", "Rohini", "Saket", "Vasant Kunj"])] },
  { name: "Jammu and Kashmir", type: "union territory", cities: [city("Srinagar", ["Bemina", "Rajbagh", "Soura"]), city("Jammu", ["Gandhi Nagar", "Greater Kailash", "Trikuta Nagar"]), city("Anantnag"), city("Baramulla")] },
  { name: "Ladakh", type: "union territory", cities: [city("Leh"), city("Kargil")] },
  { name: "Lakshadweep", type: "union territory", cities: [city("Kavaratti"), city("Agatti"), city("Andrott"), city("Minicoy")] },
  { name: "Puducherry", type: "union territory", cities: [city("Puducherry", ["Ariyankuppam", "Lawspet", "White Town"]), city("Karaikal"), city("Mahe"), city("Yanam")] },
];

export function findLocation(stateName, cityName, localityName) {
  const state = indiaLocations.find((item) => item.name.toLowerCase() === stateName?.toLowerCase());
  const cityEntry = state?.cities.find((item) => item.name.toLowerCase() === cityName?.toLowerCase());
  const locality = cityEntry?.localities.find((item) => item.toLowerCase() === localityName?.toLowerCase());
  return state && (!cityName || cityEntry && (!localityName || locality))
    ? { state: state.name, city: cityEntry?.name ?? "", locality: locality ?? "" }
    : null;
}
