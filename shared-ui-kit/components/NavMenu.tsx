import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import clsx from "clsx"
import rmHouseLogo from "../assets/nav-menu/rm-house-logo.svg"
import workspaceIcon from "../assets/nav-menu/icon-workspace.svg"
import dashboardIcon from "../assets/nav-menu/icon-dashboard.svg"
import adminIcon from "../assets/nav-menu/icon-admin.svg"
import fullMenuIcon from "../assets/nav-menu/icon-full-menu.svg"
import searchIcon from "../assets/nav-menu/icon-search.svg"
import helpIcon from "../assets/nav-menu/icon-help.svg"
import closeIcon from "../assets/nav-menu/icon-close.svg"
import settingsIcon from "../assets/nav-menu/icon-settings.svg"
import reportsIcon from "../assets/nav-menu/icon-reports.svg"
import cornerIcon from "../assets/nav-menu/icon-corner.svg"

interface MenuItem {
  label: string
  to?: string
}

interface MenuColumn {
  title: string
  items: MenuItem[]
}

interface MenuCategory {
  key: string
  label: string
  columns: MenuColumn[] | null
  setupLabel: string
  reportsLabel: string
}

/**
 * This is Rent Manager Express's actual platform-wide nav content (Rental
 * Info, Accounting, Receivables, Payables, Owners, Services, Communication).
 * It's real content, not just chrome — keep it as the shared default, but
 * feel free to add/remove items per project via the `categories` prop below.
 */
const DEFAULT_CATEGORIES: MenuCategory[] = [
  {
    key: "rental-info",
    label: "Rental Info",
    setupLabel: "Rental Info Setup",
    reportsLabel: "Rental Info Reports",
    columns: [
      {
        title: "General",
        items: ["Tenants", "Prospects", "Units", "Properties", "Unit Types", "Assets", "Violations", "Merge Prospects"].map((label) => ({
          label,
        })),
      },
      {
        title: "Leasing",
        items: [
          "Screenings",
          "Applications",
          "Application Templates",
          "Renewal Increases",
          "Prospect Leasing Board",
          "Create Renewal Offers",
          "Lease Renewal Register",
          "Lease Renewal Board",
          "Export Minnesota CRP",
        ].map((label) => ({ label })),
      },
      {
        title: "Short Term Rentals",
        items: ["STR Reservations", "Check-ins", "Find Reservation"].map((label) => ({ label })),
      },
      {
        title: "Online Listing",
        items: [{ label: "Listings" }],
      },
      {
        title: "Bird’s Eye View (BEV)",
        items: [{ label: "Manage BEV Maps" }, { label: "Manage BEV Map Views" }],
      },
    ],
  },
  { key: "accounting", label: "Accounting", setupLabel: "Accounting Setup", reportsLabel: "Accounting Reports", columns: null },
  { key: "receivables", label: "Receivables", setupLabel: "Receivables Setup", reportsLabel: "Receivables Reports", columns: null },
  {
    key: "payables",
    label: "Payables",
    setupLabel: "Payables Setup",
    reportsLabel: "Payables Reports",
    columns: [
      {
        title: "General",
        items: [
          "Vendors",
          "Vendor Credits",
          "Purchase Orders",
          "Account Balance Disbursal",
          "Export 1099",
          "Export Corrected 1099",
          "Merge Vendors",
          "Smart Receipts",
        ].map((label) => ({ label })),
      },
      {
        title: "Checks",
        items: ["Checks", "Write Checks", "Print Checks", "Post eChecks", "eChecks", "Reorder eChecks"].map((label) => ({ label })),
      },
      {
        title: "Bills",
        items: [
          { label: "Bills" },
          { label: "Add Bill" },
          { label: "Recurring Bills" },
          { label: "Pay Bills", to: "/pay-bills" },
          { label: "Post Recurring Bills" },
          { label: "Smart Bills" },
        ],
      },
      {
        title: "AvidXchange",
        items: [
          { label: "AvidInvoice" },
          { label: "Post VendorPay", to: "/post-vendorpay" },
          { label: "VendorPay Batches", to: "/vendorpay-batches" },
        ],
      },
      {
        title: "Loans Payable",
        items: [{ label: "Loans Payable" }, { label: "Post Loans Payable" }],
      },
    ],
  },
  { key: "owners", label: "Owners", setupLabel: "Owners Setup", reportsLabel: "Owners Reports", columns: null },
  { key: "services", label: "Services", setupLabel: "Services Setup", reportsLabel: "Services Reports", columns: null },
  { key: "communication", label: "Communication", setupLabel: "Communication Setup", reportsLabel: "Communication Reports", columns: null },
]

const TOP_NAV_ITEMS = [
  { icon: workspaceIcon, label: "Workspace" },
  { icon: dashboardIcon, label: "Dashboard" },
  { icon: adminIcon, label: "Administration" },
  { icon: fullMenuIcon, label: "Full Menu" },
  { icon: searchIcon, label: "Search" },
  { icon: helpIcon, label: "Help" },
]

