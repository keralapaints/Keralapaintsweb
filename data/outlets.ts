/**
 * The Find an Outlet page (/outlets/): Kerala Paints factory outlets and authorised dealers, by district, from the
 * outlet list supplied by Kerala Paints. Phone numbers are written as dialled locally; lib/outlets adds the +91.
 * An outlet without a phone number shows only its address and directions.
 */

export type OutletType = "factory" | "dealer";

export type Outlet = {
  district: string;
  type: OutletType;
  /** The dealer's business name; factory outlets are named by place. */
  name?: string;
  /** The town or panchayath it serves. */
  place: string;
  address: string;
  pin?: string;
  phones: readonly string[];
  /** Opened recently: shown with a "New" tag. */
  isNew?: boolean;
};

export const outletsCopy = {
  seoTitle: "Find a Kerala Paints Outlet Near You | Kerala Paints",
  seoDescription: "Find Kerala Paints factory outlets and authorised dealers across Kerala, Mahe and Coimbatore, with addresses, phone numbers and directions.",
  keywords: ["Kerala Paints outlet", "Kerala Paints factory outlet", "Kerala Paints dealer", "paint shop near me", "Kerala Paints showroom", "Kerala Paints store Kerala"],
  home: "Home",
  breadcrumb: "Find an Outlet",
  eyebrow: "Factory outlets & dealers",
  heading: ["FIND A KERALA PAINTS", "OUTLET NEAR YOU"],
  intro: "Visit a Kerala Paints factory outlet or an authorised dealer for product advice, shades and the complete Kerala Paints range. Search by town or district, then call ahead or get directions.",
  searchLabel: "Search by town, district or outlet name",
  searchPlaceholder: "Search a town, district or outlet",
  districtLabel: "District",
  allDistricts: "All districts",
  typeLabel: "Outlet type",
  types: { all: "All", factory: "Factory outlets", dealer: "Dealers" },
  factoryName: "Kerala Paints Factory Outlet",
  factoryTag: "Factory outlet",
  dealerTag: "Authorised dealer",
  newTag: "New",
  call: "Call",
  directions: "Directions",
  showing: (count: number) => `${count} ${count === 1 ? "outlet" : "outlets"}`,
  empty: "No outlets match your search. Try another town or district, or clear the filters.",
  clear: "Clear filters",
  ctaHeading: ["NOT SURE WHICH", "PRODUCT YOU NEED?"],
  ctaBody: "Book a free paint consultation and the Kerala Paints team will help you choose the right products before you visit.",
  ctaButton: "Free Paint Consultation",
  /** The link to this page from the product pages and the blog. */
  find: "Find an outlet",
} as const;

