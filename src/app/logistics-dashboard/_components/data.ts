export type Severity = "High" | "Medium" | "Low";

export interface Opportunity {
  id: string;
  cargo: string;
  weight: string;
  severity: Severity;
  route: string;
  distanceKm: string;
  deadlineLabel: string;
  deadlineRemaining: string;
  cargoAmount: string;
  vehicles: string;
  pickupWindow: string;
  estValue: string;
  shipper: string;
  cargoType: string;
  totalWeight: string;
  vehiclesRequired: string;
  deliveryDeadline: string;
  escortRequired: string;
  estimatedValue: string;
  requirements: { label: string; met: boolean }[];
  paymentTerms: string;
}

export const opportunities: Opportunity[] = [
  {
    id: "OPP-3312",
    cargo: "Lithium Ore",
    weight: "1,200 MT",
    severity: "High",
    route: "Kaduna → Lagos Port",
    distanceKm: "742 km",
    deadlineLabel: "Response deadline",
    deadlineRemaining: "18h remaining",
    cargoAmount: "1,200 MT",
    vehicles: "12 Dump Trucks",
    pickupWindow: "12–14 Aug 2026",
    estValue: "₦9.2M",
    shipper: "GreenRock Resources Ltd",
    cargoType: "Lithium ore (spodumene), bagged",
    totalWeight: "1,200 MT",
    vehiclesRequired: "12 dump trucks, 30 MT each",
    deliveryDeadline: "18 Aug 2026",
    escortRequired: "Yes — licensed security escort",
    estimatedValue: "₦9,200,000",
    requirements: [
      { label: "Valid goods-in-transit insurance for full cargo value", met: true },
      { label: "Dump trucks with tarpaulin covers (30 MT capacity)", met: true },
      { label: "Drivers with hazardous-adjacent cargo certification", met: true },
      { label: "GPS tracking active on all allocated vehicles", met: false },
    ],
    paymentTerms:
      "50% on pickup confirmation, 50% on verified delivery. Settlement within 5 business days via platform escrow. Demurrage billed at ₦45,000/day per vehicle beyond 48h at port.",
  },
  {
    id: "OPP-3298",
    cargo: "Lithium Concentrate",
    weight: "480 MT",
    severity: "Medium",
    route: "Jos → Onne Port",
    distanceKm: "512 km",
    deadlineLabel: "Response deadline",
    deadlineRemaining: "2d remaining",
    cargoAmount: "480 MT",
    vehicles: "6 Flatbeds",
    pickupWindow: "15–16 Aug 2026",
    estValue: "₦4.1M",
    shipper: "Nordmin Concentrates Ltd",
    cargoType: "Lithium concentrate, bulk bags",
    totalWeight: "480 MT",
    vehiclesRequired: "6 flatbed trucks, 20 MT each",
    deliveryDeadline: "19 Aug 2026",
    escortRequired: "No",
    estimatedValue: "₦4,100,000",
    requirements: [
      { label: "Valid goods-in-transit insurance for full cargo value", met: true },
      { label: "Flatbed trucks with tarpaulin covers", met: true },
      { label: "Drivers with hazardous-adjacent cargo certification", met: false },
      { label: "GPS tracking active on all allocated vehicles", met: true },
    ],
    paymentTerms:
      "50% on pickup confirmation, 50% on verified delivery. Settlement within 5 business days via platform escrow.",
  },
  {
    id: "OPP-3305",
    cargo: "Lithium Ore",
    weight: "750 MT",
    severity: "Medium",
    route: "Cross River → Port Harcourt",
    distanceKm: "398 km",
    deadlineLabel: "Response deadline",
    deadlineRemaining: "3d remaining",
    cargoAmount: "750 MT",
    vehicles: "8 Tippers",
    pickupWindow: "18–20 Aug 2026",
    estValue: "₦5.6M",
    shipper: "Barite Cross River Group",
    cargoType: "Lithium ore, bulk",
    totalWeight: "750 MT",
    vehiclesRequired: "8 tipper trucks, 25 MT each",
    deliveryDeadline: "23 Aug 2026",
    escortRequired: "No",
    estimatedValue: "₦5,600,000",
    requirements: [
      { label: "Valid goods-in-transit insurance for full cargo value", met: true },
      { label: "Tipper trucks with tarpaulin covers", met: true },
      { label: "Drivers with hazardous-adjacent cargo certification", met: true },
      { label: "GPS tracking active on all allocated vehicles", met: true },
    ],
    paymentTerms:
      "50% on pickup confirmation, 50% on verified delivery. Settlement within 5 business days via platform escrow.",
  },
];

export type JobStage =
  | "Awaiting Pickup"
  | "Loading"
  | "In Transit"
  | "Delivered";

