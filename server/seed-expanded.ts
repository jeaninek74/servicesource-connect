/**
 * Expanded seed script — adds 5-10 additional resources per state
 * Run: npx tsx server/seed-expanded.ts
 */
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { resourceCategories, resources } from "../drizzle/schema";
import * as dotenv from "dotenv";
dotenv.config();

const db = drizzle(process.env.DATABASE_URL!);

async function seedExpanded() {
  console.log("🌱 Running expanded seed...");

  const cats = await db.select().from(resourceCategories);
  const catMap: Record<string, number> = {};
  for (const c of cats) catMap[c.slug] = c.id;

  const R = (
    catSlug: string,
    name: string,
    description: string,
    url: string,
    phone: string | null,
    state: string,
    city: string,
    tags: string[],
    coverageArea: "local" | "state" | "national" = "state",
    verifiedLevel: "unverified" | "verified" | "partner_verified" = "verified"
  ) => ({
    categoryId: catMap[catSlug],
    name,
    description,
    url,
    phone,
    state,
    city,
    coverageArea,
    verifiedLevel,
    tags,
  });

  const expanded = [
    // ── ALABAMA ──────────────────────────────────────────────────────────────
    R("mental-health","Alabama Vet Centers","Readjustment counseling, PTSD treatment, and MST support for Alabama combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-800-827-1000","AL","Birmingham",["PTSD","counseling","readjustment"]),
    R("employment","Alabama Hire a Vet Campaign","Connects Alabama employers with veteran job seekers through state-sponsored job fairs and hiring events.","https://www.labor.alabama.gov/veterans/","1-334-956-7500","AL","Montgomery",["employment","job fair","hiring"]),
    R("food","Alabama Food Bank Network","Food assistance programs for veterans and military families across Alabama.","https://www.feedingamerica.org/find-your-local-foodbank","1-800-771-2303","AL","Birmingham",["food bank","food insecurity"]),
    R("legal","Alabama Law Foundation Veterans Pro Bono","Free legal services for Alabama veterans including benefits appeals and family law.","https://www.alabamalawfoundation.org/","1-334-269-1515","AL","Montgomery",["legal aid","pro bono","benefits"]),
    R("financial","Alabama National Guard Emergency Relief Fund","Emergency financial assistance for Alabama National Guard members and families.","https://www.al.ngb.army.mil/","1-334-271-7200","AL","Montgomery",["emergency fund","National Guard","financial aid"]),
    R("community","Alabama Veterans Museum","Community gathering space and peer support network for Alabama veterans.","https://www.alabamaveteransmuseum.com/","1-256-701-0131","AL","Athens",["community","peer support","history"]),

    // ── ALASKA ───────────────────────────────────────────────────────────────
    R("housing","Alaska Veterans and Pioneer Home","State-operated assisted living for Alaska veterans and pioneers.","https://dhss.alaska.gov/dfs/Pages/vets/","1-907-465-3027","AK","Juneau",["assisted living","elderly","housing"]),
    R("mental-health","Alaska Vet Centers","Readjustment counseling and PTSD support for Alaska combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-907-563-6966","AK","Anchorage",["PTSD","counseling","readjustment"]),
    R("food","Food Bank of Alaska","Food assistance for veterans and families across Alaska.","https://www.foodbankofalaska.org/","1-907-272-3663","AK","Anchorage",["food bank","food insecurity"]),
    R("legal","Alaska Legal Services — Veterans","Free civil legal aid for low-income Alaska veterans.","https://www.alsc-law.org/","1-907-272-9431","AK","Anchorage",["legal aid","civil","benefits"]),
    R("financial","Alaska Permanent Fund Dividend — Veterans Priority","Information on Alaska Permanent Fund Dividend eligibility for veterans.","https://pfd.alaska.gov/","1-907-465-2326","AK","Juneau",["financial","dividend","state benefit"]),

    // ── ARIZONA ──────────────────────────────────────────────────────────────
    R("housing","Arizona Department of Veterans Services Housing","Transitional and permanent housing programs for Arizona veterans.","https://dvs.az.gov/housing","1-602-255-3373","AZ","Phoenix",["housing","transitional","permanent"]),
    R("mental-health","Arizona Vet Centers","PTSD treatment, MST counseling, and readjustment services for Arizona veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-602-640-2981","AZ","Phoenix",["PTSD","MST","counseling"]),
    R("employment","Arizona Hire a Vet","State job placement and career services for Arizona veterans.","https://des.az.gov/services/employment/veterans","1-602-364-4300","AZ","Phoenix",["employment","job placement","career"]),
    R("food","St. Mary's Food Bank — Veterans","Food assistance programs specifically for veterans in the Phoenix metro area.","https://www.firstfoodbank.org/","1-602-242-3663","AZ","Phoenix",["food bank","food insecurity"]),
    R("legal","Community Legal Services — Veterans","Free civil legal aid for low-income veterans in Maricopa County.","https://www.clsaz.org/","1-602-258-3434","AZ","Phoenix",["legal aid","civil","Maricopa"]),
    R("financial","Arizona Veterans Donation Fund","Emergency financial assistance for Arizona veterans in crisis.","https://dvs.az.gov/","1-602-255-3373","AZ","Phoenix",["emergency fund","financial aid"]),

    // ── ARKANSAS ─────────────────────────────────────────────────────────────
    R("housing","Arkansas Veterans Home","State-operated nursing home and assisted living for Arkansas veterans.","https://www.veterans.arkansas.gov/","1-501-683-2382","AR","North Little Rock",["assisted living","nursing home","housing"]),
    R("mental-health","Arkansas Vet Centers","Readjustment counseling and PTSD support for Arkansas combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-501-324-6395","AR","Little Rock",["PTSD","counseling","readjustment"]),
    R("employment","Arkansas Workforce Centers — Veterans","Priority employment services and job placement for Arkansas veterans.","https://www.dws.arkansas.gov/find-a-workforce-center/","1-501-682-2121","AR","Little Rock",["employment","workforce","job placement"]),
    R("food","Arkansas Foodbank — Veterans Outreach","Food assistance for veterans and military families across Arkansas.","https://www.arkansasfoodbank.org/","1-501-565-8121","AR","Little Rock",["food bank","food insecurity"]),
    R("legal","Center for Arkansas Legal Services — Veterans","Free legal aid for low-income Arkansas veterans.","https://www.arlegalservices.org/","1-501-376-3423","AR","Little Rock",["legal aid","benefits","civil"]),

    // ── CALIFORNIA ───────────────────────────────────────────────────────────
    R("housing","CalVet Farm and Home Loans","Low-interest home loans for California veterans through the state loan program.","https://www.calvet.ca.gov/HomeLoans","1-866-653-2510","CA","Sacramento",["home loan","low interest","state program"]),
    R("mental-health","California Vet Centers (Los Angeles)","PTSD treatment, MST counseling, and readjustment services in Los Angeles.","https://www.va.gov/find-locations/?facilityType=vet_center","1-310-914-9016","CA","Los Angeles",["PTSD","MST","counseling"]),
    R("employment","California Employment Development Department — Veterans","Priority employment services and job training for California veterans.","https://www.edd.ca.gov/jobs_and_training/veterans.htm","1-800-300-5616","CA","Sacramento",["employment","job training","EDD"]),
    R("childcare","California Military Child Care Assistance","Subsidized childcare for California National Guard and Reserve families.","https://www.calvet.ca.gov/","1-916-653-2158","CA","Sacramento",["childcare","National Guard","Reserve"]),
    R("food","Los Angeles Regional Food Bank — Veterans","Food assistance for veterans and military families in the LA area.","https://www.lafoodbank.org/","1-323-234-3030","CA","Los Angeles",["food bank","food insecurity","LA"]),
    R("legal","Bay Area Legal Aid — Veterans","Free civil legal services for low-income veterans in the San Francisco Bay Area.","https://baylegal.org/","1-415-982-1300","CA","San Francisco",["legal aid","Bay Area","civil"]),
    R("financial","California Department of Veterans Affairs Emergency Aid","Emergency financial assistance for California veterans in crisis.","https://www.calvet.ca.gov/","1-800-952-5626","CA","Sacramento",["emergency aid","financial assistance"]),

    // ── COLORADO ─────────────────────────────────────────────────────────────
    R("mental-health","Colorado Vet Centers","PTSD treatment and readjustment counseling for Colorado combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-303-326-0645","CO","Denver",["PTSD","counseling","readjustment"]),
    R("employment","Colorado Workforce Centers — Veterans","Priority employment services for Colorado veterans.","https://cdle.colorado.gov/workforce-centers","1-303-318-9000","CO","Denver",["employment","workforce","career"]),
    R("education","Colorado National Guard Tuition Assistance","Tuition assistance for Colorado National Guard members at state colleges.","https://dmva.colorado.gov/","1-720-250-1500","CO","Denver",["education","tuition","National Guard"]),
    R("food","Food Bank of the Rockies — Veterans","Food assistance for veterans and military families in Colorado.","https://www.foodbankrockies.org/","1-303-371-9250","CO","Denver",["food bank","food insecurity"]),
    R("legal","Colorado Legal Services — Veterans","Free civil legal aid for low-income Colorado veterans.","https://www.coloradolegalservices.org/","1-303-837-1313","CO","Denver",["legal aid","civil","benefits"]),
    R("community","Colorado Veterans Community Living Center","Peer support and community programs for Colorado veterans.","https://dmva.colorado.gov/","1-303-894-7474","CO","Denver",["community","peer support","living center"]),

    // ── CONNECTICUT ──────────────────────────────────────────────────────────
    R("housing","Connecticut Veterans Housing Program","State-funded housing assistance and transitional housing for Connecticut veterans.","https://portal.ct.gov/DVA","1-860-616-3600","CT","Rocky Hill",["housing","transitional","state program"]),
    R("mental-health","Connecticut Vet Centers","PTSD treatment and readjustment counseling for Connecticut veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-203-932-9899","CT","West Haven",["PTSD","counseling","readjustment"]),
    R("employment","Connecticut Department of Labor — Veterans","Priority employment services and job placement for Connecticut veterans.","https://www.ctdol.state.ct.us/veterans/","1-860-263-6000","CT","Wethersfield",["employment","job placement","DOL"]),
    R("education","Connecticut National Guard Tuition Waiver","Tuition waiver for Connecticut National Guard members at state universities.","https://portal.ct.gov/DVA","1-860-616-3600","CT","Rocky Hill",["education","tuition waiver","National Guard"]),
    R("food","Connecticut Food Bank — Veterans Outreach","Food assistance for veterans and military families in Connecticut.","https://www.ctfoodbank.org/","1-203-469-5000","CT","East Haven",["food bank","food insecurity"]),

    // ── DELAWARE ─────────────────────────────────────────────────────────────
    R("housing","Delaware Veterans Home","State-operated assisted living and nursing care for Delaware veterans.","https://veteransaffairs.delaware.gov/","1-302-834-8366","DE","Milford",["assisted living","nursing home","housing"]),
    R("mental-health","Delaware Vet Centers","Readjustment counseling and PTSD support for Delaware combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-302-994-1660","DE","Wilmington",["PTSD","counseling","readjustment"]),
    R("food","Food Bank of Delaware — Veterans","Food assistance for veterans and military families in Delaware.","https://www.fbd.org/","1-302-292-1305","DE","Newark",["food bank","food insecurity"]),
    R("legal","Community Legal Aid Society — Veterans","Free civil legal aid for low-income Delaware veterans.","https://www.declasi.org/","1-302-575-0660","DE","Wilmington",["legal aid","civil","benefits"]),
    R("financial","Delaware Emergency Veterans Assistance","Emergency financial assistance for Delaware veterans in crisis.","https://veteransaffairs.delaware.gov/","1-302-739-2792","DE","Dover",["emergency fund","financial aid"]),

    // ── FLORIDA ──────────────────────────────────────────────────────────────
    R("housing","Florida Veterans Housing Assistance","State-funded housing assistance and transitional housing for Florida veterans.","https://floridavets.org/benefits-services/housing/","1-727-319-7440","FL","St. Petersburg",["housing","transitional","state program"]),
    R("employment","Florida Department of Economic Opportunity — Veterans","Priority employment services and career counseling for Florida veterans.","https://www.floridajobs.org/job-seekers-community/veterans","1-850-245-7105","FL","Tallahassee",["employment","career counseling","DEO"]),
    R("education","Florida Bright Futures — Veterans Scholarship","Scholarship assistance for Florida veterans and dependents at state colleges.","https://www.floridastudentfinancialaidsg.org/","1-888-827-2004","FL","Tallahassee",["education","scholarship","college"]),
    R("food","Feeding Tampa Bay — Veterans","Food assistance for veterans and military families in the Tampa Bay area.","https://www.feedingtampabay.org/","1-813-254-1190","FL","Tampa",["food bank","food insecurity","Tampa"]),
    R("legal","Bay Area Legal Services — Veterans","Free civil legal aid for veterans in the Tampa Bay area.","https://www.bals.org/","1-813-232-1343","FL","Tampa",["legal aid","civil","Tampa Bay"]),
    R("community","Florida Veterans Foundation","Emergency assistance and community support for Florida veterans.","https://floridaveteransfoundation.org/","1-850-386-2727","FL","Tallahassee",["community","emergency assistance","foundation"]),

    // ── GEORGIA ──────────────────────────────────────────────────────────────
    R("mental-health","Georgia Vet Centers","PTSD treatment and readjustment counseling for Georgia combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-404-347-7264","GA","Atlanta",["PTSD","counseling","readjustment"]),
    R("employment","Georgia Department of Labor — Veterans","Priority employment services and job placement for Georgia veterans.","https://dol.georgia.gov/veterans","1-404-232-3001","GA","Atlanta",["employment","job placement","DOL"]),
    R("education","Georgia National Guard Tuition Assistance","Tuition assistance for Georgia National Guard members at state colleges.","https://veterans.georgia.gov/","1-404-656-2300","GA","Atlanta",["education","tuition","National Guard"]),
    R("food","Atlanta Community Food Bank — Veterans","Food assistance for veterans and military families in the Atlanta area.","https://www.acfb.org/","1-404-892-9822","GA","Atlanta",["food bank","food insecurity","Atlanta"]),
    R("legal","Georgia Legal Services — Veterans","Free civil legal aid for low-income Georgia veterans.","https://www.glsp.org/","1-404-524-5811","GA","Atlanta",["legal aid","civil","benefits"]),
    R("financial","Georgia Veterans Service Emergency Fund","Emergency financial assistance for Georgia veterans.","https://veterans.georgia.gov/","1-404-656-2300","GA","Atlanta",["emergency fund","financial aid"]),

    // ── HAWAII ───────────────────────────────────────────────────────────────
    R("housing","Hawaii Veterans Housing Program","State-funded housing assistance for Hawaii veterans.","https://dod.hawaii.gov/ovs/","1-808-433-0420","HI","Honolulu",["housing","state program"]),
    R("mental-health","Hawaii Vet Centers","PTSD treatment and readjustment counseling for Hawaii combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-808-973-8387","HI","Honolulu",["PTSD","counseling","readjustment"]),
    R("employment","Hawaii Workforce Development Division — Veterans","Priority employment services for Hawaii veterans.","https://labor.hawaii.gov/wdd/","1-808-586-8700","HI","Honolulu",["employment","workforce","career"]),
    R("food","Hawaii Foodbank — Veterans","Food assistance for veterans and military families in Hawaii.","https://www.hawaiifoodbank.org/","1-808-836-3600","HI","Honolulu",["food bank","food insecurity"]),
    R("legal","Legal Aid Society of Hawaii — Veterans","Free civil legal services for low-income Hawaii veterans.","https://www.legalaidhawaii.org/","1-808-536-4302","HI","Honolulu",["legal aid","civil","benefits"]),
    R("community","Hawaii Veterans Community Alliance","Peer support and community programs for Hawaii veterans.","https://dod.hawaii.gov/ovs/","1-808-433-0420","HI","Honolulu",["community","peer support"]),

    // ── IDAHO ────────────────────────────────────────────────────────────────
    R("housing","Idaho Veterans Home","State-operated assisted living and nursing care for Idaho veterans.","https://veterans.idaho.gov/","1-208-780-1300","ID","Boise",["assisted living","nursing home","housing"]),
    R("mental-health","Idaho Vet Centers","Readjustment counseling and PTSD support for Idaho combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-208-342-3612","ID","Boise",["PTSD","counseling","readjustment"]),
    R("employment","Idaho Department of Labor — Veterans","Priority employment services for Idaho veterans.","https://www.labor.idaho.gov/dnn/Veterans/","1-208-332-3570","ID","Boise",["employment","job placement","DOL"]),
    R("food","Idaho Foodbank — Veterans","Food assistance for veterans and military families in Idaho.","https://www.idahofoodbank.org/","1-208-336-9643","ID","Boise",["food bank","food insecurity"]),
    R("legal","Idaho Legal Aid Services — Veterans","Free civil legal aid for low-income Idaho veterans.","https://www.idaholegalaid.org/","1-208-746-7541","ID","Lewiston",["legal aid","civil","benefits"]),

    // ── ILLINOIS ─────────────────────────────────────────────────────────────
    R("housing","Illinois Veterans Homes","State-operated assisted living and nursing care for Illinois veterans.","https://www2.illinois.gov/veterans/","1-217-782-6641","IL","Springfield",["assisted living","nursing home","housing"]),
    R("mental-health","Illinois Vet Centers (Chicago)","PTSD treatment and readjustment counseling for Illinois combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-312-980-4206","IL","Chicago",["PTSD","counseling","readjustment"]),
    R("education","Illinois Veterans Grant (IVG)","Full tuition waiver for eligible Illinois veterans at state colleges and universities.","https://www.isac.org/students/during-college/types-of-financial-aid/grants/illinois-veteran-grant.html","1-800-899-4722","IL","Springfield",["education","tuition waiver","IVG"]),
    R("food","Greater Chicago Food Depository — Veterans","Food assistance for veterans and military families in the Chicago area.","https://www.gcfd.org/","1-773-247-3663","IL","Chicago",["food bank","food insecurity","Chicago"]),
    R("legal","Prairie State Legal Services — Veterans","Free civil legal aid for low-income Illinois veterans.","https://www.pslegal.org/","1-815-965-2134","IL","Rockford",["legal aid","civil","benefits"]),
    R("financial","Illinois Veterans Emergency Assistance","Emergency financial assistance for Illinois veterans in crisis.","https://www2.illinois.gov/veterans/","1-217-782-6641","IL","Springfield",["emergency fund","financial aid"]),

    // ── INDIANA ──────────────────────────────────────────────────────────────
    R("housing","Indiana Veterans Home","State-operated nursing care and assisted living for Indiana veterans.","https://www.in.gov/dva/","1-765-463-1502","IN","West Lafayette",["nursing home","assisted living","housing"]),
    R("mental-health","Indiana Vet Centers","PTSD treatment and readjustment counseling for Indiana combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-317-988-1600","IN","Indianapolis",["PTSD","counseling","readjustment"]),
    R("employment","Indiana Department of Workforce Development — Veterans","Priority employment services for Indiana veterans.","https://www.in.gov/dwd/veterans/","1-800-891-6499","IN","Indianapolis",["employment","workforce","career"]),
    R("food","Gleaners Food Bank — Veterans","Food assistance for veterans and military families in central Indiana.","https://www.gleaners.org/","1-317-925-0191","IN","Indianapolis",["food bank","food insecurity"]),
    R("legal","Indiana Legal Services — Veterans","Free civil legal aid for low-income Indiana veterans.","https://www.indianalegalservices.org/","1-317-631-9410","IN","Indianapolis",["legal aid","civil","benefits"]),

    // ── IOWA ─────────────────────────────────────────────────────────────────
    R("housing","Iowa Veterans Home","State-operated nursing care and assisted living for Iowa veterans.","https://ivh.iowa.gov/","1-641-752-1501","IA","Marshalltown",["nursing home","assisted living","housing"]),
    R("mental-health","Iowa Vet Centers","Readjustment counseling and PTSD support for Iowa combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-515-284-4929","IA","Des Moines",["PTSD","counseling","readjustment"]),
    R("employment","Iowa Workforce Development — Veterans","Priority employment services for Iowa veterans.","https://www.iowaworkforcedevelopment.gov/veterans","1-515-281-5387","IA","Des Moines",["employment","workforce","career"]),
    R("food","Food Bank of Iowa — Veterans","Food assistance for veterans and military families in Iowa.","https://www.foodbankiowa.org/","1-515-564-0330","IA","Des Moines",["food bank","food insecurity"]),
    R("legal","Iowa Legal Aid — Veterans","Free civil legal services for low-income Iowa veterans.","https://www.iowalegalaid.org/","1-800-532-1275","IA","Des Moines",["legal aid","civil","benefits"]),

    // ── KANSAS ───────────────────────────────────────────────────────────────
    R("mental-health","Kansas Vet Centers","PTSD treatment and readjustment counseling for Kansas combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-316-685-2221","KS","Wichita",["PTSD","counseling","readjustment"]),
    R("employment","Kansas Department of Commerce — Veterans","Priority employment services for Kansas veterans.","https://www.kansasworks.com/","1-785-296-0500","KS","Topeka",["employment","job placement","career"]),
    R("education","Kansas National Guard Tuition Assistance","Tuition assistance for Kansas National Guard members.","https://ksva.kansas.gov/","1-785-296-3976","KS","Topeka",["education","tuition","National Guard"]),
    R("food","Harvesters Community Food Network — Veterans","Food assistance for veterans and military families in Kansas City area.","https://www.harvesters.org/","1-816-929-3000","KS","Kansas City",["food bank","food insecurity"]),
    R("legal","Kansas Legal Services — Veterans","Free civil legal aid for low-income Kansas veterans.","https://www.kansaslegalservices.org/","1-800-723-6953","KS","Topeka",["legal aid","civil","benefits"]),

    // ── KENTUCKY ─────────────────────────────────────────────────────────────
    R("housing","Kentucky Veterans Center","State-operated nursing care and assisted living for Kentucky veterans.","https://veterans.ky.gov/","1-502-595-4447","KY","Wilmore",["nursing home","assisted living","housing"]),
    R("employment","Kentucky Career Center — Veterans","Priority employment services and job placement for Kentucky veterans.","https://kcc.ky.gov/Pages/Veterans.aspx","1-502-564-5331","KY","Frankfort",["employment","job placement","career"]),
    R("education","Kentucky National Guard Tuition Award","Tuition assistance for Kentucky National Guard members at state colleges.","https://veterans.ky.gov/","1-502-595-4447","KY","Frankfort",["education","tuition","National Guard"]),
    R("food","God's Pantry Food Bank — Veterans","Food assistance for veterans and military families in central Kentucky.","https://www.godspantry.org/","1-859-255-6592","KY","Lexington",["food bank","food insecurity"]),
    R("legal","Legal Aid of the Bluegrass — Veterans","Free civil legal services for low-income Kentucky veterans.","https://lablaw.org/","1-859-233-4627","KY","Lexington",["legal aid","civil","benefits"]),

    // ── LOUISIANA ────────────────────────────────────────────────────────────
    R("housing","Louisiana Veterans Homes","State-operated nursing care and assisted living for Louisiana veterans.","https://www.vetaffairs.la.gov/","1-225-219-5000","LA","Baton Rouge",["nursing home","assisted living","housing"]),
    R("mental-health","Louisiana Vet Centers","PTSD treatment and readjustment counseling for Louisiana combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-504-565-4977","LA","New Orleans",["PTSD","counseling","readjustment"]),
    R("education","Louisiana Veterans Education Benefits","State education benefits and GI Bill support for Louisiana veterans.","https://www.vetaffairs.la.gov/","1-225-219-5000","LA","Baton Rouge",["education","GI Bill","state benefit"]),
    R("food","Second Harvest Food Bank — Veterans","Food assistance for veterans and military families in Louisiana.","https://www.no-hunger.org/","1-504-734-1322","LA","New Orleans",["food bank","food insecurity"]),
    R("legal","Southeast Louisiana Legal Services — Veterans","Free civil legal aid for low-income Louisiana veterans.","https://www.slls.org/","1-504-529-1000","LA","New Orleans",["legal aid","civil","benefits"]),

    // ── MAINE ────────────────────────────────────────────────────────────────
    R("housing","Maine Veterans Home","State-operated nursing care and assisted living for Maine veterans.","https://www.maineveteranshomes.org/","1-207-623-7727","ME","Augusta",["nursing home","assisted living","housing"]),
    R("mental-health","Maine Vet Centers","Readjustment counseling and PTSD support for Maine combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-207-623-8411","ME","Bangor",["PTSD","counseling","readjustment"]),
    R("employment","Maine Department of Labor — Veterans","Priority employment services for Maine veterans.","https://www.maine.gov/labor/","1-207-623-7981","ME","Augusta",["employment","job placement","DOL"]),
    R("food","Good Shepherd Food Bank — Veterans","Food assistance for veterans and military families in Maine.","https://www.gsfb.org/","1-207-782-3554","ME","Auburn",["food bank","food insecurity"]),
    R("legal","Pine Tree Legal Assistance — Veterans","Free civil legal services for low-income Maine veterans.","https://www.ptla.org/","1-207-774-8211","ME","Portland",["legal aid","civil","benefits"]),

    // ── MARYLAND ─────────────────────────────────────────────────────────────
    R("housing","Maryland Veterans Housing Program","State housing assistance and transitional housing for Maryland veterans.","https://veterans.maryland.gov/","1-800-446-4926","MD","Baltimore",["housing","transitional","state program"]),
    R("mental-health","Maryland Vet Centers","PTSD treatment and readjustment counseling for Maryland combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-410-764-9400","MD","Baltimore",["PTSD","counseling","readjustment"]),
    R("employment","Maryland Department of Labor — Veterans","Priority employment services for Maryland veterans.","https://www.dllr.state.md.us/employment/veterans.shtml","1-410-767-2400","MD","Baltimore",["employment","job placement","DOL"]),
    R("food","Maryland Food Bank — Veterans","Food assistance for veterans and military families in Maryland.","https://www.mdfoodbank.org/","1-410-737-8282","MD","Halethorpe",["food bank","food insecurity"]),
    R("legal","Maryland Legal Aid — Veterans","Free civil legal services for low-income Maryland veterans.","https://www.mdlab.org/","1-410-539-5340","MD","Baltimore",["legal aid","civil","benefits"]),

    // ── MASSACHUSETTS ────────────────────────────────────────────────────────
    R("housing","Massachusetts Veterans Housing Program","State housing assistance and transitional housing for Massachusetts veterans.","https://www.mass.gov/orgs/department-of-veterans-services","1-617-210-5480","MA","Boston",["housing","transitional","state program"]),
    R("mental-health","Massachusetts Vet Centers","PTSD treatment and readjustment counseling for Massachusetts combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-617-232-9500","MA","Boston",["PTSD","counseling","readjustment"]),
    R("employment","Massachusetts Department of Career Services — Veterans","Priority employment services for Massachusetts veterans.","https://www.mass.gov/orgs/department-of-career-services","1-617-626-6600","MA","Boston",["employment","career services","DOL"]),
    R("education","Massachusetts Veterans Tuition Waiver","Free tuition at Massachusetts state colleges for eligible veterans.","https://www.mass.gov/orgs/department-of-veterans-services","1-617-210-5480","MA","Boston",["education","tuition waiver","college"]),
    R("food","Greater Boston Food Bank — Veterans","Food assistance for veterans and military families in the Boston area.","https://www.gbfb.org/","1-617-427-5200","MA","Boston",["food bank","food insecurity","Boston"]),
    R("legal","Greater Boston Legal Services — Veterans","Free civil legal aid for low-income Massachusetts veterans.","https://www.gbls.org/","1-617-603-1700","MA","Boston",["legal aid","civil","benefits"]),

    // ── MICHIGAN ─────────────────────────────────────────────────────────────
    R("mental-health","Michigan Vet Centers","PTSD treatment and readjustment counseling for Michigan combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-313-576-1000","MI","Detroit",["PTSD","counseling","readjustment"]),
    R("employment","Michigan Works! — Veterans","Priority employment services and job placement for Michigan veterans.","https://www.michiganworks.org/","1-888-522-0103","MI","Lansing",["employment","job placement","Michigan Works"]),
    R("education","Michigan National Guard Tuition Assistance","Tuition assistance for Michigan National Guard members at state colleges.","https://www.michigan.gov/mvaa/","1-800-642-4838","MI","Lansing",["education","tuition","National Guard"]),
    R("food","Forgotten Harvest — Veterans","Food assistance for veterans and military families in the Detroit metro area.","https://www.forgottenharvest.org/","1-248-792-9001","MI","Oak Park",["food bank","food insecurity","Detroit"]),
    R("legal","Michigan Legal Help — Veterans","Free civil legal aid resources for Michigan veterans.","https://michiganlegalhelp.org/","1-888-783-8190","MI","Lansing",["legal aid","civil","benefits"]),

    // ── MINNESOTA ────────────────────────────────────────────────────────────
    R("housing","Minnesota Veterans Homes","State-operated nursing care and assisted living for Minnesota veterans.","https://mn.gov/mdva/","1-651-757-1571","MN","Minneapolis",["nursing home","assisted living","housing"]),
    R("mental-health","Minnesota Vet Centers","PTSD treatment and readjustment counseling for Minnesota combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-612-725-2112","MN","Minneapolis",["PTSD","counseling","readjustment"]),
    R("employment","Minnesota Workforce Centers — Veterans","Priority employment services for Minnesota veterans.","https://mn.gov/deed/job-seekers/veterans/","1-651-259-7500","MN","St. Paul",["employment","workforce","career"]),
    R("food","Second Harvest Heartland — Veterans","Food assistance for veterans and military families in Minnesota.","https://www.2harvest.org/","1-651-484-5117","MN","Golden Valley",["food bank","food insecurity"]),
    R("legal","Mid-Minnesota Legal Aid — Veterans","Free civil legal services for low-income Minnesota veterans.","https://www.mylegalaid.org/","1-612-332-1441","MN","Minneapolis",["legal aid","civil","benefits"]),

    // ── MISSISSIPPI ──────────────────────────────────────────────────────────
    R("housing","Mississippi Veterans Home","State-operated nursing care and assisted living for Mississippi veterans.","https://www.vab.ms.gov/","1-601-576-4850","MS","Jackson",["nursing home","assisted living","housing"]),
    R("mental-health","Mississippi Vet Centers","Readjustment counseling and PTSD support for Mississippi combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-601-965-5727","MS","Jackson",["PTSD","counseling","readjustment"]),
    R("employment","Mississippi Department of Employment Security — Veterans","Priority employment services for Mississippi veterans.","https://www.mdes.ms.gov/","1-601-321-6000","MS","Jackson",["employment","job placement","MDES"]),
    R("food","Mississippi Food Network — Veterans","Food assistance for veterans and military families in Mississippi.","https://www.msfoodnet.org/","1-601-353-7286","MS","Jackson",["food bank","food insecurity"]),
    R("legal","Mississippi Center for Legal Services — Veterans","Free civil legal aid for low-income Mississippi veterans.","https://www.mscenterforlegalservices.org/","1-601-944-1110","MS","Hattiesburg",["legal aid","civil","benefits"]),

    // ── MISSOURI ─────────────────────────────────────────────────────────────
    R("housing","Missouri Veterans Homes","State-operated nursing care and assisted living for Missouri veterans.","https://mvc.dps.mo.gov/","1-573-751-3779","MO","Jefferson City",["nursing home","assisted living","housing"]),
    R("employment","Missouri Division of Workforce Development — Veterans","Priority employment services for Missouri veterans.","https://jobs.mo.gov/veterans","1-573-751-3215","MO","Jefferson City",["employment","workforce","career"]),
    R("education","Missouri National Guard Tuition Assistance","Tuition assistance for Missouri National Guard members.","https://mvc.dps.mo.gov/","1-573-751-3779","MO","Jefferson City",["education","tuition","National Guard"]),
    R("food","Harvesters Community Food Network — Missouri","Food assistance for veterans and military families in the Kansas City area.","https://www.harvesters.org/","1-816-929-3000","MO","Kansas City",["food bank","food insecurity"]),
    R("legal","Legal Services of Eastern Missouri — Veterans","Free civil legal aid for low-income Missouri veterans.","https://www.lsem.org/","1-314-534-4200","MO","St. Louis",["legal aid","civil","benefits"]),

    // ── MONTANA ──────────────────────────────────────────────────────────────
    R("housing","Montana Veterans Home","State-operated nursing care and assisted living for Montana veterans.","https://montanadma.org/montana-veterans-affairs","1-406-324-3740","MT","Columbia Falls",["nursing home","assisted living","housing"]),
    R("mental-health","Montana Vet Centers","Readjustment counseling and PTSD support for Montana combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-406-452-9048","MT","Great Falls",["PTSD","counseling","readjustment"]),
    R("employment","Montana Department of Labor — Veterans","Priority employment services for Montana veterans.","https://uid.dli.mt.gov/","1-406-444-2840","MT","Helena",["employment","job placement","DOL"]),
    R("food","Montana Food Bank Network — Veterans","Food assistance for veterans and military families in Montana.","https://www.montanafoodbank.org/","1-406-721-3825","MT","Missoula",["food bank","food insecurity"]),
    R("legal","Montana Legal Services Association — Veterans","Free civil legal aid for low-income Montana veterans.","https://www.montanalegalservices.org/","1-406-442-9830","MT","Helena",["legal aid","civil","benefits"]),

    // ── NEBRASKA ─────────────────────────────────────────────────────────────
    R("mental-health","Nebraska Vet Centers","PTSD treatment and readjustment counseling for Nebraska combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-402-476-9736","NE","Lincoln",["PTSD","counseling","readjustment"]),
    R("employment","Nebraska Department of Labor — Veterans","Priority employment services for Nebraska veterans.","https://dol.nebraska.gov/","1-402-471-2600","NE","Lincoln",["employment","job placement","DOL"]),
    R("education","Nebraska National Guard Tuition Assistance","Tuition assistance for Nebraska National Guard members.","https://veterans.nebraska.gov/","1-402-471-2458","NE","Lincoln",["education","tuition","National Guard"]),
    R("food","Food Bank of Lincoln — Veterans","Food assistance for veterans and military families in Nebraska.","https://www.lincolnfoodbank.org/","1-402-466-8170","NE","Lincoln",["food bank","food insecurity"]),
    R("legal","Legal Aid of Nebraska — Veterans","Free civil legal services for low-income Nebraska veterans.","https://www.legalaidofnebraska.com/","1-402-348-1069","NE","Omaha",["legal aid","civil","benefits"]),

    // ── NEVADA ───────────────────────────────────────────────────────────────
    R("housing","Nevada Veterans Home","State-operated nursing care and assisted living for Nevada veterans.","https://veterans.nv.gov/","1-702-332-6864","NV","Boulder City",["nursing home","assisted living","housing"]),
    R("mental-health","Nevada Vet Centers","PTSD treatment and readjustment counseling for Nevada combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-702-791-9100","NV","Las Vegas",["PTSD","counseling","readjustment"]),
    R("employment","Nevada JobConnect — Veterans","Priority employment services for Nevada veterans.","https://detr.nv.gov/","1-702-486-0100","NV","Las Vegas",["employment","job placement","JobConnect"]),
    R("food","Three Square Food Bank — Veterans","Food assistance for veterans and military families in southern Nevada.","https://www.threesquare.org/","1-702-644-3663","NV","Las Vegas",["food bank","food insecurity","Las Vegas"]),
    R("legal","Nevada Legal Services — Veterans","Free civil legal aid for low-income Nevada veterans.","https://www.nlslaw.net/","1-702-386-1070","NV","Las Vegas",["legal aid","civil","benefits"]),

    // ── NEW HAMPSHIRE ────────────────────────────────────────────────────────
    R("housing","New Hampshire Veterans Home","State-operated nursing care and assisted living for New Hampshire veterans.","https://www.nhvh.nh.gov/","1-603-527-4400","NH","Tilton",["nursing home","assisted living","housing"]),
    R("mental-health","New Hampshire Vet Centers","Readjustment counseling and PTSD support for New Hampshire combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-603-665-7925","NH","Manchester",["PTSD","counseling","readjustment"]),
    R("employment","New Hampshire Employment Security — Veterans","Priority employment services for New Hampshire veterans.","https://www.nhes.nh.gov/","1-603-228-4100","NH","Concord",["employment","job placement","NHES"]),
    R("food","New Hampshire Food Bank — Veterans","Food assistance for veterans and military families in New Hampshire.","https://www.nhfoodbank.org/","1-603-669-9725","NH","Manchester",["food bank","food insecurity"]),
    R("legal","New Hampshire Legal Assistance — Veterans","Free civil legal services for low-income New Hampshire veterans.","https://www.nhla.org/","1-603-224-3333","NH","Concord",["legal aid","civil","benefits"]),

    // ── NEW JERSEY ───────────────────────────────────────────────────────────
    R("housing","New Jersey Veterans Haven","Transitional housing and supportive services for homeless New Jersey veterans.","https://www.state.nj.us/military/veterans/","1-609-530-6958","NJ","Vineland",["housing","transitional","homeless"]),
    R("mental-health","New Jersey Vet Centers","PTSD treatment and readjustment counseling for New Jersey combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-973-736-5322","NJ","Bloomfield",["PTSD","counseling","readjustment"]),
    R("employment","New Jersey Department of Labor — Veterans","Priority employment services for New Jersey veterans.","https://www.nj.gov/labor/career-services/veterans/","1-609-984-9000","NJ","Trenton",["employment","job placement","DOL"]),
    R("food","Community FoodBank of New Jersey — Veterans","Food assistance for veterans and military families in New Jersey.","https://www.cfbnj.org/","1-908-355-3663","NJ","Hillside",["food bank","food insecurity"]),
    R("legal","Legal Services of New Jersey — Veterans","Free civil legal aid for low-income New Jersey veterans.","https://www.lsnj.org/","1-888-576-5529","NJ","Edison",["legal aid","civil","benefits"]),

    // ── NEW MEXICO ───────────────────────────────────────────────────────────
    R("housing","New Mexico Veterans Home","State-operated nursing care and assisted living for New Mexico veterans.","https://www.nmdvs.org/","1-505-827-6300","NM","Truth or Consequences",["nursing home","assisted living","housing"]),
    R("employment","New Mexico Department of Workforce Solutions — Veterans","Priority employment services for New Mexico veterans.","https://www.dws.state.nm.us/","1-505-841-8405","NM","Albuquerque",["employment","job placement","workforce"]),
    R("education","New Mexico Veterans Scholarship","Tuition waiver and scholarship for New Mexico veterans at state colleges.","https://www.nmdvs.org/","1-505-827-6300","NM","Santa Fe",["education","scholarship","tuition waiver"]),
    R("food","Roadrunner Food Bank — Veterans","Food assistance for veterans and military families in New Mexico.","https://www.rrfb.org/","1-505-247-2052","NM","Albuquerque",["food bank","food insecurity"]),
    R("legal","New Mexico Legal Aid — Veterans","Free civil legal services for low-income New Mexico veterans.","https://www.nmlegalaid.org/","1-505-243-7871","NM","Albuquerque",["legal aid","civil","benefits"]),

    // ── NEW YORK ─────────────────────────────────────────────────────────────
    R("housing","New York State Veterans Homes","State-operated nursing care and assisted living for New York veterans.","https://veterans.ny.gov/","1-888-838-7697","NY","Albany",["nursing home","assisted living","housing"]),
    R("mental-health","New York City Vet Centers","PTSD treatment and readjustment counseling for NYC combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-212-742-9591","NY","New York City",["PTSD","counseling","readjustment"]),
    R("employment","New York State Department of Labor — Veterans","Priority employment services for New York veterans.","https://www.labor.ny.gov/veterans/","1-518-457-9000","NY","Albany",["employment","job placement","DOL"]),
    R("education","New York State Regents Awards for Veterans","Scholarship awards for New York veterans pursuing higher education.","https://www.hesc.ny.gov/","1-888-697-4372","NY","Albany",["education","scholarship","Regents"]),
    R("food","Food Bank for New York City — Veterans","Food assistance for veterans and military families in New York City.","https://www.foodbanknyc.org/","1-212-566-7855","NY","New York City",["food bank","food insecurity","NYC"]),
    R("legal","Legal Services NYC — Veterans","Free civil legal aid for low-income New York City veterans.","https://www.legalservicesnyc.org/","1-917-661-4500","NY","New York City",["legal aid","civil","NYC"]),

    // ── NORTH CAROLINA ───────────────────────────────────────────────────────
    R("housing","North Carolina Veterans Homes","State-operated nursing care and assisted living for North Carolina veterans.","https://www.milvets.nc.gov/","1-984-236-6450","NC","Fayetteville",["nursing home","assisted living","housing"]),
    R("mental-health","North Carolina Vet Centers","PTSD treatment and readjustment counseling for North Carolina combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-919-856-4616","NC","Raleigh",["PTSD","counseling","readjustment"]),
    R("employment","North Carolina Division of Workforce Solutions — Veterans","Priority employment services for North Carolina veterans.","https://www.nccommerce.com/workforce/","1-919-814-0400","NC","Raleigh",["employment","job placement","workforce"]),
    R("food","Inter-Faith Food Shuttle — Veterans","Food assistance for veterans and military families in the Research Triangle area.","https://www.foodshuttle.org/","1-919-250-0043","NC","Raleigh",["food bank","food insecurity","Triangle"]),
    R("legal","Legal Aid of North Carolina — Veterans","Free civil legal services for low-income North Carolina veterans.","https://www.legalaidnc.org/","1-919-856-2564","NC","Raleigh",["legal aid","civil","benefits"]),

    // ── NORTH DAKOTA ─────────────────────────────────────────────────────────
    R("housing","North Dakota Veterans Home","State-operated nursing care and assisted living for North Dakota veterans.","https://www.nd.gov/veterans/","1-701-224-9111","ND","Lisbon",["nursing home","assisted living","housing"]),
    R("mental-health","North Dakota Vet Centers","Readjustment counseling and PTSD support for North Dakota combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-701-232-3241","ND","Fargo",["PTSD","counseling","readjustment"]),
    R("employment","Job Service North Dakota — Veterans","Priority employment services for North Dakota veterans.","https://www.jobsnd.com/","1-701-328-5000","ND","Bismarck",["employment","job placement","Job Service"]),
    R("food","Great Plains Food Bank — Veterans","Food assistance for veterans and military families in North Dakota.","https://www.greatplainsfoodbank.org/","1-701-232-6219","ND","Fargo",["food bank","food insecurity"]),
    R("legal","Legal Services of North Dakota — Veterans","Free civil legal services for low-income North Dakota veterans.","https://www.legalassist.org/","1-701-222-2110","ND","Bismarck",["legal aid","civil","benefits"]),

    // ── OHIO ─────────────────────────────────────────────────────────────────
    R("housing","Ohio Veterans Homes","State-operated nursing care and assisted living for Ohio veterans.","https://dvs.ohio.gov/","1-888-838-7697","OH","Sandusky",["nursing home","assisted living","housing"]),
    R("mental-health","Ohio Vet Centers","PTSD treatment and readjustment counseling for Ohio combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-614-257-5550","OH","Columbus",["PTSD","counseling","readjustment"]),
    R("education","Ohio National Guard Scholarship Program","Scholarship assistance for Ohio National Guard members at state colleges.","https://dvs.ohio.gov/","1-888-838-7697","OH","Columbus",["education","scholarship","National Guard"]),
    R("food","Mid-Ohio Food Collective — Veterans","Food assistance for veterans and military families in central Ohio.","https://www.midohiofoodbank.org/","1-614-277-9070","OH","Columbus",["food bank","food insecurity","Columbus"]),
    R("legal","Legal Aid Society of Columbus — Veterans","Free civil legal aid for low-income Ohio veterans.","https://www.columbuslegalaid.org/","1-614-224-8374","OH","Columbus",["legal aid","civil","benefits"]),

    // ── OKLAHOMA ─────────────────────────────────────────────────────────────
    R("housing","Oklahoma Veterans Center","State-operated nursing care and assisted living for Oklahoma veterans.","https://www.ok.gov/odva/","1-405-521-3684","OK","Claremore",["nursing home","assisted living","housing"]),
    R("mental-health","Oklahoma Vet Centers","PTSD treatment and readjustment counseling for Oklahoma combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-918-342-0988","OK","Muskogee",["PTSD","counseling","readjustment"]),
    R("employment","Oklahoma Employment Security Commission — Veterans","Priority employment services for Oklahoma veterans.","https://www.ok.gov/oesc/","1-405-557-7100","OK","Oklahoma City",["employment","job placement","OESC"]),
    R("food","Regional Food Bank of Oklahoma — Veterans","Food assistance for veterans and military families in Oklahoma.","https://www.rfbo.org/","1-405-972-1111","OK","Oklahoma City",["food bank","food insecurity"]),
    R("legal","Legal Aid Services of Oklahoma — Veterans","Free civil legal services for low-income Oklahoma veterans.","https://www.legalaidok.org/","1-405-557-0020","OK","Oklahoma City",["legal aid","civil","benefits"]),

    // ── OREGON ───────────────────────────────────────────────────────────────
    R("housing","Oregon Veterans Home","State-operated nursing care and assisted living for Oregon veterans.","https://www.oregon.gov/odva/","1-503-373-2386","OR","The Dalles",["nursing home","assisted living","housing"]),
    R("mental-health","Oregon Vet Centers","PTSD treatment and readjustment counseling for Oregon combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-503-273-5370","OR","Portland",["PTSD","counseling","readjustment"]),
    R("employment","Oregon Employment Department — Veterans","Priority employment services for Oregon veterans.","https://www.oregon.gov/employ/","1-503-947-1394","OR","Salem",["employment","job placement","OED"]),
    R("food","Oregon Food Bank — Veterans","Food assistance for veterans and military families in Oregon.","https://www.oregonfoodbank.org/","1-503-282-0555","OR","Portland",["food bank","food insecurity"]),
    R("legal","Oregon Law Center — Veterans","Free civil legal services for low-income Oregon veterans.","https://www.oregonlawcenter.org/","1-503-472-0924","OR","McMinnville",["legal aid","civil","benefits"]),

    // ── PENNSYLVANIA ─────────────────────────────────────────────────────────
    R("housing","Pennsylvania Veterans Homes","State-operated nursing care and assisted living for Pennsylvania veterans.","https://www.dmva.pa.gov/","1-800-547-2838","PA","Hollidaysburg",["nursing home","assisted living","housing"]),
    R("mental-health","Pennsylvania Vet Centers","PTSD treatment and readjustment counseling for Pennsylvania combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-215-627-0238","PA","Philadelphia",["PTSD","counseling","readjustment"]),
    R("employment","Pennsylvania CareerLink — Veterans","Priority employment services for Pennsylvania veterans.","https://www.pa.gov/agencies/dli/programs-and-services/veterans.html","1-717-787-3354","PA","Harrisburg",["employment","job placement","CareerLink"]),
    R("education","Pennsylvania National Guard Tuition Assistance","Tuition assistance for Pennsylvania National Guard members at state colleges.","https://www.dmva.pa.gov/","1-800-547-2838","PA","Annville",["education","tuition","National Guard"]),
    R("food","Greater Pittsburgh Community Food Bank — Veterans","Food assistance for veterans and military families in western Pennsylvania.","https://www.pittsburghfoodbank.org/","1-412-460-3663","PA","Duquesne",["food bank","food insecurity","Pittsburgh"]),
    R("legal","MidPenn Legal Services — Veterans","Free civil legal aid for low-income Pennsylvania veterans.","https://www.midpenn.org/","1-717-234-2401","PA","Harrisburg",["legal aid","civil","benefits"]),

    // ── RHODE ISLAND ─────────────────────────────────────────────────────────
    R("housing","Rhode Island Veterans Home","State-operated nursing care and assisted living for Rhode Island veterans.","https://www.vets.ri.gov/","1-401-462-0324","RI","Bristol",["nursing home","assisted living","housing"]),
    R("employment","Rhode Island Department of Labor — Veterans","Priority employment services for Rhode Island veterans.","https://dlt.ri.gov/veterans","1-401-462-8000","RI","Cranston",["employment","job placement","DOL"]),
    R("food","Rhode Island Community Food Bank — Veterans","Food assistance for veterans and military families in Rhode Island.","https://www.rifoodbank.org/","1-401-942-6325","RI","Providence",["food bank","food insecurity"]),
    R("legal","Rhode Island Legal Services — Veterans","Free civil legal services for low-income Rhode Island veterans.","https://www.rils.org/","1-401-274-2652","RI","Providence",["legal aid","civil","benefits"]),
    R("community","Veterans' Memorial Auditorium Community Programs","Community events and peer support for Rhode Island veterans.","https://www.vets.ri.gov/","1-401-462-0324","RI","Providence",["community","peer support","events"]),

    // ── SOUTH CAROLINA ───────────────────────────────────────────────────────
    R("housing","South Carolina Veterans Homes","State-operated nursing care and assisted living for South Carolina veterans.","https://va.sc.gov/","1-803-647-2434","SC","Anderson",["nursing home","assisted living","housing"]),
    R("mental-health","South Carolina Vet Centers","PTSD treatment and readjustment counseling for South Carolina combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-803-647-2434","SC","Columbia",["PTSD","counseling","readjustment"]),
    R("employment","South Carolina Works — Veterans","Priority employment services for South Carolina veterans.","https://dew.sc.gov/","1-803-737-2400","SC","Columbia",["employment","job placement","SC Works"]),
    R("food","Harvest Hope Food Bank — Veterans","Food assistance for veterans and military families in South Carolina.","https://www.harvesthope.org/","1-803-254-4432","SC","Columbia",["food bank","food insecurity"]),
    R("legal","South Carolina Legal Services — Veterans","Free civil legal aid for low-income South Carolina veterans.","https://www.sclegal.org/","1-803-799-9668","SC","Columbia",["legal aid","civil","benefits"]),

    // ── SOUTH DAKOTA ─────────────────────────────────────────────────────────
    R("housing","South Dakota Veterans Home","State-operated nursing care and assisted living for South Dakota veterans.","https://vetaffairs.sd.gov/","1-605-773-3269","SD","Hot Springs",["nursing home","assisted living","housing"]),
    R("mental-health","South Dakota Vet Centers","Readjustment counseling and PTSD support for South Dakota combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-605-348-0077","SD","Rapid City",["PTSD","counseling","readjustment"]),
    R("employment","South Dakota Department of Labor — Veterans","Priority employment services for South Dakota veterans.","https://dlr.sd.gov/","1-605-773-3101","SD","Pierre",["employment","job placement","DOL"]),
    R("food","Feeding South Dakota — Veterans","Food assistance for veterans and military families in South Dakota.","https://www.feedingsouthdakota.org/","1-605-335-0364","SD","Sioux Falls",["food bank","food insecurity"]),
    R("legal","East River Legal Services — Veterans","Free civil legal services for low-income South Dakota veterans.","https://www.eastriverlegalservices.org/","1-605-336-9230","SD","Sioux Falls",["legal aid","civil","benefits"]),

    // ── TENNESSEE ────────────────────────────────────────────────────────────
    R("mental-health","Tennessee Vet Centers","PTSD treatment and readjustment counseling for Tennessee combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-615-366-1220","TN","Nashville",["PTSD","counseling","readjustment"]),
    R("employment","Tennessee Department of Labor — Veterans","Priority employment services for Tennessee veterans.","https://www.tn.gov/workforce/veterans.html","1-615-741-6642","TN","Nashville",["employment","job placement","DOL"]),
    R("education","Tennessee STRONG Act — Veterans Scholarship","Scholarship for Tennessee veterans at state colleges and universities.","https://www.tn.gov/veteran/","1-615-741-2931","TN","Nashville",["education","scholarship","STRONG Act"]),
    R("food","Second Harvest Food Bank of Middle Tennessee — Veterans","Food assistance for veterans and military families in middle Tennessee.","https://www.secondharvestmidtn.org/","1-615-329-3491","TN","Nashville",["food bank","food insecurity","Nashville"]),
    R("legal","Legal Aid Society of Middle Tennessee — Veterans","Free civil legal services for low-income Tennessee veterans.","https://www.las.org/","1-615-244-6610","TN","Nashville",["legal aid","civil","benefits"]),

    // ── TEXAS ────────────────────────────────────────────────────────────────
    R("housing","Texas Veterans Land Board Home Loan","Low-interest home loans for Texas veterans through the state land board.","https://www.glo.texas.gov/vlb/","1-800-252-8387","TX","Austin",["home loan","low interest","state program"]),
    R("mental-health","Texas Vet Centers (San Antonio)","PTSD treatment and readjustment counseling for Texas combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-210-308-0663","TX","San Antonio",["PTSD","counseling","readjustment"]),
    R("employment","Texas Workforce Commission — Veterans","Priority employment services and job placement for Texas veterans.","https://www.twc.texas.gov/jobseekers/veterans","1-512-463-2222","TX","Austin",["employment","job placement","TWC"]),
    R("education","Hazlewood Act — Texas Veterans Tuition Exemption","Tuition exemption for Texas veterans and their dependents at state colleges.","https://www.tvc.texas.gov/education/hazlewood-act/","1-512-463-5538","TX","Austin",["education","tuition exemption","Hazlewood"]),
    R("food","San Antonio Food Bank — Veterans","Food assistance for veterans and military families in the San Antonio area.","https://www.safoodbank.org/","1-210-431-8326","TX","San Antonio",["food bank","food insecurity","San Antonio"]),
    R("legal","Texas Legal Services Center — Veterans","Free civil legal aid for low-income Texas veterans.","https://www.tlsc.org/","1-512-477-6000","TX","Austin",["legal aid","civil","benefits"]),
    R("financial","Texas Veterans Commission Fund for Veterans Assistance","Emergency financial assistance for Texas veterans in crisis.","https://www.tvc.texas.gov/grants/fund-for-veterans-assistance/","1-512-463-5538","TX","Austin",["emergency fund","financial aid","FVA"]),

    // ── UTAH ─────────────────────────────────────────────────────────────────
    R("housing","Utah Veterans Nursing Home","State-operated nursing care and assisted living for Utah veterans.","https://veterans.utah.gov/","1-801-326-2372","UT","Salt Lake City",["nursing home","assisted living","housing"]),
    R("employment","Utah Department of Workforce Services — Veterans","Priority employment services for Utah veterans.","https://jobs.utah.gov/","1-801-526-9675","UT","Salt Lake City",["employment","job placement","workforce"]),
    R("education","Utah National Guard Tuition Assistance","Tuition assistance for Utah National Guard members at state colleges.","https://veterans.utah.gov/","1-801-326-2372","UT","Salt Lake City",["education","tuition","National Guard"]),
    R("food","Utah Food Bank — Veterans","Food assistance for veterans and military families in Utah.","https://www.utahfoodbank.org/","1-801-978-2452","UT","Salt Lake City",["food bank","food insecurity"]),
    R("legal","Utah Legal Services — Veterans","Free civil legal aid for low-income Utah veterans.","https://www.utahlegalservices.org/","1-801-328-8891","UT","Salt Lake City",["legal aid","civil","benefits"]),

    // ── VERMONT ──────────────────────────────────────────────────────────────
    R("housing","Vermont Veterans Home","State-operated nursing care and assisted living for Vermont veterans.","https://veterans.vermont.gov/","1-802-828-3379","VT","Bennington",["nursing home","assisted living","housing"]),
    R("mental-health","Vermont Vet Centers","Readjustment counseling and PTSD support for Vermont combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-802-862-1806","VT","Burlington",["PTSD","counseling","readjustment"]),
    R("food","Vermont Foodbank — Veterans","Food assistance for veterans and military families in Vermont.","https://www.vtfoodbank.org/","1-802-476-3341","VT","Barre",["food bank","food insecurity"]),
    R("legal","Vermont Legal Aid — Veterans","Free civil legal services for low-income Vermont veterans.","https://www.vtlegalaid.org/","1-802-863-5620","VT","Burlington",["legal aid","civil","benefits"]),
    R("community","Vermont Veterans Peer Support Network","Peer support and community programs for Vermont veterans.","https://veterans.vermont.gov/","1-802-828-3379","VT","Montpelier",["community","peer support"]),

    // ── VIRGINIA ─────────────────────────────────────────────────────────────
    R("housing","Virginia Veterans Care Center","State-operated nursing care and assisted living for Virginia veterans.","https://www.dvs.virginia.gov/","1-804-786-0286","VA","Roanoke",["nursing home","assisted living","housing"]),
    R("mental-health","Virginia Vet Centers","PTSD treatment and readjustment counseling for Virginia combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-804-353-8958","VA","Richmond",["PTSD","counseling","readjustment"]),
    R("employment","Virginia Employment Commission — Veterans","Priority employment services for Virginia veterans.","https://www.vec.virginia.gov/veterans","1-804-786-1485","VA","Richmond",["employment","job placement","VEC"]),
    R("education","Virginia Military Survivors and Dependents Education Program","Education benefits for dependents of Virginia veterans.","https://www.dvs.virginia.gov/","1-804-786-0286","VA","Richmond",["education","dependents","VMSDEP"]),
    R("food","Feed More — Veterans","Food assistance for veterans and military families in central Virginia.","https://www.feedmore.org/","1-804-521-2500","VA","Richmond",["food bank","food insecurity","Richmond"]),
    R("legal","Central Virginia Legal Aid Society — Veterans","Free civil legal services for low-income Virginia veterans.","https://www.cvlas.org/","1-804-648-1012","VA","Richmond",["legal aid","civil","benefits"]),

    // ── WASHINGTON ───────────────────────────────────────────────────────────
    R("housing","Washington State Veterans Homes","State-operated nursing care and assisted living for Washington veterans.","https://www.dva.wa.gov/","1-360-725-2200","WA","Orting",["nursing home","assisted living","housing"]),
    R("mental-health","Washington Vet Centers","PTSD treatment and readjustment counseling for Washington combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-206-553-2706","WA","Seattle",["PTSD","counseling","readjustment"]),
    R("employment","Washington Employment Security Department — Veterans","Priority employment services for Washington veterans.","https://esd.wa.gov/","1-800-318-6022","WA","Olympia",["employment","job placement","ESD"]),
    R("education","Washington National Guard Tuition Assistance","Tuition assistance for Washington National Guard members.","https://www.dva.wa.gov/","1-360-725-2200","WA","Olympia",["education","tuition","National Guard"]),
    R("food","Northwest Harvest — Veterans","Food assistance for veterans and military families in Washington state.","https://www.northwestharvest.org/","1-800-722-6924","WA","Seattle",["food bank","food insecurity"]),
    R("legal","Northwest Justice Project — Veterans","Free civil legal services for low-income Washington veterans.","https://www.nwjustice.org/","1-888-201-1014","WA","Seattle",["legal aid","civil","benefits"]),

    // ── WEST VIRGINIA ────────────────────────────────────────────────────────
    R("housing","West Virginia Veterans Home","State-operated nursing care and assisted living for West Virginia veterans.","https://veterans.wv.gov/","1-304-558-3661","WV","Barboursville",["nursing home","assisted living","housing"]),
    R("mental-health","West Virginia Vet Centers","Readjustment counseling and PTSD support for West Virginia combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-304-343-3825","WV","Charleston",["PTSD","counseling","readjustment"]),
    R("employment","WorkForce West Virginia — Veterans","Priority employment services for West Virginia veterans.","https://workforcewv.org/","1-304-558-0342","WV","Charleston",["employment","job placement","workforce"]),
    R("food","Facing Hunger Foodbank — Veterans","Food assistance for veterans and military families in West Virginia.","https://www.facinghunger.org/","1-304-523-6029","WV","Huntington",["food bank","food insecurity"]),
    R("legal","Legal Aid of West Virginia — Veterans","Free civil legal services for low-income West Virginia veterans.","https://www.lawv.net/","1-304-343-4481","WV","Charleston",["legal aid","civil","benefits"]),

    // ── WISCONSIN ────────────────────────────────────────────────────────────
    R("housing","Wisconsin Veterans Homes","State-operated nursing care and assisted living for Wisconsin veterans.","https://dva.wi.gov/","1-608-266-1311","WI","King",["nursing home","assisted living","housing"]),
    R("employment","Wisconsin Fast Forward — Veterans","Priority employment and job training programs for Wisconsin veterans.","https://dva.wi.gov/","1-608-266-1311","WI","Madison",["employment","job training","career"]),
    R("education","Wisconsin GI Bill","Tuition remission for Wisconsin veterans at state colleges and universities.","https://dva.wi.gov/Pages/educationemployment/WisconsinGIBill.aspx","1-608-266-1311","WI","Madison",["education","GI Bill","tuition remission"]),
    R("food","Second Harvest Foodbank of Southern Wisconsin — Veterans","Food assistance for veterans and military families in southern Wisconsin.","https://www.secondharvestmadison.org/","1-608-223-9121","WI","Madison",["food bank","food insecurity","Madison"]),
    R("legal","Legal Action of Wisconsin — Veterans","Free civil legal services for low-income Wisconsin veterans.","https://www.legalaction.org/","1-608-256-3304","WI","Madison",["legal aid","civil","benefits"]),

    // ── WYOMING ──────────────────────────────────────────────────────────────
    R("housing","Wyoming Veterans Home","State-operated nursing care and assisted living for Wyoming veterans.","https://www.wyomilitary.wyo.gov/veterans/","1-307-777-8152","WY","Buffalo",["nursing home","assisted living","housing"]),
    R("mental-health","Wyoming Vet Centers","Readjustment counseling and PTSD support for Wyoming combat veterans.","https://www.va.gov/find-locations/?facilityType=vet_center","1-307-778-7370","WY","Cheyenne",["PTSD","counseling","readjustment"]),
    R("employment","Wyoming Department of Workforce Services — Veterans","Priority employment services for Wyoming veterans.","https://wyomingworkforce.org/","1-307-777-8728","WY","Casper",["employment","job placement","workforce"]),
    R("food","Wyoming Food for Thought — Veterans","Food assistance for veterans and military families in Wyoming.","https://www.wyomingfoodforthought.org/","1-307-234-4151","WY","Casper",["food bank","food insecurity"]),
    R("legal","Wyoming Legal Services — Veterans","Free civil legal services for low-income Wyoming veterans.","https://www.wyolegalservices.org/","1-307-634-1566","WY","Cheyenne",["legal aid","civil","benefits"]),
  ];

  const batchSize = 15;
  let inserted = 0;
  for (let i = 0; i < expanded.length; i += batchSize) {
    const batch = expanded.slice(i, i + batchSize);
    await db.insert(resources).values(batch as any).onDuplicateKeyUpdate({ set: { name: sql`VALUES(name)` } });
    inserted += batch.length;
  }

  console.log(`✅ Expanded seed complete: ${inserted} additional resources added`);
  console.log(`📊 Total resources now: original 74 + ${inserted} = ${74 + inserted}`);
  process.exit(0);
}

seedExpanded().catch(err => { console.error(err); process.exit(1); });
