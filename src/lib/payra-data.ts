/**
 * Mock data layer for the Payra prototype.
 * Every export here is shaped like a future API response so it can be swapped
 * for real backend calls without touching the UI components.
 */

export type TransactionStatus = "completed" | "pending" | "failed";
export type TransactionKind =
  | "sent"
  | "received"
  | "payment"
  | "add-money"
  | "withdrawal";

export interface Transaction {
  id: string;
  kind: TransactionKind;
  counterparty: string;
  description: string;
  amount: number; // positive = money in, negative = money out
  date: string; // ISO
  source: string;
  status: TransactionStatus;
  fee: number;
  category: string;
}

export interface PaymentSource {
  id: string;
  name: string;
  detail: string;
  kind: "wallet" | "bank" | "card" | "mfs";
  balance?: number;
  status: "connected" | "not-connected";
}

export interface Contact {
  id: string;
  name: string;
  handle: string;
  phone: string;
}

export interface NotificationItem {
  id: string;
  type: "payment" | "received" | "security" | "request";
  title: string;
  body: string;
  time: string;
  unread: boolean;
}

export const currentUser = {
  name: "Naimul Hossain",
  firstName: "Naimul",
  email: "naimul@payra.app",
  phone: "+880 1712 345 678",
  payraId: "@naimul24",
  initials: "NH",
  cardLast4: "4829",
};

export const balances = {
  total: 84520.5,
  available: 81020.5,
  pending: 3500,
};

export const contacts: Contact[] = [
  { id: "c1", name: "Rahim Ahmed", handle: "@rahim", phone: "+880 1811 220 019" },
  { id: "c2", name: "Karim Hasan", handle: "@karimh", phone: "+880 1922 118 402" },
  { id: "c3", name: "Nusrat Jahan", handle: "@nusrat", phone: "+880 1533 907 771" },
  { id: "c4", name: "Tanvir Hossain", handle: "@tanvir", phone: "+880 1755 664 213" },
  { id: "c5", name: "Sadia Islam", handle: "@sadia", phone: "+880 1611 445 908" },
];

export const paymentSources: PaymentSource[] = [
  {
    id: "s1",
    name: "Payra Wallet",
    detail: "Primary balance",
    kind: "wallet",
    balance: 84520.5,
    status: "connected",
  },
  {
    id: "s2",
    name: "City Bank Account",
    detail: "•••• 4521",
    kind: "bank",
    status: "connected",
  },
  {
    id: "s3",
    name: "Visa Debit Card",
    detail: "•••• 8824",
    kind: "card",
    status: "connected",
  },
  { id: "s4", name: "bKash", detail: "Mobile financial service", kind: "mfs", status: "connected" },
  { id: "s5", name: "Nagad", detail: "Mobile financial service", kind: "mfs", status: "not-connected" },
  { id: "s6", name: "Rocket", detail: "Mobile financial service", kind: "mfs", status: "not-connected" },
];

export const transactions: Transaction[] = [
  {
    id: "PAY-2026-884210",
    kind: "received",
    counterparty: "Rahim Ahmed",
    description: "Received from Rahim Ahmed",
    amount: 2500,
    date: "2026-08-25T10:32:00+06:00",
    source: "Payra Wallet",
    status: "completed",
    fee: 0,
    category: "Transfer",
  },
  {
    id: "PAY-2026-884133",
    kind: "payment",
    counterparty: "Starbucks Gulshan",
    description: "Paid to Starbucks Gulshan",
    amount: -850,
    date: "2026-08-25T09:15:00+06:00",
    source: "Visa Debit Card",
    status: "completed",
    fee: 0,
    category: "Food & Drink",
  },
  {
    id: "PAY-2026-883902",
    kind: "payment",
    counterparty: "Grameenphone",
    description: "Mobile recharge",
    amount: -1200,
    date: "2026-08-24T18:04:00+06:00",
    source: "Payra Wallet",
    status: "completed",
    fee: 0,
    category: "Bills",
  },
  {
    id: "PAY-2026-883744",
    kind: "add-money",
    counterparty: "City Bank Account",
    description: "Added money from bank",
    amount: 10000,
    date: "2026-08-24T11:20:00+06:00",
    source: "City Bank Account",
    status: "completed",
    fee: 0,
    category: "Top-up",
  },
  {
    id: "PAY-2026-883610",
    kind: "sent",
    counterparty: "Nusrat Jahan",
    description: "Sent to Nusrat Jahan",
    amount: -1250,
    date: "2026-08-23T20:41:00+06:00",
    source: "Payra Wallet",
    status: "completed",
    fee: 5,
    category: "Transfer",
  },
  {
    id: "PAY-2026-883512",
    kind: "sent",
    counterparty: "Tanvir Hossain",
    description: "Sent to Tanvir Hossain",
    amount: -3500,
    date: "2026-08-22T13:12:00+06:00",
    source: "bKash",
    status: "pending",
    fee: 10,
    category: "Transfer",
  },
  {
    id: "PAY-2026-883388",
    kind: "withdrawal",
    counterparty: "City Bank Account",
    description: "Withdraw to bank",
    amount: -5000,
    date: "2026-08-21T09:58:00+06:00",
    source: "Payra Wallet",
    status: "completed",
    fee: 15,
    category: "Withdrawal",
  },
  {
    id: "PAY-2026-883201",
    kind: "received",
    counterparty: "Karim Hasan",
    description: "Received from Karim Hasan",
    amount: 5000,
    date: "2026-08-20T16:30:00+06:00",
    source: "Payra Wallet",
    status: "completed",
    fee: 0,
    category: "Transfer",
  },
  {
    id: "PAY-2026-883044",
    kind: "payment",
    counterparty: "Daraz BD",
    description: "Online order payment",
    amount: -2340,
    date: "2026-08-19T21:07:00+06:00",
    source: "Visa Debit Card",
    status: "failed",
    fee: 0,
    category: "Shopping",
  },
  {
    id: "PAY-2026-882910",
    kind: "payment",
    counterparty: "Uber",
    description: "Ride to Banani",
    amount: -420,
    date: "2026-08-18T08:45:00+06:00",
    source: "Payra Wallet",
    status: "completed",
    fee: 0,
    category: "Transport",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "n1",
    type: "payment",
    title: "Payment successful",
    body: "You sent ৳1,500 to Rahim Ahmed.",
    time: "12 min ago",
    unread: true,
  },
  {
    id: "n2",
    type: "received",
    title: "Money received",
    body: "You received ৳5,000 from Karim Hasan.",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "n3",
    type: "request",
    title: "Payment request",
    body: "Rahim Ahmed requested ৳2,000.",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "n4",
    type: "security",
    title: "Security alert",
    body: "New login detected from Dhaka, Bangladesh.",
    time: "2 days ago",
    unread: false,
  },
];