export interface AssignedJob {
  jobId: string;
  route: string;
  vehicle: string;
  stage: JobStage;
  eta: string;
  detail: {
    cargoLabel: string;
    shipper: string;
    pickupLocation: string;
    pickupDate: string;
    deliveryLocation: string;
    deliveryDate: string;
    jobValue: string;
    escort: string;
    waybill: string;
    statusNote: string;
    scheduledLabel: string;
    scheduledSub: string;
    driver: {
      initials: string;
      name: string;
      license: string;
      years: string;
      rating: string;
    };
    history: { title: string; time: string }[];
  };
}

export const assignedJobs: AssignedJob[] = [
  {
    jobId: "JOB-20451",
    route: "Kaduna → Lagos",
    vehicle: "Truck A-14",
    stage: "Loading",
    eta: "Today",
    detail: {
      cargoLabel: "Lithium ore · 1,200 MT",
      shipper: "GreenRock Resources Ltd",
      pickupLocation: "Kaduna depot",
      pickupDate: "18 Jul, 07:00",
      deliveryLocation: "Lagos Port",
      deliveryDate: "20 Jul",
      jobValue: "₦9,200,000",
      escort: "Required",
      waybill: "Issued",
      statusNote: "Cargo loading in progress · driver on site",
      scheduledLabel: "Loading — started 18 Jul, 07:00",
      scheduledSub: "Vehicle on site · loading in progress",
      driver: {
        initials: "MA",
        name: "M. Adamu",
        license: "DL-KD-11204",
        years: "5 yrs on platform",
        rating: "4.8 rating",
      },
      history: [
        { title: "Driver allocated to job", time: "Yesterday · 17:30" },
        { title: "Job assigned to Alpha Logistics", time: "16 Jul · 09:12" },
      ],
    },
  },
  {
    jobId: "JOB-20452",
    route: "Jos → Onne Port",
    vehicle: "Truck C-08",
    stage: "In Transit",
    eta: "Tomorrow",
    detail: {
      cargoLabel: "Lithium concentrate · 480 MT",
      shipper: "Nordmin Concentrates Ltd",
      pickupLocation: "Jos depot",
      pickupDate: "17 Jul, 06:30",
      deliveryLocation: "Onne Port",
      deliveryDate: "19 Jul",
      jobValue: "₦4,100,000",
      escort: "Not Required",
      waybill: "Issued",
      statusNote: "In transit · on schedule",
      scheduledLabel: "In transit — ETA tomorrow",
      scheduledSub: "Vehicle en route · no delays reported",
      driver: {
        initials: "TO",
        name: "T. Okoro",
        license: "DL-PL-08871",
        years: "3 yrs on platform",
        rating: "4.6 rating",
      },
      history: [
        { title: "Cargo loaded", time: "17 Jul · 08:15" },
        { title: "Driver allocated to job", time: "16 Jul · 14:02" },
        { title: "Job assigned to Alpha Logistics", time: "15 Jul · 10:45" },
      ],
    },
  },
  {
    jobId: "JOB-20447",
    route: "Nasarawa → Lagos",
    vehicle: "Truck B-02",
    stage: "In Transit",
    eta: "19 Jul",
    detail: {
      cargoLabel: "Tin concentrate · 480 MT",
      shipper: "Highland Minerals Ltd",
      pickupLocation: "Jos depot",
      pickupDate: "16 Jul, 09:00",
      deliveryLocation: "Lagos Port",
      deliveryDate: "19 Jul",
      jobValue: "₦3,650,000",
      escort: "Not Required",
      waybill: "Issued",
      statusNote: "In transit · on schedule",
      scheduledLabel: "In transit — ETA 19 Jul",
      scheduledSub: "Vehicle en route · no delays reported",
      driver: {
        initials: "SB",
        name: "S. Bello",
        license: "DL-NS-33902",
        years: "6 yrs on platform",
        rating: "4.9 rating",
      },
      history: [
        { title: "Cargo loaded", time: "Yesterday · 14:05" },
        { title: "Driver allocated to job", time: "15 Jul · 11:20" },
        { title: "Job assigned to Alpha Logistics", time: "14 Jul · 08:00" },
      ],
    },
  },
  {
    jobId: "JOB-20440",
    route: "Kogi → Warri Port",
    vehicle: "Truck D-11",
    stage: "Awaiting Pickup",
    eta: "20 Jul",
    detail: {
      cargoLabel: "Lithium · 30 MT",
      shipper: "Delta Barite Group",
      pickupLocation: "Kogi bulk yard",
      pickupDate: "20 Jul, 08:00",
      deliveryLocation: "Warri Port",
      deliveryDate: "21 Jul",
      jobValue: "₦510,000",
      escort: "Not Required",
      waybill: "Pending issue",
      statusNote: "Vehicle reserved · driver confirmed",
      scheduledLabel: "Awaiting pickup — scheduled 20 Jul, 08:00",
      scheduledSub: "Vehicle reserved · driver confirmed",
      driver: {
        initials: "EO",
        name: "Emeka Obi",
        license: "DL-KG-33417",
        years: "3 yrs on platform",
        rating: "4.6 rating",
      },
      history: [
        { title: "Driver confirmed for pickup", time: "Yesterday · 15:02" },
        { title: "Job assigned to Alpha Logistics", time: "14 Jul · 09:30" },
      ],
    },
  },
  {
    jobId: "JOB-20433",
    route: "Plateau → Calabar",
    vehicle: "Truck A-03",
    stage: "Delivered",
    eta: "—",
    detail: {
      cargoLabel: "Lithium ore · 620 MT",
      shipper: "Plateau Mining Co",
      pickupLocation: "Plateau depot",
      pickupDate: "10 Jul, 07:00",
      deliveryLocation: "Calabar Port",
      deliveryDate: "13 Jul",
      jobValue: "₦620,000",
      escort: "Not Required",
      waybill: "Closed",
      statusNote: "Delivered and confirmed by shipper",
      scheduledLabel: "Delivered — 13 Jul, 16:40",
      scheduledSub: "Cargo confirmed received at Calabar Port",
      driver: {
        initials: "CU",
        name: "C. Udo",
        license: "DL-PT-77213",
        years: "4 yrs on platform",
        rating: "4.7 rating",
      },
      history: [
        { title: "Payment released", time: "13 Jul · 17:10" },
        { title: "Cargo delivered", time: "13 Jul · 16:40" },
        { title: "Job assigned to Alpha Logistics", time: "10 Jul · 06:15" },
      ],
    },
  },
];

