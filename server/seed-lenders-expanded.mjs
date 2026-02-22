/**
 * Seed script: Add more VA lenders to cover all 50 states
 * Run: node server/seed-lenders-expanded.mjs
 */
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const ALL_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const newLenders = [
  // National lenders covering all 50 states
  {
    name: "USAA Federal Savings Bank",
    lenderType: "bank",
    statesServed: ALL_STATES,
    url: "https://www.usaa.com/inet/wc/bank-mortgage-va-loan",
    phone: "1-800-531-8722",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Exclusively serves military members, veterans, and their families. Offers competitive VA loan rates with no down payment required.",
  },
  {
    name: "PenFed Credit Union",
    lenderType: "credit_union",
    statesServed: ALL_STATES,
    url: "https://www.penfed.org/mortgages/va-loans",
    phone: "1-800-247-5626",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Pentagon Federal Credit Union — one of the largest credit unions in the US, serving military and government employees nationwide.",
  },
  {
    name: "Rocket Mortgage (VA Loans)",
    lenderType: "direct",
    statesServed: ALL_STATES,
    url: "https://www.rocketmortgage.com/learn/va-loan",
    phone: "1-800-769-6133",
    vaSpecialist: false,
    verifiedLevel: "verified",
    description: "America's largest mortgage lender offering VA loans with a fully digital application process and fast closings.",
  },
  {
    name: "Freedom Mortgage",
    lenderType: "direct",
    statesServed: ALL_STATES,
    url: "https://www.freedommortgage.com/va-loans",
    phone: "1-877-220-5533",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "One of the top VA lenders in the country, specializing in VA purchase and refinance loans for veterans and active duty.",
  },
  {
    name: "Caliber Home Loans",
    lenderType: "direct",
    statesServed: ALL_STATES,
    url: "https://www.caliberhomeloans.com/loans/va-loans",
    phone: "1-800-401-6587",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "National lender with dedicated VA loan specialists and competitive rates for veterans and service members.",
  },
  {
    name: "loanDepot",
    lenderType: "direct",
    statesServed: ALL_STATES,
    url: "https://www.loandepot.com/va-home-loans",
    phone: "1-888-983-3240",
    vaSpecialist: false,
    verifiedLevel: "verified",
    description: "One of the nation's largest non-bank mortgage lenders offering VA loans with competitive rates and an online application.",
  },
  {
    name: "NewDay USA",
    lenderType: "direct",
    statesServed: ALL_STATES,
    url: "https://www.newdayusa.com",
    phone: "1-844-638-3295",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Dedicated exclusively to serving veterans and military families with VA purchase loans and VA cash-out refinancing.",
  },
  {
    name: "Guaranteed Rate",
    lenderType: "direct",
    statesServed: ALL_STATES,
    url: "https://www.rate.com/va-loans",
    phone: "1-866-934-7283",
    vaSpecialist: false,
    verifiedLevel: "verified",
    description: "National digital mortgage lender offering VA loans with a streamlined online process and competitive rates.",
  },
  {
    name: "CrossCountry Mortgage",
    lenderType: "direct",
    statesServed: ALL_STATES,
    url: "https://www.crosscountrymortgage.com/loan-products/va-loans",
    phone: "1-877-773-7700",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Full-service mortgage lender with VA loan specialists available nationwide to help veterans achieve homeownership.",
  },
  {
    name: "Movement Mortgage (VA)",
    lenderType: "direct",
    statesServed: ALL_STATES,
    url: "https://movement.com/loan-types/va-loans",
    phone: "1-866-687-7555",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Mission-driven lender offering VA loans with a 6-day processing commitment and dedicated military lending team.",
  },
  // State-specific lenders
  {
    name: "Alaska USA Federal Credit Union",
    lenderType: "credit_union",
    statesServed: ["AK", "WA", "OR", "CA"],
    url: "https://www.alaskausa.org/loans/mortgage/va-loans",
    phone: "1-800-525-9094",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Alaska's largest credit union offering VA home loans with local expertise for veterans in the Pacific Northwest.",
  },
  {
    name: "Hawaii State Federal Credit Union",
    lenderType: "credit_union",
    statesServed: ["HI"],
    url: "https://www.hsfcu.com/loans/mortgage-loans/va-loans",
    phone: "1-808-587-2700",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Hawaii-based credit union serving military veterans with VA home loans tailored to Hawaii's unique real estate market.",
  },
  {
    name: "Mountain America Credit Union",
    lenderType: "credit_union",
    statesServed: ["UT", "ID", "NV", "AZ", "NM", "MT"],
    url: "https://www.macu.com/loans/home-loans/va-loans",
    phone: "1-800-748-4302",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Serving veterans across the Mountain West with competitive VA loan rates and local branch support.",
  },
  {
    name: "Randolph-Brooks Federal Credit Union",
    lenderType: "credit_union",
    statesServed: ["TX"],
    url: "https://www.rbfcu.org/loans/home-loans/va-loans.html",
    phone: "1-800-580-3300",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Texas-based credit union with deep roots in the military community, offering VA loans with no down payment.",
  },
  {
    name: "Seacoast Bank (VA Loans)",
    lenderType: "bank",
    statesServed: ["FL"],
    url: "https://www.seacoastbank.com/personal/loans/mortgage/va-loans",
    phone: "1-866-235-5698",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Florida community bank offering VA home loans with local expertise for veterans throughout the Sunshine State.",
  },
  {
    name: "Vystar Credit Union",
    lenderType: "credit_union",
    statesServed: ["FL", "GA"],
    url: "https://www.vystarcu.org/loans/mortgage/va-loans",
    phone: "1-904-777-6000",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Northeast Florida's largest credit union, serving veterans with VA loans in Florida and Georgia.",
  },
  {
    name: "Midwest Bank Holdings (VA)",
    lenderType: "bank",
    statesServed: ["IL", "IN", "OH", "MI", "WI", "MN", "IA", "MO"],
    url: "https://www.midwestbank.com/mortgage/va-loans",
    phone: "1-800-745-2265",
    vaSpecialist: false,
    verifiedLevel: "verified",
    description: "Regional bank serving veterans across the Midwest with competitive VA loan products and personalized service.",
  },
  {
    name: "TowneBank Mortgage (VA)",
    lenderType: "bank",
    statesServed: ["VA", "NC", "SC", "MD", "DC"],
    url: "https://www.townebankmorgage.com/va-loans",
    phone: "1-866-890-3400",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Mid-Atlantic community bank with VA loan specialists serving veterans in Virginia, the Carolinas, and Maryland.",
  },
  {
    name: "Sunflower Bank (VA Loans)",
    lenderType: "bank",
    statesServed: ["KS", "CO", "TX", "NM", "AZ", "MO"],
    url: "https://www.sunflowerbank.com/personal/mortgage/va-loans",
    phone: "1-800-794-5500",
    vaSpecialist: true,
    verifiedLevel: "verified",
    description: "Regional bank with strong ties to military communities in Kansas and surrounding states, offering VA loan expertise.",
  },
  {
    name: "Glacier Bank (VA Loans)",
    lenderType: "bank",
    statesServed: ["MT", "ID", "WY", "CO", "UT", "WA", "AZ", "NV"],
    url: "https://www.glacierbank.com/personal/mortgage/va-loans",
    phone: "1-800-735-4291",
    vaSpecialist: false,
    verifiedLevel: "verified",
    description: "Rocky Mountain regional bank offering VA home loans for veterans across Montana, Idaho, Wyoming, and neighboring states.",
  },
];

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Get existing lender names to avoid duplicates
const [existing] = await connection.execute('SELECT name FROM lenders');
const existingNames = new Set(existing.map(r => r.name));

let added = 0;
for (const lender of newLenders) {
  if (existingNames.has(lender.name)) {
    console.log(`Skipping (exists): ${lender.name}`);
    continue;
  }
  await connection.execute(
    `INSERT INTO lenders (name, lenderType, statesServed, url, phone, vaSpecialist, verifiedLevel, description, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
    [
      lender.name,
      lender.lenderType,
      JSON.stringify(lender.statesServed),
      lender.url,
      lender.phone,
      lender.vaSpecialist ? 1 : 0,
      lender.verifiedLevel,
      lender.description,
    ]
  );
  console.log(`Added: ${lender.name}`);
  added++;
}

const [cnt] = await connection.execute('SELECT COUNT(*) as n FROM lenders');
console.log(`\n✅ Added ${added} new lenders. Total: ${cnt[0].n}`);

await connection.end();
process.exit(0);