/** Every outlet, in district order from south to north, then Coimbatore. */
export const outlets: readonly Outlet[] = [
  // Trivandrum
  { district: "Trivandrum", type: "factory", place: "Attingal", address: "NH 66, Anil Tower, Karikuzhi, Korani Post, Attingal, Thiruvananthapuram", pin: "695104", phones: ["95266 40999"] },
  { district: "Trivandrum", type: "dealer", name: "Inmax Interiors", place: "Kazhakkoottam", address: "In Max Info Solution, Narikkal, near St Thomas College, Kazhakkoottam, Thiruvananthapuram", pin: "695564", phones: ["81389 28088", "73069 06574"] },
  { district: "Trivandrum", type: "dealer", name: "Inmax Interiors", place: "Balaramapuram", address: "In Max Info Solution, Mudavoorpara, near Nazareth Home HSS, Balaramapuram PO, Thiruvananthapuram", pin: "695501", phones: ["81389 28088", "81291 70188"] },
  // Kollam
  { district: "Kollam", type: "factory", place: "Kottarakkara", address: "Kottarakkara–Kollam Road, Market Junction, opposite Head Post Office, Mini Civil Station, Kottarakkara", phones: ["99476 42999"] },
  { district: "Kollam", type: "dealer", name: "V & S Traders", place: "Sooranad", address: "V P Building, Sooranad South, Patharam, Sooranad, Kollam", pin: "690522", phones: ["99612 47129"] },
  { district: "Kollam", type: "dealer", name: "Colournest Paints", place: "Velinallur", address: "Rodvila, opposite petrol pump, Oyoor–Ayoor route, Velinallur, Kollam", pin: "691510", phones: ["92077 78784"] },
  { district: "Kollam", type: "dealer", name: "F & S Traders", place: "Adichanallur", address: "Kottiyam, opposite the road to Simla Textiles, near Kerala Bank, Kollam", pin: "691571", phones: ["81118 69359", "98466 09359"] },
  { district: "Kollam", type: "dealer", name: "Hira Group", place: "Pathanapuram", address: "Near Mini Civil Station, Pallimukku, Pathanapuram, Kollam", pin: "689695", phones: ["98470 40240", "95620 50806"] },
  { district: "Kollam", type: "dealer", name: "Colournest Paints", place: "Alayamon", address: "Opposite Dawn Aesthetics Wedding Centre, College Junction, Anchal, Kollam", pin: "691306", phones: ["92077 78783"] },
  { district: "Kollam", type: "dealer", name: "City Paints & Hardwares", place: "Kalluvathukkal", address: "Madathara Road, Parippally, Kollam", pin: "691574", phones: ["95627 28957", "99476 25195"] },
  // Pathanamthitta
  { district: "Pathanamthitta", type: "factory", place: "Poomkavu", address: "Poomkavu, V Kottayam route, near CM LP School, Pathanamthitta", phones: ["99462 47999"] },
  // Alappuzha
  { district: "Alappuzha", type: "factory", place: "Alappuzha", address: "Ground floor, Sree Rajendra Buildings, Valanjavazhy, Vandanam PO, Alappuzha", pin: "688005", phones: ["90615 08999"] },
  { district: "Alappuzha", type: "dealer", name: "Mezzan", place: "Chengannur", address: "Near St Mary’s Cathedral, Pallippadi Street, Puthenkavu, Chengannur", phones: ["81118 24571"] },
  { district: "Alappuzha", type: "dealer", name: "Steel World", place: "Nooranad", address: "Near Kenza Mall, Charummoodu, Palammood, Alappuzha", pin: "690505", phones: ["94000 97338", "75106 19048"] },
  // Kottayam
  { district: "Kottayam", type: "factory", place: "Kottayam (Logos Junction)", address: "Koshys Arcade, Vazhiambalathil, 2667/13, Logos Junction, next to DC Books, Good Shepherd Road, Kottayam", pin: "686001", phones: ["90728 61999"] },
  // Idukki
  { district: "Idukki", type: "factory", place: "Adimali", address: "Near St Jude Church Junction, Kallarkutty Road, Adimali, Idukki", phones: ["90614 02999"] },
  { district: "Idukki", type: "factory", place: "Kattappana", address: "Kuttikkanam Road, School Kavala, KM 20/82H, near Auxilium School, Kattappana, Idukki", phones: ["99461 05999"] },
  { district: "Idukki", type: "factory", place: "Thodupuzha", address: "Vattaparambil JMJ Arcade, Kaithakode Junction, Four Line Bypass, Thodupuzha PO, Idukki", pin: "685584", phones: ["95269 21999"] },
  // Ernakulam
  { district: "Ernakulam", type: "factory", place: "Edappally", address: "Kunnumpuram, Edappally–Varapuzha Road, opposite Al Reem Restaurant, Edappally, Ernakulam", phones: ["90728 25999"] },
  { district: "Ernakulam", type: "dealer", name: "Sibees Trade Centre", place: "Kothamangalam", address: "Ground floor, V/166A, Ebenezer Gardens, near Chelad Church, Chelad, Kothamangalam, Ernakulam", pin: "686681", phones: ["95673 59595"] },
  // Thrissur
  { district: "Thrissur", type: "factory", place: "Chalakudy", address: "Municipal Junction, Railway Station Road, Chalakudy, Thrissur", pin: "680307", phones: ["97458 40999"] },
  { district: "Thrissur", type: "dealer", name: "KK Brothers", place: "Guruvayur", address: "Choolpuram, near Indus Motors and Tata Motors, Kottappadi PO, Thrissur", pin: "680505", phones: ["96055 59985", "94475 77226"] },
  // Palakkad
  { district: "Palakkad", type: "factory", place: "Kalpathy", address: "Near Kalpathy Bridge, Chathapuram, Kalpathy, Palakkad", pin: "678003", phones: ["99478 12999"] },
  { district: "Palakkad", type: "factory", place: "Vadakkencherry", address: "Darul Falah Yatheemkhana Complex, Mangalam, Vadakkencherry, Palakkad", pin: "678683", phones: [], isNew: true },
  { district: "Palakkad", type: "dealer", name: "PR Enterprises", place: "Kuthanur", address: "Chippi’s Complex and Apartments, Kalapara, opposite Co-operative Bank, Kuthanur, Palakkad", phones: ["95393 31004"] },
  { district: "Palakkad", type: "factory", name: "Nexus Seven", place: "Pattambi", address: "Cherpulassery Road Junction, Melepattambi, near Cool City and Chithra Auditorium, Pattambi, Palakkad", phones: ["70122 54106", "90486 71677"] },
  { district: "Palakkad", type: "dealer", name: "Shama Traders", place: "Alanallur", address: "Hospital Junction, Main Road, Alanallur, Palakkad", pin: "678601", phones: ["95390 05528", "81118 10670"] },
  { district: "Palakkad", type: "dealer", name: "RGK Kerala Paints", place: "Nemmara", address: "Nemmara Junction, Pollachi Road, near Boys High School, Nemmara, Palakkad", pin: "678508", phones: ["99466 58719", "88480 03105", "99460 22145"] },
  // Malappuram
  { district: "Malappuram", type: "factory", place: "Kuttippuram", address: "SH 69, Kanjirakutty, Thangalpady, Kuttippuram, Thrikkanapuram South PO, Malappuram", pin: "679582", phones: ["92077 35999"] },
  { district: "Malappuram", type: "factory", place: "Makkaraparamba", address: "Malappuram–Perinthalmanna route, Naranath, near VMHM UP School, N P Tower, Makkaraparamba, Malappuram", phones: ["90480 32999"] },
  { district: "Malappuram", type: "dealer", name: "Oasis Hardwares", place: "Nannambra", address: "Kundoor–Cherumukku route, near Juma Masjid, Tirurangadi, Kundoor, Malappuram", phones: ["79022 01110", "98958 98818"] },
  { district: "Malappuram", type: "dealer", name: "SN Sons", place: "Thalakkad", address: "VPG Arcade, Parassery, Tirur–Ponnani Road, Thalakkad, Malappuram", pin: "676102", phones: ["73565 36003"] },
  { district: "Malappuram", type: "dealer", name: "Novara", place: "Perinthalmanna", address: "Jubilee Bypass Road, near Moosakutty Bus Stand, Perinthalmanna, Malappuram", pin: "679322", phones: ["97476 55999", "99470 65101"] },
  { district: "Malappuram", type: "dealer", name: "Marhaba G Shoppee", place: "Angadipuram", address: "Valanchery Road, Angadipuram, Puthanangadi Post, Malappuram", pin: "679321", phones: ["89436 28081", "95441 01005"] },
  { district: "Malappuram", type: "dealer", name: "Paint Hub", place: "Parappanangadi", address: "Nahas Commercial, Chemmad Road, Karinkallathani, opposite Pallavi Theatre, Putharikkal, Parappanangadi, Malappuram", pin: "676303", phones: ["97454 47171", "77365 50644"] },
  // Wayanad
  { district: "Wayanad", type: "factory", place: "Meenangadi", address: "Bathery Road, Kolagapara Kurishu Kavala, Wayanadiyar Residency, opposite India Post Office, Meenangadi, Wayanad", phones: ["96456 02999"] },
  { district: "Wayanad", type: "dealer", name: "Colour Nest", place: "Kalpetta", address: "Roots Tower, near Fathima Matha Hospital, Kalpetta, Wayanad", pin: "673121", phones: ["62388 22524", "62829 32524"] },
  { district: "Wayanad", type: "dealer", name: "VKS Traders", place: "Vellamunda", address: "Vellamunda 8/4, near Vellamunda Government Higher Secondary School, Wayanad", pin: "670731", phones: ["95620 72082", "94961 62852"] },
  // Kozhikode
  { district: "Kozhikode", type: "factory", place: "Chemancheri", address: "NH 66, Chemancheri, Pookad, opposite old Sub Registrar Office, Kozhikode", pin: "673304", phones: ["99460 28999"] },
  { district: "Kozhikode", type: "factory", place: "Meenchanda", address: "HK Tower, near Arts College, Vattakinar, Meenchanda, Kozhikode", pin: "673018", phones: [], isNew: true },
  { district: "Kozhikode", type: "factory", place: "Kuttiyadi", address: "Narikkoottumchal, opposite Rajiv Gandhi Bus Stop, Kakkattil, Kuttiyadi, Kozhikode", pin: "673507", phones: [], isNew: true },
  { district: "Kozhikode", type: "dealer", name: "7 Shades", place: "Pottammal", address: "A B Complex, Palazhi Road, Kattukulangara, Pottammal, Kozhikode", pin: "673016", phones: ["97454 45844"] },
  { district: "Kozhikode", type: "dealer", name: "Yes We Associates", place: "Nadapuram", address: "CV Complex, Market Road, Kallachi, near Valayam–Vanimal Road Junction, Kozhikode", pin: "673506", phones: ["94954 55714"] },
  { district: "Kozhikode", type: "dealer", name: "FS Agencies", place: "Kunnummal", address: "Kakkattil Town, Kuttiadi–Vatakara Road, near Kakkattil Co-operative Rural Bank, Kozhikode", pin: "673507", phones: ["81388 48505", "94462 95374"] },
  { district: "Kozhikode", type: "dealer", name: "Rainbow Paints & Hardwares", place: "Eramala", address: "Orkkatteri Jeep Stand, Thilleri, Eramala, Vadakara, Kozhikode", pin: "673501", phones: ["96459 34337", "97781 63379"] },
  { district: "Kozhikode", type: "dealer", name: "MC Traders", place: "Vadakara", address: "Near Government Sanskrit HSS, Nut Street Post, Puthiyappu, Vadakara, Kozhikode", pin: "673104", phones: ["73568 08179", "95445 65241"] },
  // Mahe
  { district: "Mahe", type: "dealer", name: "French Trading", place: "Mahe", address: "East Pallur, Chokli–Peringadi Road, Mahe", pin: "673310", phones: ["91882 44222", "81290 31122"] },
  // Kannur
  { district: "Kannur", type: "factory", place: "Irikkur – Nayattupara", address: "Thalassery–Irikkur Highway, Nayattupara, Irikkur, Kannur", pin: "670595", phones: ["96458 52999"] },
  { district: "Kannur", type: "dealer", name: "PBS Group", place: "Panoor", address: "MHM Building, Pookkom Road, Panoor, Kannur", pin: "670692", phones: ["94955 76131", "93498 60046"] },
  { district: "Kannur", type: "dealer", name: "B Star Trading", place: "Cherupuzha", address: "Palery Building, near HDFC Bank, Cherupuzha, Kannur", pin: "670511", phones: ["94478 55153", "90740 63835"] },
  { district: "Kannur", type: "dealer", name: "MYM Traders", place: "Cheruthazham", address: "Parakkadavath, Pilathara PO, near Pilathara Bevco, Cheruthazham, Kadannappalli, Kannur", pin: "670504", phones: ["94971 65551", "94008 99311"] },
  { district: "Kannur", type: "dealer", name: "KVS Paints & Building Materials", place: "Peralassery", address: "Near Subrahmanya Swami Temple, Makreri PO, Peralassery, Kannur", pin: "670622", phones: ["96456 08643", "89210 63413"] },
  // Kasaragod
  { district: "Kasaragod", type: "factory", place: "Kanhangad", address: "Near Alamipally Bus Stand, near Krishi Bhavan, Lekshmi Nagar, Kanhangad, Kasaragod", pin: "671314", phones: ["90615 02999"] },
  { district: "Kasaragod", type: "dealer", name: "HNM Marketing", place: "Chengala", address: "Maliga Complex, Santhosh Nagar PO, Chengala, Kasaragod", pin: "671541", phones: ["92928 58080", "90370 88889"] },
  { district: "Kasaragod", type: "dealer", name: "AMS Infinity World", place: "Chemnad", address: "Paris Complex, Bendichal, Chattanchal–Kalanad Road, Kasaragod", pin: "671541", phones: ["92077 61616", "83053 93333"] },
  { district: "Kasaragod", type: "dealer", name: "ABM Paints & Hardware", place: "Ajanur", address: "Opposite KHM School, Manikoth, Madiyan, Kanhangad, Kasaragod", pin: "671316", phones: ["90488 22313", "95260 00786"] },
  { district: "Kasaragod", type: "dealer", name: "RN Traders", place: "Mogral Puthur", address: "Near Eriyal Juma Masjid, Eriyal, Kasaragod", phones: ["98959 17704", "98951 42514"], isNew: true },
  // Tamil Nadu
  { district: "Coimbatore (Tamil Nadu)", type: "factory", place: "Coimbatore", address: "Malumichampatti Village, Chettipalayam Road, Eachanari Pirivu, Coimbatore, Tamil Nadu", pin: "641050", phones: ["90613 65999"] },
];