/**
 * Portable version: the source in VendorPay reads `state.enrollmentComplete`
 * from WizardContext to gate one item ("VendorPay Batches") behind that
 * app's staged-rollout flow. That's app-specific state, so here it's a plain
 * `disabledLabels` set instead — pass the labels that should render inert
 * for whatever gating your project needs, or omit it for none disabled.
 */
export function NavMenu({
  onClose,
  categories = DEFAULT_CATEGORIES,
  disabledLabels = new Set<string>(),
  defaultCategoryKey,
}: {
  onClose: () => void
  categories?: MenuCategory[]
  disabledLabels?: Set<string>
  defaultCategoryKey?: string
}) {
  const navigate = useNavigate()
  const [selectedKey, setSelectedKey] = useState(defaultCategoryKey ?? categories[0]?.key ?? "")

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const selected = categories.find((c) => c.key === selectedKey) ?? categories[0]

  function go(item: MenuItem) {
    if (!item.to) return
    navigate(item.to)
    onClose()
  }

  return createPortal(
    <>
      <div className="fixed inset-x-0 top-12 bottom-0 z-40 bg-[rgba(76,76,76,0.5)]" onClick={onClose} />
      <div className="fixed left-2xl right-2xl top-16 z-50 mx-auto max-w-[1460px] overflow-hidden rounded-md border border-border-primary bg-white shadow-[var(--shadow-dropshadow-lg)]">
        <div className="relative flex flex-col border-b border-border-primary px-lg">
          <button type="button" aria-label="Close menu" onClick={onClose} className="absolute right-xs top-xs">
            <img src={closeIcon} alt="" className="h-6 w-6" />
          </button>
          <div className="flex h-[72px] flex-wrap items-center gap-x-9xl gap-y-xs">
            <div className="flex shrink-0 items-center gap-lg">
              <img src={rmHouseLogo} alt="" className="h-8 w-8" />
              <span className="text-2xl text-text-secondary">Menu</span>
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-x-2xl gap-y-xs">
              {TOP_NAV_ITEMS.map((item) => (
                <span key={item.label} className="flex shrink-0 items-center gap-xs whitespace-nowrap text-sm text-text-secondary">
                  <img src={item.icon} alt="" className="h-5 w-5" />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex h-[449px] items-stretch">
          <div className="flex w-[212px] shrink-0 flex-col gap-sm overflow-y-auto border-r border-border-primary py-xs">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                disabled={cat.columns === null}
                onClick={() => setSelectedKey(cat.key)}
                className={clsx(
                  "relative flex h-7 shrink-0 items-center px-md text-left text-lg",
                  cat.key === selectedKey
                    ? "bg-[#0071aa] text-white"
                    : cat.columns !== null
                      ? "text-[#0071aa] hover:bg-row-hover"
                      : "cursor-default text-[#0071aa]",
                )}
              >
                {cat.label}
                {cat.key === selectedKey && (
                  <span aria-hidden="true" className="absolute -bottom-3 right-0 flex h-3 w-[13px] rotate-180 -scale-y-100 items-center justify-center">
                    <img src={cornerIcon} alt="" className="h-3 w-[13px]" />
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between overflow-y-auto">
            {selected?.columns ? (
              <div className="flex flex-wrap gap-xs p-sm">
                {selected.columns.map((col) => (
                  <div key={col.title} className="flex flex-col gap-xs px-xs py-md">
                    <div className="border-b border-[#0071aa] pb-xxs">
                      <span className="whitespace-nowrap text-sm font-semibold text-[#0071aa]">{col.title}</span>
                    </div>
                    <div className="flex flex-col gap-sm">
                      {col.items
                        .filter((item) => !disabledLabels.has(item.label))
                        .map((item) =>
                          item.to ? (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => go(item)}
                              className="-mx-xs whitespace-nowrap rounded-sm px-xs py-xxs text-left text-sm text-text-secondary hover:bg-hover-secondary"
                            >
                              {item.label}
                            </button>
                          ) : (
                            <span key={item.label} className="whitespace-nowrap text-sm text-text-secondary">
                              {item.label}
                            </span>
                          ),
                        )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center p-sm">
                <span className="text-sm italic text-[#b3b3b3]">Not included in this prototype.</span>
              </div>
            )}

            <div className="flex shrink-0 items-center justify-between px-md py-xxs">
              <div className="flex items-center gap-xl">
                <span className="flex items-center gap-xs p-xxxs text-sm text-text-secondary">
                  <img src={settingsIcon} alt="" className="h-5 w-5" />
                  {selected?.setupLabel}
                </span>
                <span className="flex items-center gap-xs p-xxxs text-sm text-text-secondary">
                  <img src={reportsIcon} alt="" className="h-5 w-5" />
                  {selected?.reportsLabel}
                </span>
              </div>
              <span className="pr-md text-[13px] text-label-gray">Version 12.250907</span>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