export function formatBDT(amount: number, withSign = false) {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(abs);
  const sign = withSign ? (amount < 0 ? "− " : "+ ") : "";
  return `${sign}৳${formatted}`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getTransaction(id: string) {
  return transactions.find((t) => t.id === id);
}

/* ------------------------------------------------------------------ */
/* Prototype-only additions for the money-movement and KYC flows.      */
/* ------------------------------------------------------------------ */

export type PaymentRequestStatus = "pending" | "paid" | "declined" | "expired";

export interface PaymentRequestItem {
  id: string;
  contactName: string;
  handle: string;
  amount: number;
  note?: string;
  status: PaymentRequestStatus;
  date: string; // ISO
  direction: "outgoing" | "incoming";
}

export const paymentRequests: PaymentRequestItem[] = [
  {
    id: "REQ-2026-41208",
    contactName: "Rahim Ahmed",
    handle: "@rahim",
    amount: 2000,
    note: "Dinner at Gulshan",
    status: "pending",
    date: "2026-08-25T09:40:00+06:00",
    direction: "outgoing",
  },
  {
    id: "REQ-2026-41155",
    contactName: "Nusrat Jahan",
    handle: "@nusrat",
    amount: 1500,
    note: "Concert ticket",
    status: "paid",
    date: "2026-08-23T15:10:00+06:00",
    direction: "outgoing",
  },
  {
    id: "REQ-2026-41088",
    contactName: "Karim Hasan",
    handle: "@karimh",
    amount: 850,
    note: "Cab share",
    status: "declined",
    date: "2026-08-21T11:02:00+06:00",
    direction: "outgoing",
  },
  {
    id: "REQ-2026-40977",
    contactName: "Sadia Islam",
    handle: "@sadia",
    amount: 3200,
    note: "Course fee split",
    status: "pending",
    date: "2026-08-20T18:25:00+06:00",
    direction: "incoming",
  },
];

export type KycStatus = "unverified" | "pending" | "verified" | "rejected";

export const kycProfile: {
  status: KycStatus;
  level: string;
  limitPerDay: number;
} = {
  status: "unverified",
  level: "Basic",
  limitPerDay: 25000,
};

export const documentTypes = [
  { id: "nid", label: "National ID (NID)", detail: "Smart card or paper NID" },
  { id: "passport", label: "Passport", detail: "Machine-readable data page" },
  { id: "driving", label: "Driving Licence", detail: "Front and back required" },
] as const;

export type DocumentTypeId = (typeof documentTypes)[number]["id"];

/** Fee model for the prototype flows. */
export function calcFee(kind: "add" | "withdraw" | "request", amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (kind === "request") return 0;
  if (kind === "add") return amount > 10000 ? Math.round(amount * 0.005) : 0;
  return Math.max(10, Math.round(amount * 0.0085));
}

/** Generates a prototype transaction/request reference. Call in event handlers only. */
export function makeReference(prefix = "PAY") {
  const random = Math.floor(100000 + Math.random() * 899999);
  return `${prefix}-${new Date().getFullYear()}-${random}`;
}
