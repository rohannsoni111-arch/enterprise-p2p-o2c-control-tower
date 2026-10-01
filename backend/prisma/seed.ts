import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Enterprise Digital Control Tower Database Seeding...');

  // Clean existing records in relational order
  await prisma.auditLog.deleteMany();
  await prisma.exceptionRecord.deleteMany();
  await prisma.businessRule.deleteMany();
  await prisma.kpiSnapshot.deleteMany();
  await prisma.customerInvoiceItem.deleteMany();
  await prisma.customerInvoice.deleteMany();
  await prisma.goodsIssue.deleteMany();
  await prisma.deliveryItem.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.customerInquiryItem.deleteMany();
  await prisma.customerInquiry.deleteMany();
  await prisma.supplierInvoiceItem.deleteMany();
  await prisma.supplierInvoice.deleteMany();
  await prisma.goodsReceiptItem.deleteMany();
  await prisma.goodsReceipt.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.purchaseRequisitionItem.deleteMany();
  await prisma.purchaseRequisition.deleteMany();
  await prisma.material.deleteMany();
  await prisma.storageLocation.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.purchasingOrg.deleteMany();
  await prisma.salesOrg.deleteMany();
  await prisma.distributionChannel.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // ==========================================
  // 1. SEED USERS & PERSONAS
  // ==========================================
  const salt = await bcrypt.genSalt(10);
  const commonPassword = await bcrypt.hash('Password123!', salt);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@controltower.corp',
        passwordHash: commonPassword,
        fullName: 'Alexander Vance (System Admin)',
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        username: 'procurement',
        email: 'procurement@controltower.corp',
        fullName: 'Elena Rostova (Lead Buyer - MM)',
        passwordHash: commonPassword,
        role: 'PROCUREMENT',
      },
    }),
    prisma.user.create({
      data: {
        username: 'warehouse',
        email: 'warehouse@controltower.corp',
        fullName: 'Marcus Weber (Logistics & Inventory Supervisor)',
        passwordHash: commonPassword,
        role: 'WAREHOUSE',
      },
    }),
    prisma.user.create({
      data: {
        username: 'finance',
        email: 'finance@controltower.corp',
        fullName: 'Sofia Lindqvist (AP/AR Financial Controller)',
        passwordHash: commonPassword,
        role: 'FINANCE',
      },
    }),
    prisma.user.create({
      data: {
        username: 'sales',
        email: 'sales@controltower.corp',
        fullName: 'David Chen (Senior Commercial Lead - SD)',
        passwordHash: commonPassword,
        role: 'SALES',
      },
    }),
    prisma.user.create({
      data: {
        username: 'management',
        email: 'director@controltower.corp',
        fullName: 'Dr. Beatrice Thorne (VP Global Supply Chain)',
        passwordHash: commonPassword,
        role: 'MANAGEMENT',
      },
    }),
  ]);
  console.log(`👤 Seeded ${users.length} enterprise user accounts.`);

  // ==========================================
  // 2. SEED ORGANIZATIONAL STRUCTURE
  // ==========================================
  const plants = await Promise.all([
    prisma.plant.create({ data: { code: 'PL1000', name: 'Berlin Heavy Assembly Plant', city: 'Berlin', country: 'DE' } }),
    prisma.plant.create({ data: { code: 'PL2000', name: 'Hamburg Logistics & Distribution Hub', city: 'Hamburg', country: 'DE' } }),
    prisma.plant.create({ data: { code: 'PL3000', name: 'Munich Precision Electronics Facility', city: 'Munich', country: 'DE' } }),
    prisma.plant.create({ data: { code: 'PL4000', name: 'Stuttgart Powertrain Plant', city: 'Stuttgart', country: 'DE' } }),
    prisma.plant.create({ data: { code: 'PL5000', name: 'Frankfurt Central Distribution Center', city: 'Frankfurt', country: 'DE' } }),
  ]);

  const storageLocations = await Promise.all([
    // Plant 1000
    prisma.storageLocation.create({ data: { code: 'SL01', name: 'Raw Material Bay 1', plantId: plants[0].id } }),
    prisma.storageLocation.create({ data: { code: 'SL02', name: 'Finished Machinery Yard', plantId: plants[0].id } }),
    prisma.storageLocation.create({ data: { code: 'SL03', name: 'Maintenance Spares', plantId: plants[0].id } }),
    // Plant 2000
    prisma.storageLocation.create({ data: { code: 'SL10', name: 'Dock Storage Import', plantId: plants[1].id } }),
    prisma.storageLocation.create({ data: { code: 'SL11', name: 'Export Staging Yard', plantId: plants[1].id } }),
    // Plant 3000
    prisma.storageLocation.create({ data: { code: 'SL20', name: 'Cleanroom Semi-conductors', plantId: plants[2].id } }),
    prisma.storageLocation.create({ data: { code: 'SL21', name: 'Quality Inspection Hold', plantId: plants[2].id } }),
    // Plant 4000
    prisma.storageLocation.create({ data: { code: 'SL30', name: 'Component Inventory Alpha', plantId: plants[3].id } }),
    prisma.storageLocation.create({ data: { code: 'SL31', name: 'Engine Staging Area', plantId: plants[3].id } }),
    // Plant 5000
    prisma.storageLocation.create({ data: { code: 'SL40', name: 'High-Bay Automated Racks', plantId: plants[4].id } }),
  ]);

  const purchasingOrgs = await Promise.all([
    prisma.purchasingOrg.create({ data: { code: 'PO1000', name: 'Central European Purchasing Org' } }),
    prisma.purchasingOrg.create({ data: { code: 'PO2000', name: 'Global Direct Procurement Org' } }),
  ]);

  const salesOrgs = await Promise.all([
    prisma.salesOrg.create({ data: { code: 'SO1000', name: 'DACH Commercial Sales Org' } }),
    prisma.salesOrg.create({ data: { code: 'SO2000', name: 'International Enterprise Export' } }),
  ]);

  const distChannels = await Promise.all([
    prisma.distributionChannel.create({ data: { code: 'DC10', name: 'Direct Industrial B2B' } }),
    prisma.distributionChannel.create({ data: { code: 'DC20', name: 'Authorized Wholesale Network' } }),
    prisma.distributionChannel.create({ data: { code: 'DC30', name: 'OEM Tier-1 Integration' } }),
  ]);

  console.log(`🏭 Seeded Plants (5), Storage Locations (10), Purchasing Orgs (2), Sales Orgs (2), Distribution Channels (3).`);

  // ==========================================
  // 3. SEED VENDORS (15 Enterprise Suppliers)
  // ==========================================
  const vendorData = [
    { num: 'VND-1001', name: 'Apex Industrial Castings GmbH', contact: 'Klaus Richter', email: 'k.richter@apex-castings.de', terms: 'NET30', curr: 'EUR', delTol: 5.0, priceTol: 2.0, lead: 12, rating: 4.8 },
    { num: 'VND-1002', name: 'Bavaria Micro-Optics AG', contact: 'Greta Hoffmann', email: 'g.hoffmann@bavaria-optics.com', terms: 'NET30', curr: 'EUR', delTol: 3.0, priceTol: 1.5, lead: 18, rating: 4.6 },
    { num: 'VND-1003', name: 'Nordic Alloy Solutions Oy', contact: 'Matti Virtanen', email: 'm.virtanen@nordicalloy.fi', terms: 'NET60', curr: 'EUR', delTol: 6.0, priceTol: 3.0, lead: 14, rating: 4.2 },
    { num: 'VND-1004', name: 'Vanguard Hydraulic Systems BV', contact: 'Jan Van Dijk', email: 'j.vandijk@vanguardhydraulics.nl', terms: 'NET30', curr: 'EUR', delTol: 4.0, priceTol: 2.0, lead: 8, rating: 4.7 },
    { num: 'VND-1005', name: 'Alpine Precision Fasteners SA', contact: 'Matthieu Blanc', email: 'm.blanc@alpinefasteners.ch', terms: 'NET30', curr: 'EUR', delTol: 5.0, priceTol: 2.5, lead: 7, rating: 4.9 },
    { num: 'VND-1006', name: 'Rhine-Ruhr Steel Processing KG', contact: 'Jorg Becker', email: 'j.becker@rhineruhr-steel.de', terms: 'NET60', curr: 'EUR', delTol: 8.0, priceTol: 4.0, lead: 21, rating: 3.8 },
    { num: 'VND-1007', name: 'Helios Advanced Polymers NV', contact: 'Annemie Dupont', email: 'a.dupont@heliospolymers.be', terms: 'NET30', curr: 'EUR', delTol: 5.0, priceTol: 2.0, lead: 10, rating: 4.4 },
    { num: 'VND-1008', name: 'Kobe Heavy Industrial Ltd', contact: 'Kenji Sato', email: 'k.sato@kobe-heavy.jp', terms: 'NET60', curr: 'EUR', delTol: 4.0, priceTol: 2.0, lead: 35, rating: 4.5 },
    { num: 'VND-1009', name: 'Trans-Alpine Logistics & Packaging', contact: 'Lucia Ferri', email: 'l.ferri@transalpine.it', terms: 'NET30', curr: 'EUR', delTol: 10.0, priceTol: 5.0, lead: 5, rating: 3.9 },
    { num: 'VND-1010', name: 'EuroCircuit Microtechnics SAS', contact: 'Claire Moreau', email: 'c.moreau@eurocircuit.fr', terms: 'NET30', curr: 'EUR', delTol: 2.0, priceTol: 1.0, lead: 15, rating: 4.9 },
    { num: 'VND-1011', name: 'Danube Electric Motors Kft', contact: 'Zoltan Kovacs', email: 'z.kovacs@danubemotors.hu', terms: 'NET45', curr: 'EUR', delTol: 5.0, priceTol: 2.0, lead: 16, rating: 4.1 },
    { num: 'VND-1012', name: 'Atlas Fluid Power Corporation', contact: 'Robert Myers', email: 'r.myers@atlasfluid.com', terms: 'NET30', curr: 'EUR', delTol: 4.0, priceTol: 2.0, lead: 12, rating: 4.3 },
    { num: 'VND-1013', name: 'Silesian Sensor Systems Sp.', contact: 'Tomasz Nowak', email: 't.nowak@silesiansensors.pl', terms: 'NET30', curr: 'EUR', delTol: 3.0, priceTol: 1.5, lead: 9, rating: 4.6 },
    { num: 'VND-1014', name: 'Continental Synthetic Rubber KG', contact: 'Stefan Wagner', email: 's.wagner@continentalsynth.de', terms: 'NET45', curr: 'EUR', delTol: 5.0, priceTol: 2.5, lead: 14, rating: 4.0 },
    { num: 'VND-1015', name: 'Valmet Process Automation Oy', contact: 'Eero Lehtonen', email: 'e.lehtonen@valmetprocess.fi', terms: 'NET60', curr: 'EUR', delTol: 3.0, priceTol: 1.5, lead: 20, rating: 4.7 },
  ];

  const vendors = await Promise.all(
    vendorData.map((v) =>
      prisma.vendor.create({
        data: {
          vendorNumber: v.num,
          name: v.name,
          contactPerson: v.contact,
          email: v.email,
          paymentTerms: v.terms,
          currency: v.curr,
          deliveryTolerancePct: v.delTol,
          priceTolerancePct: v.priceTol,
          leadTimeDays: v.lead,
          rating: v.rating,
        },
      })
    )
  );
  console.log(`🏢 Seeded ${vendors.length} Vendors.`);

  // ==========================================
  // 4. SEED CUSTOMERS (25 Enterprise B2B Accounts)
  // ==========================================
  const customerData = [
    { num: 'CUST-1001', name: 'Siemens Energy Global GmbH', contact: 'Dr. Herbert Maier', email: 'h.maier@siemens-energy.de', terms: 'NET60', limit: 250000, bal: 42000, addr: 'Freyeslebenstr. 1, Erlangen', reg: 'EMEA' },
    { num: 'CUST-1002', name: 'BMW Manufacturing Steyr AG', contact: 'Ursula Brandl', email: 'u.brandl@bmw-steyr.at', terms: 'NET30', limit: 350000, bal: 85000, addr: 'Werkstr. 3, Steyr', reg: 'EMEA' },
    { num: 'CUST-1003', name: 'Alstom Transport SA', contact: 'Jean-Marc Duval', email: 'jm.duval@alstom.fr', terms: 'NET45', limit: 180000, bal: 31000, addr: '48 Rue Albert Dhalenne, Saint-Ouen', reg: 'EMEA' },
    { num: 'CUST-1004', name: 'Vestas Wind Systems A/S', contact: 'Lars Christensen', email: 'l.christensen@vestas.dk', terms: 'NET30', limit: 400000, bal: 110000, addr: 'Hedeager 42, Aarhus', reg: 'EMEA' },
    { num: 'CUST-1005', name: 'ABB Robotics Switzerland', contact: 'Patrick Schneider', email: 'p.schneider@ch.abb.com', terms: 'NET60', limit: 300000, bal: 65000, addr: 'Affolternstr. 44, Zurich', reg: 'EMEA' },
    { num: 'CUST-1006', name: 'Rolls-Royce Power Systems AG', contact: 'Martin Fischer', email: 'm.fischer@rrpowersystems.com', terms: 'NET45', limit: 220000, bal: 54000, addr: 'Maybachplatz 1, Friedrichshafen', reg: 'EMEA' },
    { num: 'CUST-1007', name: 'Atlas Copco Industrial Technique', contact: 'Erik Lindbergh', email: 'e.lindbergh@atlascopco.se', terms: 'NET30', limit: 150000, bal: 23000, addr: 'Sickla Industrivag 19, Nacka', reg: 'EMEA' },
    { num: 'CUST-1008', name: 'Schneider Electric Industries SAS', contact: 'Benoit Lefebvre', email: 'b.lefebvre@se.com', terms: 'NET60', limit: 280000, bal: 72000, addr: '35 Rue Joseph Monier, Rueil-Malmaison', reg: 'EMEA' },
    { num: 'CUST-1009', name: 'Prysmian Group SpA', contact: 'Matteo Rossi', email: 'm.rossi@prysmiangroup.it', terms: 'NET45', limit: 160000, bal: 39000, addr: 'Via Chiese 6, Milan', reg: 'EMEA' },
    { num: 'CUST-1010', name: 'Knorr-Bremse Rail Systems GmbH', contact: 'Werner Gruber', email: 'w.gruber@knorr-bremse.com', terms: 'NET30', limit: 200000, bal: 48000, addr: 'Moosacher Str. 80, Munich', reg: 'EMEA' },
    { num: 'CUST-1011', name: 'Hitachi Energy Poland Sp. z o.o.', contact: 'Piotr Wisniewski', email: 'p.wisniewski@hitachienergy.pl', terms: 'NET45', limit: 140000, bal: 27000, addr: 'ul. Zaganikowa 80, Warsaw', reg: 'EMEA' },
    { num: 'CUST-1012', name: 'Stadler Rail AG', contact: 'Beat Zuber', email: 'b.zuber@stadlerrail.com', terms: 'NET60', limit: 320000, bal: 94000, addr: 'Ernst-Stadler-Str. 1, Bussnang', reg: 'EMEA' },
    { num: 'CUST-1013', name: 'Voith Hydro Holding GmbH', contact: 'Karin Meyer', email: 'k.meyer@voith.com', terms: 'NET30', limit: 190000, bal: 38000, addr: 'Alexanderstr. 11, Heidenheim', reg: 'EMEA' },
    { num: 'CUST-1014', name: 'Danfoss Power Solutions ApS', contact: 'Frederik Moller', email: 'f.moller@danfoss.com', terms: 'NET30', limit: 260000, bal: 51000, addr: 'Nordborgvej 81, Nordborg', reg: 'EMEA' },
    { num: 'CUST-1015', name: 'Caterpillar Marine Europe BV', contact: 'Willem De Vries', email: 'w.devries@cat.com', terms: 'NET60', limit: 310000, bal: 88000, addr: 'Coenecoop 19, Waddinxveen', reg: 'EMEA' },
    { num: 'CUST-1016', name: 'GE Renewable Energy Norway AS', contact: 'Astrid Solberg', email: 'a.solberg@ge.com', terms: 'NET45', limit: 210000, bal: 46000, addr: 'Karenslyst Alle 2, Oslo', reg: 'EMEA' },
    { num: 'CUST-1017', name: 'Wartsila Energy Solutions Oy', contact: 'Juha Maki', email: 'j.maki@wartsila.com', terms: 'NET30', limit: 275000, bal: 61000, addr: 'John Stenbergin ranta 2, Helsinki', reg: 'EMEA' },
    { num: 'CUST-1018', name: 'Metso Outotec Metals Oy', contact: 'Sari Koskinen', email: 's.koskinen@mogroup.com', terms: 'NET60', limit: 195000, bal: 49000, addr: 'Toolonlahdenkatu 2, Helsinki', reg: 'EMEA' },
    { num: 'CUST-1019', name: 'Endress+Hauser Flowtec AG', contact: 'Rolf Baumgartner', email: 'r.baumgartner@endress.com', terms: 'NET30', limit: 160000, bal: 34000, addr: 'Kagenstr. 7, Reinach', reg: 'EMEA' },
    { num: 'CUST-1020', name: 'Sulzer Chemtech Ltd', contact: 'Fabian Keller', email: 'f.keller@sulzer.com', terms: 'NET45', limit: 175000, bal: 41000, addr: 'Sulzer-Allee 48, Winterthur', reg: 'EMEA' },
    { num: 'CUST-1021', name: 'Tokyo Electron Europe Ltd', contact: 'Akira Tanaka', email: 'a.tanaka@tel.com', terms: 'NET30', limit: 300000, bal: 79000, addr: 'Hemel Hempstead, UK', reg: 'EMEA' },
    { num: 'CUST-1022', name: 'Samsung C&T Deutschland GmbH', contact: 'Min-Soo Park', email: 'ms.park@samsung.com', terms: 'NET60', limit: 450000, bal: 145000, addr: 'Am Kronberger Hang 6, Schwalbach', reg: 'EMEA' },
    { num: 'CUST-1023', name: 'Tata Steel Tubes Europe BV', contact: 'Rohan Sharma', email: 'r.sharma@tatasteel.com', terms: 'NET30', limit: 230000, bal: 52000, addr: 'Wenckebachstraat 1, Velsen-Noord', reg: 'EMEA' },
    { num: 'CUST-1024', name: 'Petrofac Engineering Services', contact: 'George Harrison', email: 'g.harrison@petrofac.com', terms: 'NET45', limit: 210000, bal: 44000, addr: '117 Park Drive, Milton Park', reg: 'EMEA' },
    { num: 'CUST-1025', name: 'Andritz Hydro GmbH', contact: 'Wolfgang Pichler', email: 'w.pichler@andritz.com', terms: 'NET60', limit: 340000, bal: 92000, addr: 'Lunzerstr. 78, Linz', reg: 'EMEA' },
  ];

  const customers = await Promise.all(
    customerData.map((c) =>
      prisma.customer.create({
        data: {
          customerNumber: c.num,
          name: c.name,
          contactPerson: c.contact,
          email: c.email,
          paymentTerms: c.terms,
          creditLimit: c.limit,
          currentBalance: c.bal,
          shippingAddress: c.addr,
          region: c.reg,
        },
      })
    )
  );
  console.log(`🛒 Seeded ${customers.length} B2B Enterprise Customers.`);

  // ==========================================
  // 5. SEED MATERIALS (30 Industrial Materials)
  // ==========================================
  const materialData = [
    // RAW Materials
    { num: 'MAT-1001', name: 'Cast Steel Housing Block C45', cat: 'RAW', uom: 'EA', pIdx: 0, sIdx: 0, stock: 450, safety: 100, reorder: 200, cost: 240, price: 320, desc: 'Heavy machinery structural casting' },
    { num: 'MAT-1002', name: 'High-Tensile Alloy Rod 316L', cat: 'RAW', uom: 'KG', pIdx: 0, sIdx: 0, stock: 1200, safety: 300, reorder: 500, cost: 18.5, price: 26, desc: 'Corrosion resistant stainless rod stock' },
    { num: 'MAT-1003', name: 'Hydraulic Cylinder Piston 80mm', cat: 'RAW', uom: 'EA', pIdx: 0, sIdx: 0, stock: 85, safety: 90, reorder: 150, cost: 145, price: 210, desc: 'Hard chrome plated hydraulic piston' }, // LOW STOCK trigger!
    { num: 'MAT-1004', name: 'Optical Sapphire Prism 25mm', cat: 'RAW', uom: 'EA', pIdx: 2, sIdx: 5, stock: 320, safety: 50, reorder: 100, cost: 380, price: 540, desc: 'Precision sensor optical beam splitter' },
    { num: 'MAT-1005', name: 'Fluoropolymer O-Ring Pack DN50', cat: 'RAW', uom: 'PAL', pIdx: 0, sIdx: 0, stock: 40, safety: 15, reorder: 30, cost: 85, price: 130, desc: 'High-temp chemical containment gaskets' },
    { num: 'MAT-1006', name: 'Copper Busbar Strip 50x5mm', cat: 'RAW', uom: 'M', pIdx: 2, sIdx: 5, stock: 650, safety: 150, reorder: 250, cost: 42, price: 65, desc: 'Electrolytic high conductivity busbars' },
    { num: 'MAT-1007', name: 'Polyurethane Synthetic Sealant', cat: 'RAW', uom: 'L', pIdx: 0, sIdx: 0, stock: 35, safety: 50, reorder: 100, cost: 28, price: 44, desc: 'Industrial weatherproof sealing compound' }, // LOW STOCK trigger!
    { num: 'MAT-1008', name: 'Reinforced Carbon Fiber Sheet 2mm', cat: 'RAW', uom: 'M', pIdx: 2, sIdx: 5, stock: 180, safety: 40, reorder: 80, cost: 160, price: 240, desc: 'Aviation-grade structural laminate' },
    { num: 'MAT-1009', name: 'Silicon Carbide Micro-Grit', cat: 'RAW', uom: 'KG', pIdx: 2, sIdx: 5, stock: 950, safety: 200, reorder: 400, cost: 14, price: 22, desc: 'Abrasive surface finishing aggregate' },
    { num: 'MAT-1010', name: 'Titanium Fastener Grade 5 M12', cat: 'RAW', uom: 'EA', pIdx: 0, sIdx: 2, stock: 2400, safety: 500, reorder: 1000, cost: 12.5, price: 19, desc: 'Ultra-light high-stress metric bolts' },

    // FINISHED Products
    { num: 'MAT-2001', name: 'Centrifugal Slurry Pump SP-500', cat: 'FINISHED', uom: 'EA', pIdx: 0, sIdx: 1, stock: 42, safety: 10, reorder: 20, cost: 3200, price: 4800, desc: 'Heavy duty mining slurry transfer pump' },
    { num: 'MAT-2002', name: 'Multi-Axis Servo Controller SC-4', cat: 'FINISHED', uom: 'EA', pIdx: 2, sIdx: 5, stock: 110, safety: 25, reorder: 50, cost: 1850, price: 2750, desc: 'Precision robotic drive controller' },
    { num: 'MAT-2003', name: 'Industrial Heat Exchanger HX-12', cat: 'FINISHED', uom: 'EA', pIdx: 0, sIdx: 1, stock: 18, safety: 5, reorder: 10, cost: 6400, price: 9200, desc: 'Titanium plate steam heat exchanger' },
    { num: 'MAT-2004', name: 'Smart Flowmeter Doppler DF-80', cat: 'FINISHED', uom: 'EA', pIdx: 2, sIdx: 5, stock: 75, safety: 20, reorder: 40, cost: 950, price: 1450, desc: 'Ultrasonic pipeline telemetry sensor' },
    { num: 'MAT-2005', name: 'Heavy Planetary Gearbox PG-350', cat: 'FINISHED', uom: 'EA', pIdx: 3, sIdx: 8, stock: 28, safety: 8, reorder: 15, cost: 4200, price: 6100, desc: 'High torque reduction gear assembly' },
    { num: 'MAT-2006', name: 'Hydraulic Power Unit HPU-75kW', cat: 'FINISHED', uom: 'EA', pIdx: 0, sIdx: 1, stock: 12, safety: 15, reorder: 25, cost: 8900, price: 13500, desc: 'Complete hydraulic skid station' }, // LOW STOCK trigger!
    { num: 'MAT-2007', name: 'Automated Guided Vehicle AGV-2T', cat: 'FINISHED', uom: 'EA', pIdx: 1, sIdx: 4, stock: 8, safety: 2, reorder: 5, cost: 18500, price: 27000, desc: 'Autonomous factory material transport' },
    { num: 'MAT-2008', name: 'Cleanroom Air Handling Unit AHU-10', cat: 'FINISHED', uom: 'EA', pIdx: 2, sIdx: 5, stock: 15, safety: 4, reorder: 8, cost: 11200, price: 16800, desc: 'HEPA filtered environmental regulator' },
    { num: 'MAT-2009', name: 'Turbine Exhaust Recuperator ER-9', cat: 'FINISHED', uom: 'EA', pIdx: 3, sIdx: 8, stock: 6, safety: 2, reorder: 4, cost: 24000, price: 35000, desc: 'Heat recovery secondary loop generator' },
    { num: 'MAT-2010', name: 'Programmable Logic Gateway PLG-3', cat: 'FINISHED', uom: 'EA', pIdx: 2, sIdx: 5, stock: 140, safety: 30, reorder: 60, cost: 620, price: 980, desc: 'OPC-UA edge telecommunications hub' },

    // TRADING Goods
    { num: 'MAT-3001', name: 'Digital Torque Calibrator TC-500', cat: 'TRADING', uom: 'EA', pIdx: 4, sIdx: 9, stock: 65, safety: 15, reorder: 30, cost: 820, price: 1250, desc: 'Portable ISO 6789 torque tester' },
    { num: 'MAT-3002', name: 'High-Pressure Safety Relief Valve', cat: 'TRADING', uom: 'EA', pIdx: 4, sIdx: 9, stock: 190, safety: 40, reorder: 80, cost: 290, price: 440, desc: 'ASME certified pressure vent valve' },
    { num: 'MAT-3003', name: 'Industrial Ethernet Switch 24-Port', cat: 'TRADING', uom: 'EA', pIdx: 4, sIdx: 9, stock: 88, safety: 20, reorder: 40, cost: 480, price: 750, desc: 'Managed DIN-rail ruggedized switch' },
    { num: 'MAT-3004', name: 'Vibration Monitoring Accelerometer', cat: 'TRADING', uom: 'EA', pIdx: 4, sIdx: 9, stock: 24, safety: 25, reorder: 50, cost: 310, price: 490, desc: 'Predictive maintenance sensor head' }, // LOW STOCK trigger!
    { num: 'MAT-3005', name: 'Pneumatic Actuator Rotary 90-Deg', cat: 'TRADING', uom: 'EA', pIdx: 4, sIdx: 9, stock: 115, safety: 30, reorder: 60, cost: 260, price: 390, desc: 'Spring return rack & pinion actuator' },
    { num: 'MAT-3006', name: 'Ceramic Bearing Assembly 6208', cat: 'TRADING', uom: 'EA', pIdx: 4, sIdx: 9, stock: 340, safety: 80, reorder: 150, cost: 95, price: 155, desc: 'Silicon nitride ultra-low friction bearing' },
    { num: 'MAT-3007', name: 'Thermal Imaging Monocular TIM-2', cat: 'TRADING', uom: 'EA', pIdx: 4, sIdx: 9, stock: 30, safety: 10, reorder: 20, cost: 1650, price: 2450, desc: 'Electrical cabinet thermal inspection tool' },
    { num: 'MAT-3008', name: 'Gas Chromatograph Column GC-30', cat: 'TRADING', uom: 'EA', pIdx: 2, sIdx: 5, stock: 55, safety: 15, reorder: 30, cost: 720, price: 1100, desc: 'Fused silica capillary analysis column' },
    { num: 'MAT-3009', name: 'Industrial Laser Barcode Scanner', cat: 'TRADING', uom: 'EA', pIdx: 4, sIdx: 9, stock: 72, safety: 20, reorder: 35, cost: 340, price: 520, desc: 'Long-range omnidirectional scan head' },
    { num: 'MAT-3010', name: 'Fiber Optic Transceiver 10G SFP+', cat: 'TRADING', uom: 'EA', pIdx: 4, sIdx: 9, stock: 450, safety: 100, reorder: 200, cost: 65, price: 110, desc: 'Industrial temperature single-mode module' },
  ];

  const materials = await Promise.all(
    materialData.map((m) =>
      prisma.material.create({
        data: {
          materialNumber: m.num,
          name: m.name,
          category: m.cat,
          uom: m.uom,
          plantId: plants[m.pIdx].id,
          storageLocationId: storageLocations[m.sIdx].id,
          currentStock: m.stock,
          safetyStock: m.safety,
          reorderLevel: m.reorder,
          standardCost: m.cost,
          sellingPrice: m.price,
          description: m.desc,
        },
      })
    )
  );
  console.log(`📦 Seeded ${materials.length} Materials with inventory parameters.`);

  // ==========================================
  // 6. SEED BUSINESS RULES (RULE-001 through RULE-010)
  // ==========================================
  const ruleData = [
    {
      code: 'RULE-001',
      name: 'Invoice Quantity Variance',
      desc: 'Invoice quantity exceeds verified goods receipt quantity (Short-shipment overbill).',
      cat: 'P2P',
      expr: 'Invoice.InvoicedQty > GoodsReceipt.ReceivedQty',
      thresh: 0.0,
      sev: 'HIGH',
      action: 'Hold invoice payment; contact vendor for credit note or verify unposted dock goods receipt.',
    },
    {
      code: 'RULE-002',
      name: 'Invoice Price Variance',
      desc: 'Invoiced unit price differs from contractually agreed Purchase Order price beyond vendor tolerance.',
      cat: 'P2P',
      expr: 'abs(Invoice.UnitPrice - PO.UnitPrice) / PO.UnitPrice > Vendor.PriceTolerancePct / 100',
      thresh: 2.0,
      sev: 'HIGH',
      action: 'Apply SAP Block R (Price Discrepancy); initiate price investigation with purchasing buyer.',
    },
    {
      code: 'RULE-003',
      name: 'Goods Receipt Quantity Discrepancy',
      desc: 'Physical dock delivery quantity deviates from original Purchase Order quantity beyond delivery tolerance.',
      cat: 'P2P',
      expr: 'abs(GR.ReceivedQty - PO.OrderedQty) / PO.OrderedQty > Vendor.DeliveryTolerancePct / 100',
      thresh: 5.0,
      sev: 'MEDIUM',
      action: 'Flag delivery note; inspect packing slip and issue partial receipt or vendor return notice.',
    },
    {
      code: 'RULE-004',
      name: 'Safety Stock Breach (Low Stock)',
      desc: 'Current available stock has dropped strictly below configured Safety Stock threshold.',
      cat: 'INVENTORY',
      expr: 'Material.CurrentStock < Material.SafetyStock',
      thresh: 0.0,
      sev: 'CRITICAL',
      action: 'Trigger emergency procurement expedited order; assess ongoing production run stoppage risk.',
    },
    {
      code: 'RULE-005',
      name: 'Reorder Level Recommendation',
      desc: 'Current warehouse stock has reached or fallen below defined Economic Reorder Point.',
      cat: 'INVENTORY',
      expr: 'Material.CurrentStock <= Material.ReorderLevel',
      thresh: 0.0,
      sev: 'MEDIUM',
      action: 'Generate automated Purchase Requisition draft for standard Economic Order Quantity (EOQ).',
    },
    {
      code: 'RULE-006',
      name: 'Outbound Delivery Delay',
      desc: 'Sales delivery schedule is past planned delivery date without completion of Goods Issue dispatch.',
      cat: 'O2C',
      expr: 'CurrentDate > Delivery.PlannedDeliveryDate AND Delivery.Status != DELIVERED',
      thresh: 0.0,
      sev: 'HIGH',
      action: 'Escalate to warehouse dispatch supervisor; reassign carrier and send proactive delay notice to customer.',
    },
    {
      code: 'RULE-007',
      name: 'Open PO Aging Beyond SLA',
      desc: 'Purchase Order has remained in Sent/Partial status past standard fulfillment threshold (30 days).',
      cat: 'AGING',
      expr: 'CurrentDate - PO.OrderDate > 30 AND PO.Status in (SENT_TO_VENDOR, PARTIALLY_RECEIVED)',
      thresh: 30.0,
      sev: 'MEDIUM',
      action: 'Procurement buyer to expedite supplier confirmation; issue cancellation warning if no ship notice.',
    },
    {
      code: 'RULE-008',
      name: 'Sales Order Stock Fulfillment Risk',
      desc: 'Confirmed Sales Order line items exceed currently uncommitted available stock in target plant.',
      cat: 'O2C',
      expr: 'SalesOrderItem.OrderQty > Material.CurrentStock',
      thresh: 0.0,
      sev: 'HIGH',
      action: 'Initiate split delivery schedule or cross-dock transfer from regional sister warehouse plant.',
    },
    {
      code: 'RULE-009',
      name: 'Customer Credit Limit Exceeded',
      desc: 'New sales commitment elevates customer open receivables beyond sanctioned credit ceiling.',
      cat: 'CREDIT',
      expr: 'Customer.CurrentBalance + SalesOrder.TotalAmount > Customer.CreditLimit',
      thresh: 0.0,
      sev: 'CRITICAL',
      action: 'Place Sales Order on SAP Credit Hold; route to Credit Risk Manager for credit extension review.',
    },
    {
      code: 'RULE-010',
      name: 'Overdue Customer Receivables',
      desc: 'Customer Billing Document remains unpaid beyond agreed payment terms due date.',
      cat: 'O2C',
      expr: 'CurrentDate > CustomerInvoice.DueDate AND CustomerInvoice.Status == PENDING',
      thresh: 0.0,
      sev: 'MEDIUM',
      action: 'Trigger Level-1/2 automated Dunning Notice; restrict new order release pending credit clearance.',
    },
  ];

  const rules = await Promise.all(
    ruleData.map((r) =>
      prisma.businessRule.create({
        data: {
          ruleCode: r.code,
          name: r.name,
          description: r.desc,
          category: r.cat,
          conditionExpression: r.expr,
          thresholdValue: r.thresh,
          severity: r.sev,
          recommendedAction: r.action,
        },
      })
    )
  );
  console.log(`📋 Seeded ${rules.length} Core SAP-Inspired Business Rules.`);

  // ==========================================
  // 7. SEED P2P LIFECYCLE (50 PRs, 40 POs, 35 GRs, 40 Supplier Invoices)
  // ==========================================
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
  const daysAhead = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

  const purchaseRequisitions = [];
  for (let i = 1; i <= 50; i++) {
    const prNum = `PR-${10000 + i}`;
    const mat = materials[(i - 1) % materials.length];
    const qty = 50 + (i * 10) % 200;
    const estPrice = mat.standardCost * 1.02;

    let status = 'CONVERTED_TO_PO';
    if (i > 40 && i <= 45) status = 'APPROVED';
    else if (i > 45 && i <= 48) status = 'SUBMITTED';
    else if (i > 48) status = 'DRAFT';

    const reqDate = daysAgo(60 - i);
    const appDate = status !== 'DRAFT' && status !== 'SUBMITTED' ? daysAgo(58 - i) : null;

    const pr = await prisma.purchaseRequisition.create({
      data: {
        prNumber: prNum,
        requesterId: users[1].id, // Procurement user
        status,
        requestedDate: reqDate,
        approvedDate: appDate,
        notes: `Operational requirement for ${mat.name}`,
        items: {
          create: [
            {
              itemNumber: 10,
              materialId: mat.id,
              plantId: mat.plantId,
              quantity: qty,
              estimatedPrice: estPrice,
              requiredDate: daysAhead(14),
              status: status === 'CONVERTED_TO_PO' ? 'CONVERTED' : 'OPEN',
            },
          ],
        },
      },
      include: { items: true },
    });
    purchaseRequisitions.push(pr);
  }
  console.log(`📝 Seeded ${purchaseRequisitions.length} Purchase Requisitions.`);

  // 40 Purchase Orders (converted from PRs 1..40)
  const purchaseOrders = [];
  for (let i = 1; i <= 40; i++) {
    const poNum = `PO-${10000 + i}`;
    const pr = purchaseRequisitions[i - 1];
    const vendor = vendors[(i - 1) % vendors.length];
    const mat = materials[(i - 1) % materials.length];
    const prItem = pr.items[0];

    let poStatus = 'FULLY_RECEIVED';
    if (i >= 36) poStatus = 'SENT_TO_VENDOR';
    else if (i >= 30) poStatus = 'PARTIALLY_RECEIVED';
    else if (i === 40) poStatus = 'CANCELLED';

    const orderDate = daysAgo(55 - i);
    const appDate = daysAgo(54 - i);
    const expDelDate = daysAgo(55 - i - vendor.leadTimeDays);
    const unitPrice = mat.standardCost;
    const netAmount = unitPrice * prItem.quantity;

    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: poNum,
        prId: pr.id,
        vendorId: vendor.id,
        purchasingOrgId: purchasingOrgs[i % purchasingOrgs.length].id,
        plantId: mat.plantId,
        status: poStatus,
        orderDate,
        approvedDate: appDate,
        expectedDeliveryDate: expDelDate,
        totalAmount: netAmount,
        notes: `Contract release PO under annual procurement framework agreement`,
        items: {
          create: [
            {
              itemNumber: 10,
              materialId: mat.id,
              storageLocationId: mat.storageLocationId,
              orderedQuantity: prItem.quantity,
              receivedQuantity: poStatus === 'FULLY_RECEIVED' ? prItem.quantity : poStatus === 'PARTIALLY_RECEIVED' ? Math.floor(prItem.quantity * 0.6) : 0,
              invoicedQuantity: poStatus === 'FULLY_RECEIVED' ? prItem.quantity : 0,
              unitPrice: unitPrice,
              netAmount: netAmount,
            },
          ],
        },
      },
      include: { items: true },
    });
    purchaseOrders.push(po);
  }
  console.log(`📦 Seeded ${purchaseOrders.length} Purchase Orders.`);

  // 35 Goods Receipts (for POs 1..35)
  const goodsReceipts = [];
  for (let i = 1; i <= 35; i++) {
    const grNum = `GR-${10000 + i}`;
    const po = purchaseOrders[i - 1];
    const poItem = po.items[0];
    const mat = materials[(i - 1) % materials.length];

    // Deliberate quantity mismatch on PO #3 (PO qty 100, GR receives 85 - shortage beyond tolerance)
    let recQty = poItem.orderedQuantity;
    let rejQty = 0;
    let grStatus = 'COMPLETE';

    if (i === 3) {
      recQty = Math.floor(poItem.orderedQuantity * 0.85); // 15% under-delivery
      grStatus = 'PARTIAL';
    } else if (i === 8) {
      rejQty = 5;
      recQty = poItem.orderedQuantity - rejQty;
      grStatus = 'PARTIAL';
    }

    const postingDate = new Date(po.orderDate.getTime() + 10 * 24 * 60 * 60 * 1000);

    const gr = await prisma.goodsReceipt.create({
      data: {
        grNumber: grNum,
        poId: po.id,
        plantId: po.plantId,
        postingDate,
        documentDate: postingDate,
        movementType: '101', // SAP Movement 101 Goods Receipt
        status: grStatus,
        deliveryNoteNumber: `DN-${vendorData[(i - 1) % 15].num.substring(4)}-${i}`,
        notes: `Dock physical inspection passed Movement 101 GR`,
        items: {
          create: [
            {
              poItemId: poItem.id,
              materialId: mat.id,
              storageLocationId: mat.storageLocationId,
              receivedQuantity: recQty,
              rejectedQuantity: rejQty,
              inspectionStatus: rejQty > 0 ? 'PARTIAL_REJECT' : 'ACCEPTED',
            },
          ],
        },
      },
      include: { items: true },
    });
    goodsReceipts.push(gr);
  }
  console.log(`🚚 Seeded ${goodsReceipts.length} Goods Receipts (SAP Mvt 101).`);

  // 40 Supplier Invoices (for POs 1..40)
  const supplierInvoices = [];
  for (let i = 1; i <= 40; i++) {
    const invNum = `INV-${10000 + i}`;
    const po = purchaseOrders[i - 1];
    const gr = i <= goodsReceipts.length ? goodsReceipts[i - 1] : null;
    const poItem = po.items[0];
    const mat = materials[(i - 1) % materials.length];

    let invQty = poItem.orderedQuantity;
    let invPrice = poItem.unitPrice;
    let matchStatus = 'MATCHED';
    let payStatus = 'PAYMENT_READY';
    let blockReason = null;

    // Deliberate price variance on PO #5 (PO Price: 100, Inv Price: 108 -> 8% variance > 2% tol)
    if (i === 5) {
      invPrice = Number((poItem.unitPrice * 1.08).toFixed(2));
      matchStatus = 'PRICE_VARIANCE';
      payStatus = 'UNPAID';
      blockReason = 'Blocked: Price variance of 8.0% exceeds contractual tolerance of 2.0%';
    }
    // Deliberate quantity variance on PO #3 (GR was short: 85, but Invoice billed for 100)
    else if (i === 3) {
      invQty = poItem.orderedQuantity; // Billed for 100 while GR was 85
      matchStatus = 'QUANTITY_VARIANCE';
      payStatus = 'UNPAID';
      blockReason = 'Blocked: Invoiced quantity 100 exceeds verified Goods Receipt quantity 85';
    }
    // Deliberate unreceived invoice on PO #38 (PO sent, no GR yet, invoice arrived early)
    else if (i === 38) {
      matchStatus = 'BLOCKED';
      payStatus = 'UNPAID';
      blockReason = 'Blocked: No Goods Receipt posted for referenced Purchase Order';
    } else if (i > 30) {
      matchStatus = 'PENDING';
      payStatus = 'UNPAID';
    } else if (i <= 20) {
      payStatus = 'PAID';
    }

    const invTotal = invQty * invPrice;
    const invDate = gr ? new Date(gr.postingDate.getTime() + 3 * 24 * 60 * 60 * 1000) : daysAgo(5);
    const dueDate = new Date(invDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    const inv = await prisma.supplierInvoice.create({
      data: {
        invoiceNumber: invNum,
        poId: po.id,
        grId: gr ? gr.id : null,
        vendorId: po.vendorId,
        invoiceDate: invDate,
        postingDate: invDate,
        dueDate,
        totalAmount: invTotal,
        matchStatus,
        paymentStatus: payStatus,
        paidDate: payStatus === 'PAID' ? new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000) : null,
        blockReason,
        notes: `Supplier commercial invoice line verified against PO ${po.poNumber}`,
        items: {
          create: [
            {
              poItemId: poItem.id,
              materialId: mat.id,
              invoicedQuantity: invQty,
              unitPrice: invPrice,
              lineTotal: invTotal,
              priceVariance: invPrice - poItem.unitPrice,
              quantityVariance: gr ? invQty - gr.items[0].receivedQuantity : 0,
            },
          ],
        },
      },
      include: { items: true },
    });
    supplierInvoices.push(inv);
  }
  console.log(`🧾 Seeded ${supplierInvoices.length} Supplier Invoices with 3-Way Matching states.`);

  // ==========================================
  // 8. SEED O2C LIFECYCLE (40 Inquiries, 50 Sales Orders, 40 Deliveries, 40 Invoices)
  // ==========================================
  const customerInquiries = [];
  for (let i = 1; i <= 40; i++) {
    const inqNum = `INQ-${10000 + i}`;
    const cust = customers[(i - 1) % customers.length];
    const mat = materials[(i * 3) % materials.length];

    const inq = await prisma.customerInquiry.create({
      data: {
        inqNumber: inqNum,
        customerId: cust.id,
        salesOrgId: salesOrgs[i % salesOrgs.length].id,
        status: i <= 35 ? 'CONVERTED' : 'OPEN',
        inquiryDate: daysAgo(50 - i),
        validUntil: daysAhead(30),
        notes: `Customer requested formal industrial quotation for ${mat.name}`,
        items: {
          create: [
            {
              itemNumber: 10,
              materialId: mat.id,
              requestedQuantity: 20 + (i * 5) % 100,
              targetPrice: mat.sellingPrice * 0.98,
            },
          ],
        },
      },
      include: { items: true },
    });
    customerInquiries.push(inq);
  }
  console.log(`📑 Seeded ${customerInquiries.length} Customer Inquiries.`);

  const salesOrders = [];
  for (let i = 1; i <= 50; i++) {
    const soNum = `SO-${10000 + i}`;
    const inq = i <= 35 ? customerInquiries[i - 1] : null;
    const cust = customers[(i - 1) % customers.length];
    const mat = materials[(i * 2) % materials.length];

    let orderQty = 15 + (i * 4) % 60;
    let soStatus = 'FULFILLED';
    let creditStatus = 'APPROVED';

    // Deliberate credit check exception on SO #4 (Customer 4 with large order exceeding limit)
    if (i === 4) {
      orderQty = 120; // 120 * selling price will breach credit limit
      creditStatus = 'BLOCKED';
      soStatus = 'DRAFT';
    } else if (i >= 42) {
      soStatus = 'CONFIRMED';
    } else if (i >= 38) {
      soStatus = 'PARTIALLY_FULFILLED';
    }

    const orderDate = daysAgo(45 - i);
    const reqDelDate = daysAhead(7);
    const unitPrice = mat.sellingPrice;
    const netTotal = orderQty * unitPrice;

    const so = await prisma.salesOrder.create({
      data: {
        soNumber: soNum,
        inquiryId: inq ? inq.id : null,
        customerId: cust.id,
        salesOrgId: salesOrgs[i % salesOrgs.length].id,
        distributionChannelId: distChannels[i % distChannels.length].id,
        status: soStatus,
        creditStatus,
        orderDate,
        requestedDeliveryDate: reqDelDate,
        totalAmount: netTotal,
        notes: `Commercial contract release via sales organization`,
        items: {
          create: [
            {
              itemNumber: 10,
              materialId: mat.id,
              plantId: mat.plantId,
              orderQuantity: orderQty,
              deliveredQuantity: soStatus === 'FULFILLED' ? orderQty : soStatus === 'PARTIALLY_FULFILLED' ? Math.floor(orderQty * 0.5) : 0,
              billedQuantity: soStatus === 'FULFILLED' ? orderQty : 0,
              unitPrice: unitPrice,
              netAmount: netTotal,
            },
          ],
        },
      },
      include: { items: true },
    });
    salesOrders.push(so);
  }
  console.log(`📈 Seeded ${salesOrders.length} Sales Orders.`);

  const deliveries = [];
  const goodsIssues = [];
  for (let i = 1; i <= 40; i++) {
    const delNum = `DEL-${10000 + i}`;
    const so = salesOrders[i - 1];
    const soItem = so.items[0];
    const mat = materials.find((m) => m.id === soItem.materialId)!;

    let delStatus = 'DELIVERED';
    let plannedDate = daysAgo(35 - i);
    let actualDate: Date | null = new Date(plannedDate.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Deliberate delivery delay on Delivery #7 (past due date, not delivered)
    if (i === 7) {
      delStatus = 'DELAYED';
      plannedDate = daysAgo(10);
      actualDate = null;
    } else if (i >= 36) {
      delStatus = 'PICKING';
      actualDate = null;
    } else if (i >= 32) {
      delStatus = 'READY';
      actualDate = null;
    }

    const del = await prisma.delivery.create({
      data: {
        deliveryNumber: delNum,
        soId: so.id,
        shippingPoint: 'SP10',
        deliveryDate: plannedDate,
        plannedGoodsIssueDate: plannedDate,
        actualGoodsIssueDate: actualDate,
        status: delStatus,
        trackingNumber: `TRK-DHL-99482${i}`,
        notes: `Outbound shipping schedule for customer fulfillment`,
        items: {
          create: [
            {
              soItemId: soItem.id,
              materialId: mat.id,
              storageLocationId: mat.storageLocationId,
              deliveryQuantity: soItem.orderQuantity,
              pickedQuantity: delStatus === 'DELIVERED' || delStatus === 'DISPATCHED' ? soItem.orderQuantity : Math.floor(soItem.orderQuantity * 0.5),
            },
          ],
        },
      },
      include: { items: true },
    });
    deliveries.push(del);

    // If delivered, post Goods Issue (Movement 601)
    if (delStatus === 'DELIVERED') {
      const gi = await prisma.goodsIssue.create({
        data: {
          giNumber: `GI-${10000 + i}`,
          deliveryId: del.id,
          movementType: '601', // SAP Movement 601 Outbound Delivery GI
          postingDate: actualDate || new Date(),
          issuedBy: users[2].username, // Warehouse supervisor
          notes: `Material consumption Movement 601 posted from stock`,
        },
      });
      goodsIssues.push(gi);
    }
  }
  console.log(`📦 Seeded ${deliveries.length} Deliveries and ${goodsIssues.length} Goods Issues (SAP Mvt 601).`);

  // 40 Customer Invoices
  const customerInvoices = [];
  for (let i = 1; i <= 40; i++) {
    const invNum = `CINV-${10000 + i}`;
    const del = deliveries[i - 1];
    const so = salesOrders[i - 1];
    const soItem = so.items[0];

    let invStatus = 'PAID';
    let invDate = daysAgo(30 - i);
    let dueDate = new Date(invDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    let paidDate: Date | null = new Date(dueDate.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Deliberate overdue invoice on CINV #2 (Due date passed 12 days ago, still unpaid)
    if (i === 2) {
      invStatus = 'OVERDUE';
      invDate = daysAgo(45);
      dueDate = daysAgo(15);
      paidDate = null;
    } else if (i >= 30) {
      invStatus = 'GENERATED';
      paidDate = null;
    }

    const cinv = await prisma.customerInvoice.create({
      data: {
        invoiceNumber: invNum,
        deliveryId: del.id,
        soId: so.id,
        customerId: so.customerId,
        invoiceDate: invDate,
        dueDate,
        totalAmount: so.totalAmount,
        status: invStatus,
        paidDate,
        notes: `Official VAT-compliant billing document for outbound sales delivery`,
        items: {
          create: [
            {
              materialId: soItem.materialId,
              billedQuantity: soItem.orderQuantity,
              unitPrice: soItem.unitPrice,
              netAmount: so.totalAmount,
            },
          ],
        },
      },
    });
    customerInvoices.push(cinv);
  }
  console.log(`💶 Seeded ${customerInvoices.length} Customer Invoices / Billing Documents.`);

  // ==========================================
  // 9. SEED 30+ REALISTIC EXCEPTION RECORDS
  // ==========================================
  const exceptionsData = [
    // 1. Price Variance Exception (RULE-002)
    {
      num: 'EXC-1001',
      rCode: 'RULE-002',
      cat: 'Price',
      sev: 'HIGH',
      stat: 'OPEN',
      docType: 'SUPPLIER_INVOICE',
      docId: supplierInvoices[4].id,
      docNum: supplierInvoices[4].invoiceNumber,
      impact: 'Financial loss of 8.0% over-charge above contracted PO price if unblocked.',
      exp: `Contract PO unit price: €${purchaseOrders[4].items[0].unitPrice.toFixed(2)}`,
      act: `Supplier billed unit price: €${supplierInvoices[4].items[0].unitPrice.toFixed(2)}`,
      var: '+8.0% (Allowed tolerance: 2.0%)',
      action: 'Hold invoice payment; requested vendor commercial clarification.',
    },
    // 2. Quantity Variance Exception (RULE-001)
    {
      num: 'EXC-1002',
      rCode: 'RULE-001',
      cat: 'Quantity',
      sev: 'HIGH',
      stat: 'UNDER_REVIEW',
      docType: 'SUPPLIER_INVOICE',
      docId: supplierInvoices[2].id,
      docNum: supplierInvoices[2].invoiceNumber,
      impact: 'Short-shipment overbill. Vendor invoiced for 100 units while dock received 85 units.',
      exp: 'GR Quantity: 85 EA',
      act: 'Invoiced Quantity: 100 EA',
      var: '+15 EA discrepancy',
      action: 'Warehouse lead Marcus Weber confirmed dock count. Requested €3,600 vendor credit note.',
    },
    // 3. GR Quantity Discrepancy (RULE-003)
    {
      num: 'EXC-1003',
      rCode: 'RULE-003',
      cat: 'Quantity',
      sev: 'MEDIUM',
      stat: 'RESOLVED',
      docType: 'GR',
      docId: goodsReceipts[7].id,
      docNum: goodsReceipts[7].grNumber,
      impact: 'Damaged packaging rejected 5 units at warehouse receiving dock.',
      exp: 'Ordered Quantity: 60 EA',
      act: 'Accepted Quantity: 55 EA (5 Rejected)',
      var: '-5 EA shortfall',
      action: 'Vendor accepted damage return. Amended PO delivery schedule for replacement.',
    },
    // 4. Low Stock Alert (RULE-004) - Material MAT-1003
    {
      num: 'EXC-1004',
      rCode: 'RULE-004',
      cat: 'Inventory',
      sev: 'CRITICAL',
      stat: 'OPEN',
      docType: 'MATERIAL',
      docId: materials[2].id,
      docNum: materials[2].materialNumber,
      impact: 'Available stock (85 EA) is below mandatory Safety Stock (90 EA). High risk of assembly line downtime.',
      exp: 'Safety Stock: 90 EA',
      act: 'Current Stock: 85 EA',
      var: '-5 EA deficit below buffer',
      action: 'Expedited open purchase order PO-10003 with supplier Vanguard Hydraulic Systems.',
    },
    // 5. Low Stock Alert (RULE-004) - Material MAT-1007
    {
      num: 'EXC-1005',
      rCode: 'RULE-004',
      cat: 'Inventory',
      sev: 'CRITICAL',
      stat: 'OPEN',
      docType: 'MATERIAL',
      docId: materials[6].id,
      docNum: materials[6].materialNumber,
      impact: 'Synthetic sealant at 35 L vs Safety Stock of 50 L. Critical chemical buffer breached.',
      exp: 'Safety Stock: 50 L',
      act: 'Current Stock: 35 L',
      var: '-15 L buffer deficit',
      action: 'Triggered emergency requisition to chemical supplier Helios Advanced Polymers.',
    },
    // 6. Delivery Delay (RULE-006) - Delivery DEL-10007
    {
      num: 'EXC-1006',
      rCode: 'RULE-006',
      cat: 'Delivery',
      sev: 'HIGH',
      stat: 'OPEN',
      docType: 'DELIVERY',
      docId: deliveries[6].id,
      docNum: deliveries[6].deliveryNumber,
      impact: 'Shipment to customer Atlas Copco is overdue by 10 days, risking SLA financial penalties.',
      exp: `Planned dispatch: ${deliveries[6].deliveryDate.toISOString().split('T')[0]}`,
      act: 'Status: Delayed / Carrier dock backlog',
      var: '10 Days Overdue',
      action: 'Re-contracted expedited air-freight carrier; notified key account manager.',
    },
    // 7. Credit Limit Exceeded (RULE-009) - Sales Order SO-10004
    {
      num: 'EXC-1007',
      rCode: 'RULE-009',
      cat: 'Credit',
      sev: 'CRITICAL',
      stat: 'OPEN',
      docType: 'SO',
      docId: salesOrders[3].id,
      docNum: salesOrders[3].soNumber,
      impact: 'Total exposure (€425,000) exceeds customer credit ceiling of €400,000.',
      exp: 'Customer Credit Limit: €400,000',
      act: 'Total Exposure: €425,000',
      var: '€25,000 Credit Overrun',
      action: 'Placed order on SAP Credit Hold; routed to Credit Manager for collateral review.',
    },
    // 8. Overdue Invoice (RULE-010) - Customer Invoice CINV-10002
    {
      num: 'EXC-1008',
      rCode: 'RULE-010',
      cat: 'Invoice',
      sev: 'MEDIUM',
      stat: 'OPEN',
      docType: 'CUSTOMER_INVOICE',
      docId: customerInvoices[1].id,
      docNum: customerInvoices[1].invoiceNumber,
      impact: 'Open receivable of €85,000 is 15 days past due date from BMW Steyr AG.',
      exp: `Due Date: ${customerInvoices[1].dueDate.toISOString().split('T')[0]}`,
      act: 'Unpaid / No remittance advice received',
      var: '15 Days Overdue',
      action: 'Generated Level-1 Dunning Reminder; scheduled accounts receivable reconciliation call.',
    },
    // 9. Open PO Aging (RULE-007) - PO-10037
    {
      num: 'EXC-1009',
      rCode: 'RULE-007',
      cat: 'Process Aging',
      sev: 'MEDIUM',
      stat: 'UNDER_REVIEW',
      docType: 'PO',
      docId: purchaseOrders[36].id,
      docNum: purchaseOrders[36].poNumber,
      impact: 'Purchase Order has been in Sent status for 38 days with no ASN confirmation.',
      exp: 'Standard Vendor Lead Time: 21 Days',
      act: 'Current Age: 38 Days',
      var: '17 Days Aging Over SLA',
      action: 'Buyer Elena Rostova issued supplier performance inquiry to Rhine-Ruhr Steel.',
    },
    // 10. Low Stock Alert - Material MAT-2006 (HPU)
    {
      num: 'EXC-1010',
      rCode: 'RULE-004',
      cat: 'Inventory',
      sev: 'CRITICAL',
      stat: 'UNDER_REVIEW',
      docType: 'MATERIAL',
      docId: materials[15].id,
      docNum: materials[15].materialNumber,
      impact: 'Stock 12 EA < Safety Stock 15 EA for high-value hydraulic power skids.',
      exp: 'Safety Stock: 15 EA',
      act: 'Current Stock: 12 EA',
      var: '-3 EA below safety reserve',
      action: 'Planned assembly work order resequencing in Berlin Plant 1000.',
    },
    // 11. Low Stock Alert - Material MAT-3004 (Vibration sensor)
    {
      num: 'EXC-1011',
      rCode: 'RULE-004',
      cat: 'Inventory',
      sev: 'CRITICAL',
      stat: 'RESOLVED',
      docType: 'MATERIAL',
      docId: materials[23].id,
      docNum: materials[23].materialNumber,
      impact: 'Stock reached 24 EA vs safety stock of 25 EA.',
      exp: 'Safety Stock: 25 EA',
      act: 'Current Stock: 24 EA',
      var: '-1 EA deficit',
      action: 'Reorder executed via PR-10041; PO released to Silesian Sensor Systems.',
    },
    // 12. Reorder Recommendation (RULE-005) - Material MAT-1001
    {
      num: 'EXC-1012',
      rCode: 'RULE-005',
      cat: 'Inventory',
      sev: 'MEDIUM',
      stat: 'RESOLVED',
      docType: 'MATERIAL',
      docId: materials[0].id,
      docNum: materials[0].materialNumber,
      impact: 'Stock at reorder point of 200 EA.',
      exp: 'Reorder Point: 200 EA',
      act: 'Current Stock: 200 EA',
      var: 'Reached threshold boundary',
      action: 'Auto-converted into Requisition PR-10020 for 100 EA.',
    },
  ];

  // Generate 20 additional realistic exceptions (total 32 exceptions)
  for (let j = 13; j <= 32; j++) {
    const isP2P = j % 2 === 0;
    const ruleIdx = j % rules.length;
    const rule = rules[ruleIdx];
    const po = purchaseOrders[(j * 2) % purchaseOrders.length];
    const so = salesOrders[(j * 2) % salesOrders.length];

    exceptionsData.push({
      num: `EXC-${1000 + j}`,
      rCode: rule.ruleCode,
      cat: rule.category,
      sev: rule.severity,
      stat: j % 4 === 0 ? 'RESOLVED' : j % 3 === 0 ? 'UNDER_REVIEW' : 'OPEN',
      docType: isP2P ? 'PO' : 'SO',
      docId: isP2P ? po.id : so.id,
      docNum: isP2P ? po.poNumber : so.soNumber,
      impact: `Automated control rule ${rule.ruleCode} triggered during transaction audit cycle.`,
      exp: `Standard policy threshold: ${rule.thresholdValue || 0}`,
      act: `Telemetry captured deviation during batch processing`,
      var: `Deviation score: ${(j * 1.5).toFixed(1)}%`,
      action: rule.recommendedAction,
    });
  }

  for (const ex of exceptionsData) {
    const r = rules.find((item) => item.ruleCode === ex.rCode) || rules[0];
    await prisma.exceptionRecord.create({
      data: {
        exceptionNumber: ex.num,
        ruleId: r.id,
        ruleCode: ex.rCode,
        ruleName: r.name,
        category: ex.cat,
        severity: ex.sev,
        status: ex.stat,
        sourceDocumentType: ex.docType,
        sourceDocumentId: ex.docId,
        sourceDocumentNumber: ex.docNum,
        businessImpact: ex.impact,
        expectedValue: ex.exp,
        actualValue: ex.act,
        variance: ex.var,
        assignedUserId: users[3].id, // Sofia Lindqvist (Finance/Audit)
        resolutionNotes: ex.action,
        resolvedAt: ex.stat === 'RESOLVED' ? daysAgo(2) : null,
      },
    });
  }
  console.log(`⚠️ Seeded ${exceptionsData.length} Enterprise Exception Records.`);

  // ==========================================
  // 10. SEED AUDIT LOGS (40 Transaction Audit Traces)
  // ==========================================
  const auditEntries = [
    { u: 'procurement', role: 'PROCUREMENT', act: 'PR_SUBMITTED', mod: 'P2P', dt: 'PR', di: purchaseRequisitions[0].id, dn: purchaseRequisitions[0].prNumber, prev: 'DRAFT', next: 'SUBMITTED', det: 'Purchase Requisition submitted for initial buyer approval' },
    { u: 'procurement', role: 'PROCUREMENT', act: 'PR_APPROVED', mod: 'P2P', dt: 'PR', di: purchaseRequisitions[0].id, dn: purchaseRequisitions[0].prNumber, prev: 'SUBMITTED', next: 'APPROVED', det: 'Approved by lead procurement manager' },
    { u: 'procurement', role: 'PROCUREMENT', act: 'PO_CREATED', mod: 'P2P', dt: 'PO', di: purchaseOrders[0].id, dn: purchaseOrders[0].poNumber, prev: null, next: 'DRAFT', det: 'Converted from approved Requisition PR-10001' },
    { u: 'procurement', role: 'PROCUREMENT', act: 'PO_APPROVED', mod: 'P2P', dt: 'PO', di: purchaseOrders[0].id, dn: purchaseOrders[0].poNumber, prev: 'DRAFT', next: 'APPROVED', det: 'Released under commercial purchasing authority limits' },
    { u: 'procurement', role: 'PROCUREMENT', act: 'PO_SENT_TO_VENDOR', mod: 'P2P', dt: 'PO', di: purchaseOrders[0].id, dn: purchaseOrders[0].poNumber, prev: 'APPROVED', next: 'SENT_TO_VENDOR', det: 'Dispatched electronic EDI purchase order to Apex Industrial Castings' },
    { u: 'warehouse', role: 'WAREHOUSE', act: 'GOODS_RECEIPT_POSTED', mod: 'P2P', dt: 'GR', di: goodsReceipts[0].id, dn: goodsReceipts[0].grNumber, prev: 'PENDING', next: 'COMPLETE', det: 'Physical dock delivery verified Movement Type 101 GR posted' },
    { u: 'finance', role: 'FINANCE', act: 'INVOICE_3WAY_MATCHED', mod: 'P2P', dt: 'SUPPLIER_INVOICE', di: supplierInvoices[0].id, dn: supplierInvoices[0].invoiceNumber, prev: 'PENDING', next: 'MATCHED', det: 'Automated 3-Way Match cleared with 0.00% price/quantity variance' },
    { u: 'finance', role: 'FINANCE', act: 'INVOICE_PRICE_BLOCKED', mod: 'P2P', dt: 'SUPPLIER_INVOICE', di: supplierInvoices[4].id, dn: supplierInvoices[4].invoiceNumber, prev: 'PENDING', next: 'BLOCKED', det: 'Blocked by Rule RULE-002: Invoiced unit price deviates 8.0% beyond tolerance' },
    { u: 'sales', role: 'SALES', act: 'SALES_ORDER_CONFIRMED', mod: 'O2C', dt: 'SO', di: salesOrders[0].id, dn: salesOrders[0].soNumber, prev: 'DRAFT', next: 'CONFIRMED', det: 'Credit limit check passed and ATP stock reserved' },
    { u: 'sales', role: 'SALES', act: 'CREDIT_LIMIT_BLOCKED', mod: 'O2C', dt: 'SO', di: salesOrders[3].id, dn: salesOrders[3].soNumber, prev: 'DRAFT', next: 'BLOCKED', det: 'Blocked by Rule RULE-009: Exposure €425,000 exceeds limit €400,000' },
    { u: 'warehouse', role: 'WAREHOUSE', act: 'OUTBOUND_DELIVERY_PICKED', mod: 'O2C', dt: 'DELIVERY', di: deliveries[0].id, dn: deliveries[0].deliveryNumber, prev: 'PENDING', next: 'READY', det: 'Warehouse picking completed at Hamburg Staging Hub' },
    { u: 'warehouse', role: 'WAREHOUSE', act: 'GOODS_ISSUE_POSTED', mod: 'O2C', dt: 'GI', di: goodsIssues[0].id, dn: goodsIssues[0].giNumber, prev: null, next: 'POSTED', det: 'SAP Movement 601 Goods Issue deducted inventory from Material Master' },
    { u: 'finance', role: 'FINANCE', act: 'BILLING_DOCUMENT_GENERATED', mod: 'O2C', dt: 'CUSTOMER_INVOICE', di: customerInvoices[0].id, dn: customerInvoices[0].invoiceNumber, prev: 'PENDING', next: 'GENERATED', det: 'Generated commercial invoice from outbound delivery DEL-10001' },
  ];

  for (let k = 0; k < auditEntries.length; k++) {
    const entry = auditEntries[k];
    await prisma.auditLog.create({
      data: {
        username: entry.u,
        role: entry.role,
        action: entry.act,
        module: entry.mod,
        documentType: entry.dt,
        documentId: entry.di,
        documentNumber: entry.dn,
        previousStatus: entry.prev,
        newStatus: entry.next,
        details: entry.det,
        ipAddress: '192.168.10.45',
        createdAt: daysAgo(auditEntries.length - k),
      },
    });
  }
  console.log(`📜 Seeded ${auditEntries.length} Enterprise Audit Trail Records.`);

  console.log('✅ Enterprise Digital Control Tower Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
