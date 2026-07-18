export type Category =
  | "BSW Portals"
  | "BSW Website"
  | "BSW Representatives"
  | "Courses"
  | "Hostel"
  | "Institute"
  | "Other";

export const CATEGORIES: Category[] = [
  "BSW Portals",
  "BSW Website",
  "BSW Representatives",
  "Courses",
  "Hostel",
  "Institute",
  "Other",
];

export const BSW_SERVICES_SUB = [
  "Academic Portal",
  "Mental Health Portal",
  "Career Portal",
  "Language Portal",
];

export type Attachment = {
  /** Server-generated UUID (present when data comes from real backend) */
  id?: string;
  name: string;
  type: string;
  /** Supabase public/signed URL — present on backend responses, absent in mock data */
  publicUrl?: string;
  /** File size in bytes — present on backend responses, absent in mock data */
  size?: number;
};

export type FeedbackStatus = "Pending" | "In Progress" | "Resolved";

export type Feedback = {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  category: Category;
  subCategory?: string;
  title: string;
  description: string;
  otherComments?: string;
  /**
   * Optional Google Drive / external link supplied by the user.
   * Must be validated for safe protocols (https:// only) before rendering
   * in an <a> tag — never trust this as a raw href.
   */
  driveLink?: string;
  attachments: Attachment[];
  createdAt: string; // ISO
  status: FeedbackStatus;
  progressStartedAt?: string; // ISO — set when status changes Pending → In Progress
};

const now = Date.now();
const d = (daysAgo: number, hour = 10) =>
  new Date(now - daysAgo * 86400_000 + hour * 3600_000).toISOString();

export const SEED_FEEDBACKS: Feedback[] = [
  {
    id: "fb-1",
    userName: "Aditi Sharma",
    userEmail: "cs21b001@iitd.ac.in",
    userRole: "Student",
    category: "BSW Portals",
    subCategory: "Mental Health Portal",
    title: "Counsellor booking slots keep failing",
    description:
      "Whenever I try to book a slot on the Mental Health Portal, the confirmation never arrives and the slot disappears.",
    otherComments: "Happens on both mobile and desktop.",
    attachments: [
      { name: "portal_error_screenshot.png", type: "image/png" },
      { name: "browser_console_log.pdf", type: "application/pdf" },
    ],
    createdAt: d(0, 9),
    status: "Pending",
  },
  {
    id: "fb-2",
    userName: "Aditi Sharma",
    userEmail: "cs21b001@iitd.ac.in",
    userRole: "Student",
    category: "Hostel",
    title: "Hot water outage in Kumaon hostel",
    description: "No hot water for the last three mornings in the north wing.",
    attachments: [{ name: "hostel_notice.pdf", type: "application/pdf" }],
    createdAt: d(2, 8),
    status: "Pending",
  },
  {
    id: "fb-3",
    userName: "Aditi Sharma",
    userEmail: "cs21b001@iitd.ac.in",
    userRole: "Student",
    category: "Courses",
    title: "COL216 grading rubric unclear",
    description:
      "The rubric for the mid-sem project changed twice and the latest version isn't posted.",
    attachments: [
      { name: "rubric_v1.pdf", type: "application/pdf" },
      { name: "rubric_v2.docx", type: "application/msword" },
      { name: "email_thread.pdf", type: "application/pdf" },
    ],
    createdAt: d(5, 14),
    status: "Pending",
  },
  {
    id: "fb-4",
    userName: "Rohan Verma",
    userEmail: "rohan.verma@example.com",
    userRole: "Parent",
    category: "BSW Representatives",
    title: "Slow response from hostel rep",
    description: "Sent two emails about mess timings, no reply in a week.",
    attachments: [{ name: "email_screenshot.png", type: "image/png" }],
    createdAt: d(1, 16),
    status: "Pending",
  },
  {
    id: "fb-5",
    userName: "Dr. Meera Iyer",
    userEmail: "miyer@iitd.ac.in",
    userRole: "Professor",
    category: "BSW Website",
    title: "Broken links on the events page",
    description: "Three announcement links on /events go to 404.",
    attachments: [
      { name: "broken_links.xlsx", type: "application/vnd.ms-excel" },
    ],
    createdAt: d(3, 11),
    status: "Pending",
  },
  {
    id: "fb-6",
    userName: "Rohan Verma",
    userEmail: "rohan.verma@example.com",
    userRole: "Parent",
    category: "Institute",
    title: "Fee receipt delays",
    description: "Receipts are arriving 2-3 weeks after payment.",
    attachments: [
      { name: "payment_proof.pdf", type: "application/pdf" },
      { name: "reminder.docx", type: "application/msword" },
    ],
    createdAt: d(7, 10),
    status: "Pending",
  },
  {
    id: "fb-7",
    userName: "Aditi Sharma",
    userEmail: "cs21b001@iitd.ac.in",
    userRole: "Student",
    category: "BSW Portals",
    subCategory: "Career Portal",
    title: "Resume upload rejects PDFs above 500KB",
    description: "The size limit isn't documented anywhere.",
    attachments: [{ name: "resume.pdf", type: "application/pdf" }],
    createdAt: d(4, 15),
    status: "Pending",
  },
  {
    id: "fb-8",
    userName: "Dr. Meera Iyer",
    userEmail: "miyer@iitd.ac.in",
    userRole: "Professor",
    category: "Other",
    title: "Suggestion: add a feedback digest",
    description: "A weekly digest of resolved feedbacks would help transparency.",
    attachments: [{ name: "proposal.pptx", type: "application/vnd.ms-powerpoint" }],
    createdAt: d(6, 13),
    status: "Pending",
  },
  {
    id: "fb-9",
    userName: "Aditi Sharma",
    userEmail: "cs21b001@iitd.ac.in",
    userRole: "Student",
    category: "BSW Portals",
    subCategory: "Language Portal",
    title: "French A1 cohort not visible",
    description: "Enrolled but the cohort page shows 'no active courses'.",
    attachments: [
      { name: "enrollment_confirmation.pdf", type: "application/pdf" },
      { name: "portal_view.png", type: "image/png" },
    ],
    createdAt: d(8, 9),
    status: "Pending",
  },
];
