import { useMemo } from "react";
import * as TbIcons from "react-icons/tb";

/**
 * Maps keywords (substrings of item.title) to confirmed Tabler icon names.
 * Order matters — first match wins, so put more specific terms first.
 * Every icon name here is verified to exist in react-icons/tb.
 */
const KEYWORD_RULES = [
  // ── Calendar & scheduling (before "agreement"/"ale" collision) ────────────
  ["calendar event",   "TbCalendarEvent"],
  ["calendar",         "TbCalendarCheck"],
  ["schedule",         "TbCalendarEvent"],
  ["appointment",      "TbCalendarEvent"],
  ["event",            "TbCalendarEvent"],

  // ── Correspondence ────────────────────────────────────────
  ["email conversation","TbMessages"],
  ["email",            "TbMail"],
  ["e-mail",           "TbMail"],
  ["letter",           "TbMailOpened"],
  ["correspond",       "TbMailOpened"],
  ["memo",             "TbNote"],
  ["notice",           "TbNote"],
  ["circular",         "TbNote"],
  ["message",          "TbMessage"],
  ["minutes",          "TbChecklist"],
  ["agenda",           "TbChecklist"],
  ["meeting",          "TbChecklist"],

  // ── File types ────────────────────────────────────────────
  ["pdf",              "TbFileTypePdf"],
  ["excel",            "TbFileTypeXls"],
  [".xls",             "TbFileTypeXls"],
  ["spreadsheet",      "TbFileTypeXls"],
  ["word",             "TbFileTypeDoc"],
  [".doc",             "TbFileTypeDoc"],
  ["powerpoint",       "TbFileTypePpt"],
  [".ppt",             "TbFileTypePpt"],
  ["presentation",     "TbFileTypePpt"],
  ["csv",              "TbFileTypeCsv"],
  ["xml",              "TbFileTypeXml"],
  ["html",             "TbFileTypeHtml"],
  ["txt",              "TbFileTypeTxt"],
  ["zip",              "TbFileTypeZip"],
  ["image",            "TbFileTypePng"],
  ["photo",            "TbFileTypeJpg"],
  ["video",            "TbVideo"],

  // ── Legal & compliance ────────────────────────────────────
  ["contract",         "TbContract"],
  ["agreement",        "TbScale"],
  ["nda",              "TbScale"],
  ["non-disclosure",   "TbScale"],
  ["mou",              "TbScale"],
  ["endorsement",      "TbWritingSign"],
  ["memorandum",       "TbFileText"],
  ["regulation",       "TbGavel"],
  ["legislation",      "TbGavel"],
  ["bylaw",            "TbGavel"],
  ["legal",            "TbGavel"],
  ["compliance",       "TbShieldCheck"],
  ["insur",            "TbShieldCheck"],  // insurer / insurance
  ["policy",           "TbShield"],
  ["polic",            "TbShield"],       // policies
  ["permit",           "TbRubberStamp"],
  ["licence",          "TbLicense"],
  ["license",          "TbLicense"],
  ["certif",           "TbCertificate"],  // certificate / certification
  ["accreditation",    "TbCertificate"],

  // ── Insurance-specific ───────────────────────────────────
  ["sub-claim",        "TbFileAlert"],    // most specific first
  ["claim reopening",  "TbRefresh"],
  ["batch claim",      "TbFiles"],
  ["claim",            "TbFileAlert"],
  ["retrocession",     "TbTransferOut"],
  ["inward offer",     "TbFileImport"],
  ["renewal",          "TbCalendarRepeat"],
  ["admin renewal",    "TbCalendarRepeat"],
  ["reinsur",          "TbShieldCheck"],

  // ── Finance & banking ─────────────────────────────────────
  ["petty cash",       "TbCashBanknote"],  // most specific first
  ["bank account",     "TbCreditCard"],
  ["bank statement",   "TbFileDescription"],
  ["life payment",     "TbHeartHandshake"],
  ["marketing expense","TbSpeakerphone"],
  ["expense line",     "TbReceiptDollar"],
  ["expense",          "TbReceiptDollar"],
  ["tax line",         "TbReceiptTax"],
  ["tax",              "TbReceiptTax"],
  ["journal line",     "TbNotebook"],
  ["journal",          "TbNotebook"],
  ["invoice",          "TbFileInvoice"],
  ["receipt",          "TbReceipt"],
  ["financial",        "TbReportMoney"],
  ["finance",          "TbCoin"],
  ["investment",       "TbTrendingUp"],
  ["budget",           "TbCoin"],
  ["bank",             "TbBuildingBank"],
  ["account",          "TbCreditCard"],
  ["transaction",      "TbArrowsTransferUpDown"],
  ["payment",          "TbCashBanknote"],
  ["statement",        "TbFileDescription"],

  // ── Reports & analytics ───────────────────────────────────
  ["reporting unit",   "TbReportAnalytics"],
  ["audit report",     "TbReportSearch"],
  ["audit trail",      "TbClockRecord"],
  ["audit",            "TbReportSearch"],
  ["report",           "TbReportAnalytics"],
  ["analytic",         "TbFileAnalytics"],

  // ── Workflow & approvals ──────────────────────────────────
  ["approval",         "TbChecklist"],
  ["sign-off",         "TbSignature"],
  ["signature",        "TbSignature"],
  ["workflow",         "TbArrowsTransferUpDown"],
  ["process",          "TbArrowsTransferUpDown"],
  ["submission",       "TbFileExport"],
  ["subtask",          "TbSubtask"],
  ["checklist",        "TbChecklist"],
  ["task",             "TbChecklist"],
  ["assign",           "TbClipboardList"],
  ["review",           "TbReportSearch"],
  ["progress",         "TbProgress"],
  ["timeline",         "TbTimeline"],
  ["share",            "TbShare"],
  ["requisit",         "TbClipboardList"],
  ["travel",           "TbPlaneDeparture"],

  // ── IT & support ─────────────────────────────────────────
  ["it support",       "TbTool"],
  ["support ticket",   "TbTicket"],
  ["ticket",           "TbTicket"],
  ["bug",              "TbBug"],
  ["helpdesk",         "TbHelpCircle"],

  // ── Projects & records ────────────────────────────────────
  ["project",          "TbFolderStar"],
  ["case file",        "TbFolderSearch"],
  ["case",             "TbFolderSearch"],
  ["matter",           "TbFolderSearch"],
  ["record",           "TbDatabase"],
  ["register",         "TbBooks"],
  ["work order",       "TbFileText"],
  ["change log",       "TbHistory"],
  ["change",           "TbArrowsTransferUpDown"],
  ["collection",       "TbFolders"],

  // ── HR & people ───────────────────────────────────────────
  ["staff member",     "TbUserCheck"],
  ["onboarding",       "TbUserCheck"],
  ["employee",         "TbUserCheck"],
  ["personnel",        "TbUsers"],
  ["staff",            "TbUsers"],
  ["applicant",        "TbFileCv"],
  ["job vacancy",      "TbIdBadge2"],
  ["job description",  "TbId"],
  ["vacancy",          "TbIdBadge2"],
  ["contact person",   "TbAddressBook"],
  ["contact",          "TbAddressBook"],
  ["hr",               "TbUserCog"],
  ["student",          "TbCertificate"],
  ["customer",         "TbUserCheck"],
  ["vendor",           "TbShoppingCart"],
  ["supplier",         "TbShoppingCart"],
  ["client",           "TbUserCheck"],

  // ── Medical & pharmacy ────────────────────────────────────
  ["prescription",     "TbPill"],
  ["medication",       "TbPill"],
  ["medicine",         "TbPill"],
  ["pharma",           "TbPill"],
  ["medical",          "TbStethoscope"],
  ["health",           "TbHeartRateMonitor"],
  ["patient",          "TbStethoscope"],
  ["clinic",           "TbStethoscope"],

  // ── Education ─────────────────────────────────────────────
  ["library book",     "TbBook2"],
  ["library",          "TbBooks"],
  ["book",             "TbBook2"],
  ["exam",             "TbWritingSign"],
  ["test",             "TbChecklist"],
  ["course",           "TbCertificate"],
  ["training",         "TbCertificate"],
  ["school",           "TbSchool"],
  ["university",       "TbSchool"],

  // ── Assets, vehicles & facilities ────────────────────────
  ["vehicle",          "TbCar"],
  ["truck",            "TbTruck"],
  ["asset",            "TbAsset"],
  ["equipment",        "TbEngine"],
  ["facilit",          "TbBuilding"],
  ["warehouse",        "TbBuildingWarehouse"],
  ["drawing",          "TbDimensions"],
  ["specification",    "TbRulerMeasure"],
  ["spec",             "TbRulerMeasure"],
  ["map",              "TbMap2"],

  // ── Organisation & structure ──────────────────────────────
  ["department",       "TbHierarchy"],
  ["organisat",        "TbSitemap"],
  ["organizat",        "TbSitemap"],
  ["org chart",        "TbHierarchy2"],
  ["building",         "TbBuilding"],
  ["transfer",         "TbTransferIn"],

  // ── Annotations & markup ─────────────────────────────────
  ["annotation",       "TbFilePencil"],
  ["markup",           "TbFilePencil"],
  ["comment",          "TbMessage"],
  ["feedback",         "TbMessage"],

  // ── Storage & containers ──────────────────────────────────
  ["archive box",      "TbArchive"],
  ["filing slot",      "TbFolder"],
  ["archive",          "TbArchive"],
  ["inbox",            "TbInbox"],
  ["vault",            "TbFolderCheck"],
  ["shared folder",    "TbFolderShare"],
  ["folder",           "TbFolder"],
  ["template",         "TbTemplate"],
  ["slot",             "TbFolder"],

  // ── Generic documents (catch-all) ─────────────────────────
  ["document",         "TbFileText"],
  ["file",             "TbFolder"],
  ["note",             "TbNote"],
];

export default function DynamicIcon({
  name = "",
  size = 20,
  color = "currentColor",
  className = "",
}) {
  const Icon = useMemo(() => {
    const lower = name.trim().toLowerCase();

    for (const [keyword, iconName] of KEYWORD_RULES) {
      if (lower.includes(keyword)) {
        const icon = TbIcons[iconName];
        if (icon) return icon;
      }
    }

    return TbIcons.TbFolder;
  }, [name]);

  return <Icon size={size} color={color} className={className} />;
}