export const stats = [
  {
    label: "Open Opportunities",
    value: "18",
    sub: "Jobs available to bid on",
  },
  {
    label: "Assigned Jobs",
    value: "7",
    sub: "Currently assigned",
  },
  {
    label: "Fleet Availability",
    value: "12 / 15",
    sub: "Vehicles ready for dispatch",
  },
  {
    label: "Pending Payout",
    value: "₦4,850,000",
    sub: "Awaiting settlement",
  },
];

export const notifications = [
  {
    title: "New transport opportunity available",
    description: "Kaduna → Lagos · Lithium Ore, 1,200 MT. Expires in 3 hours.",
    linkLabel: "View Opportunity",
    time: "12m ago",
  },
  {
    title: "Assignment confirmed",
    description: "JOB-20451 has been assigned to your company.",
    linkLabel: "View Job",
    time: "1h ago",
  },
  {
    title: "Payment released",
    description: "₦1,850,000 has been disbursed to your wallet.",
    linkLabel: "View Wallet",
    time: "3h ago",
  },
  {
    title: "Fleet document expiring",
    description: "Insurance for Truck A-14 expires in 5 days.",
    linkLabel: "Update Fleet",
    time: "Yesterday",
  },
];

export const recentActivity = [
  {
    title: "Submitted interest for JOB-20488",
    time: "Today · 08:42",
    description: "Barite · Cross River → Port Harcourt · 8 tippers proposed.",
  },
  {
    title: "Assignment accepted",
    time: "Today · 07:15",
    description: "JOB-20451 confirmed — Kaduna → Lagos, pickup scheduled 17 Jul.",
  },
  {
    title: "Driver allocated to JOB-20451",
    time: "Yesterday · 17:30",
    description: "M. Adamu assigned to Truck A-14.",
  },
  {
    title: "Cargo loaded",
    time: "Yesterday · 14:05",
    description: "JOB-20447 — 480 MT tin concentrate loaded at Jos depot.",
  },
  {
    title: "Payment received",
    time: "Yesterday · 09:12",
    description: "₦850,000 settled for JOB-20422.",
  },
];

export const recentEarnings = [
  { jobId: "JOB-20422", amount: "₦850,000", status: "Completed", date: "Yesterday" },
  { jobId: "JOB-20418", amount: "₦1,240,000", status: "Completed", date: "14 Jul" },
  { jobId: "JOB-20415", amount: "₦620,000", status: "Pending", date: "13 Jul" },
  { jobId: "JOB-20409", amount: "₦1,850,000", status: "Completed", date: "11 Jul" },
];

export const fleetStatus = {
  available: 12,
  assigned: 3,
  insuranceExpiring: 1,
  roadworthinessDue: 2,
  readinessPct: 93,
};

export interface AllocationVehicle {
  id: string;
  type: string;
  capacity: string;
  status: "Available" | "On job" | "High" | "Unavailable";
}

export const allocationVehicles: AllocationVehicle[] = [
  { id: "A-14", type: "Dump Truck · MAN TGS", capacity: "30 MT", status: "Available" },
  { id: "A-103", type: "Dump Truck · MAN TGS", capacity: "30 MT", status: "Available" },
  { id: "B-02", type: "Dump Truck · MAN TGS", capacity: "30 MT", status: "On job" },
  { id: "C-08", type: "Dump Truck · MAN TGS", capacity: "30 MT", status: "High" },
  { id: "D-11", type: "Dump Truck · MAN TGS", capacity: "30 MT", status: "Unavailable" },
];
