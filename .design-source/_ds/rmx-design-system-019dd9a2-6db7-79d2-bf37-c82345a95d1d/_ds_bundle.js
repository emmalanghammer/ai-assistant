/* @ds-bundle: {"format":3,"namespace":"RMXDesignSystem_019dd9","components":[],"sourceHashes":{"ui_kits/rentmanager-app/App.jsx":"2a1efbde7981","ui_kits/rentmanager-app/browser-window.jsx":"2e3bb69bede4","ui_kits/rentmanager-app/components.jsx":"6bd6140e49a9"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.RMXDesignSystem_019dd9 = window.RMXDesignSystem_019dd9 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// ui_kits/rentmanager-app/App.jsx
try { (() => {
// Rent Manager app demo — assembles components into a Receivables / Tenants register.
const {
  useState
} = React;
const {
  Icon,
  Avatar,
  Button,
  Field,
  Badge,
  Checkbox,
  Header,
  ContextBar,
  ContextIconButton,
  PageHeader,
  MegaMenu,
  Card,
  Table,
  Dialog,
  Toast
} = window.RMX;

// ----- Mega menu modules (mirrors actual Rent Manager top-level nav) -----
const MODULES = [{
  name: 'Receivables',
  icon: 'receipt_long',
  color: '#008dd5',
  items: ['Tenants', 'Invoices', 'Memorized Invoices', 'Recurring Charges', 'Post Recurring Charges', 'Late Fees']
}, {
  name: 'Payables',
  icon: 'payments',
  color: '#0071aa',
  items: ['Vendors', 'Bills', 'Recurring Bills', 'Memorized Bills', '1099 Tracking', 'Pay Bills']
}, {
  name: 'Accounting',
  icon: 'account_balance',
  color: '#13314c',
  items: ['Chart of Accounts', 'Journal Entries', 'Bank Accounts', 'Reconcile', 'Budgets', 'Trial Balance']
}, {
  name: 'Communication',
  icon: 'forum',
  color: '#3f7e1f',
  items: ['Email', 'Letters', 'Text Messages', 'Owner Statements', 'Call Logs', 'Mail Merge']
}, {
  name: 'Rental Info',
  icon: 'apartment',
  color: '#a85e0e',
  items: ['Properties', 'Units', 'Unit Types', 'Marketing', 'Showings', 'Lease Renewals']
}, {
  name: 'Owners',
  icon: 'groups',
  color: '#a52e57',
  items: ['Owners', 'Owner Statements', 'Owner Distributions', 'Management Fees', 'Reserves']
}, {
  name: 'Services',
  icon: 'build',
  color: '#0071aa',
  items: ['Service Issues', 'Service Manager', 'Inspections', 'Recurring Issues', 'Asset Tracking']
}, {
  name: 'Admin',
  icon: 'admin_panel_settings',
  color: '#13314c',
  items: ['Users & Permissions', 'Locations', 'Custom Fields', 'Workflow', 'Integrations', 'Audit Trail']
}];

// ----- Sample tenants -----
const TENANTS = [{
  name: 'Allen, Marcus',
  property: 'Oakridge Commons',
  unit: '12-203',
  status: 'Current',
  balance: 0,
  lease: '12/31/2025',
  phone: '(513) 555-0142',
  flag: null
}, {
  name: 'Berman, Lila',
  property: 'Riverwalk Lofts',
  unit: '04-110',
  status: 'Past Due',
  balance: 1842.50,
  lease: '08/14/2025',
  phone: '(513) 555-0188',
  flag: 'late'
}, {
  name: 'Calderón, Inés',
  property: 'Oakridge Commons',
  unit: '08-414',
  status: 'Current',
  balance: 0,
  lease: '03/01/2026',
  phone: '(513) 555-0125',
  flag: null
}, {
  name: 'Diallo, Cheikh',
  property: 'Maple Ridge Townhomes',
  unit: '22B',
  status: 'Current',
  balance: 0,
  lease: '06/15/2026',
  phone: '(513) 555-0163',
  flag: null
}, {
  name: 'Esposito, Renata',
  property: 'Riverwalk Lofts',
  unit: '07-302',
  status: 'Notice',
  balance: 215.00,
  lease: '02/28/2026',
  phone: '(513) 555-0119',
  flag: 'notice'
}, {
  name: 'Fitch, Gregory',
  property: 'Briarwood Estates',
  unit: '14',
  status: 'Current',
  balance: 0,
  lease: '11/30/2025',
  phone: '(513) 555-0177',
  flag: null
}, {
  name: 'Gomes, Helena',
  property: 'Oakridge Commons',
  unit: '03-118',
  status: 'Past Due',
  balance: 678.00,
  lease: '07/01/2026',
  phone: '(513) 555-0148',
  flag: 'late'
}, {
  name: 'Haddad, Yusuf',
  property: 'Maple Ridge Townhomes',
  unit: '08A',
  status: 'Current',
  balance: 0,
  lease: '09/30/2026',
  phone: '(513) 555-0156',
  flag: null
}, {
  name: 'Iverson, Bethany',
  property: 'Briarwood Estates',
  unit: '07',
  status: 'Pre-leased',
  balance: 0,
  lease: '01/15/2026',
  phone: '(513) 555-0193',
  flag: 'pre'
}, {
  name: 'Joiner, Marcus',
  property: 'Riverwalk Lofts',
  unit: '11-205',
  status: 'Current',
  balance: 0,
  lease: '04/12/2026',
  phone: '(513) 555-0134',
  flag: null
}];
const STATUS_BADGE = {
  'Current': {
    kind: 'success'
  },
  'Past Due': {
    kind: 'error',
    icon: 'error'
  },
  'Notice': {
    kind: 'warning',
    icon: 'warning'
  },
  'Pre-leased': {
    kind: 'info'
  },
  'Vacant': {
    kind: 'neutral'
  }
};
const fmtMoney = n => n === 0 ? '—' : '$' + n.toLocaleString('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});
function App() {
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeNav, setActiveNav] = useState(null);
  const [selectedTenant, setSelectedTenant] = useState(TENANTS[1]); // start on Lila (past due — interesting)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [chargeAmount, setChargeAmount] = useState('1842.50');
  const [chargeMemo, setChargeMemo] = useState('');
  const showToast = (msg, kind = 'success') => {
    setToast({
      msg,
      kind
    });
    setTimeout(() => setToast(null), 3000);
  };
  const openModule = m => {
    setActiveNav(null);
    showToast(`Opened ${m.name}`, 'info');
  };
  const totalBalance = TENANTS.reduce((s, t) => s + t.balance, 0);
  const pastDueCount = TENANTS.filter(t => t.balance > 0).length;
  return /*#__PURE__*/React.createElement("div", {
    className: "app"
  }, /*#__PURE__*/React.createElement(Header, {
    companyCode: "lcs-rmexpress",
    user: {
      initials: 'MR',
      name: 'Mila Reyes'
    },
    active: activeNav,
    onMega: () => {
      setMegaOpen(o => !o);
      setActiveNav(activeNav === 'mega' ? null : 'mega');
    },
    onFavorites: () => {
      setActiveNav(activeNav === 'favorites' ? null : 'favorites');
      showToast('Favorites menu', 'info');
    },
    onReports: () => {
      setActiveNav(activeNav === 'reports' ? null : 'reports');
      showToast('Reports menu', 'info');
    }
  }), /*#__PURE__*/React.createElement(MegaMenu, {
    open: megaOpen,
    modules: MODULES,
    onPick: openModule,
    onClose: () => {
      setMegaOpen(false);
      setActiveNav(null);
    }
  }), /*#__PURE__*/React.createElement(ContextBar, {
    leadingIcon: "receipt_long",
    title: "Receivables \u2014 Tenants",
    count: TENANTS.length,
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ContextIconButton, {
      icon: "add",
      label: "New tenant",
      onClick: () => showToast('Creating new tenant…', 'info')
    }), /*#__PURE__*/React.createElement(ContextIconButton, {
      icon: "filter_list",
      label: "Filter",
      onClick: () => showToast('Filter menu', 'info')
    }), /*#__PURE__*/React.createElement(ContextIconButton, {
      icon: "file_download",
      label: "Export",
      onClick: () => showToast('Export started')
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        height: 20,
        background: 'rgba(255,255,255,.2)',
        margin: '0 6px'
      }
    }), /*#__PURE__*/React.createElement(ContextIconButton, {
      icon: "refresh",
      label: "Refresh",
      onClick: () => showToast('Refreshed')
    }), /*#__PURE__*/React.createElement(ContextIconButton, {
      icon: "more_vert",
      label: "More",
      onClick: () => {}
    }))
  }), /*#__PURE__*/React.createElement("div", {
    className: "main"
  }, /*#__PURE__*/React.createElement(PageHeader, {
    title: "Tenants",
    subtitle: "All active and pending tenants across managed properties",
    breadcrumbs: ['Receivables', 'Tenants'],
    status: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      kind: "error",
      icon: "error"
    }, pastDueCount, " past due"), /*#__PURE__*/React.createElement(Badge, {
      kind: "info"
    }, "$", totalBalance.toLocaleString('en-US', {
      minimumFractionDigits: 2
    }), " outstanding")),
    actions: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      leadingIcon: "print"
    }, "Print"), /*#__PURE__*/React.createElement(Button, {
      kind: "primary",
      leadingIcon: "add",
      onClick: () => setDialogOpen(true)
    }, "Post Charge"))
  }), /*#__PURE__*/React.createElement("div", {
    className: "content"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    placeholder: "Search tenants\u2026",
    leadingIcon: "search",
    width: 320
  }), /*#__PURE__*/React.createElement(Field, {
    placeholder: "All properties",
    trailingIcon: "keyboard_arrow_down",
    width: 200
  }), /*#__PURE__*/React.createElement(Field, {
    placeholder: "All statuses",
    trailingIcon: "keyboard_arrow_down",
    width: 180
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Hide zero balance",
    onChange: () => {}
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: `${selectedTenant.name}`,
    headerActions: /*#__PURE__*/React.createElement(Badge, {
      kind: STATUS_BADGE[selectedTenant.status].kind,
      icon: STATUS_BADGE[selectedTenant.status].icon
    }, selectedTenant.status),
    style: {
      flex: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Property",
    value: selectedTenant.property,
    leadingIcon: "apartment",
    disabled: true
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Unit",
    value: selectedTenant.unit,
    disabled: true
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Phone",
    value: selectedTenant.phone,
    leadingIcon: "phone"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Lease end",
    value: selectedTenant.lease,
    leadingIcon: "event"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Email",
    value: `${selectedTenant.name.split(',')[1]?.trim().toLowerCase()}.${selectedTenant.name.split(',')[0].toLowerCase()}@example.com`,
    leadingIcon: "mail"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Account balance",
    value: selectedTenant.balance > 0 ? fmtMoney(selectedTenant.balance) : '$0.00',
    leadingIcon: "account_balance_wallet",
    error: selectedTenant.balance > 0,
    disabled: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      paddingTop: 16,
      borderTop: '1px solid #ebf1f5',
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    leadingIcon: "mail",
    size: "compact"
  }, "Email tenant"), /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    leadingIcon: "receipt",
    size: "compact"
  }, "Statement"), /*#__PURE__*/React.createElement(Button, {
    kind: "secondary",
    leadingIcon: "history",
    size: "compact"
  }, "History"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Button, {
    kind: "ghost",
    trailingIcon: "open_in_new",
    size: "compact"
  }, "Open record"))), /*#__PURE__*/React.createElement(Card, {
    title: "Account summary",
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, [['Open invoices', selectedTenant.balance > 0 ? '$' + selectedTenant.balance.toFixed(2) : '$0.00', selectedTenant.balance > 0 ? '#eb343c' : '#13314c'], ['Last payment', '$1,475.00 · Oct 03', '#13314c'], ['Lease through', selectedTenant.lease, '#13314c'], ['Days in unit', '412', '#13314c']].map(([k, v, c], i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#666',
      textTransform: 'uppercase',
      letterSpacing: '.04em'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Roboto Mono',
      fontSize: 14,
      color: c,
      fontWeight: 500
    }
  }, v))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: '#ebf1f5',
      margin: '4px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#666',
      textTransform: 'uppercase',
      letterSpacing: '.04em'
    }
  }, "Lease term progress"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: '#ebf1f5',
      borderRadius: 3,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '72%',
      height: '100%',
      background: '#008dd5'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#666'
    }
  }, "412 of 575 days"))))), /*#__PURE__*/React.createElement(Card, {
    title: "All Tenants",
    headerActions: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'Roboto Mono'
      }
    }, TENANTS.length, " rows"), /*#__PURE__*/React.createElement(Button, {
      kind: "ghost",
      leadingIcon: "filter_list",
      size: "compact"
    }, "Filter"), /*#__PURE__*/React.createElement(Button, {
      kind: "ghost",
      leadingIcon: "view_column",
      size: "compact"
    }, "Columns"), /*#__PURE__*/React.createElement(Button, {
      kind: "ghost",
      leadingIcon: "file_download",
      size: "compact"
    }, "Export")),
    padding: 0
  }, /*#__PURE__*/React.createElement(Table, {
    getKey: r => r.name,
    selectedKey: selectedTenant.name,
    columns: [{
      key: 'name',
      label: 'Name',
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#008dd5',
          fontWeight: 500
        }
      }, r.name)
    }, {
      key: 'property',
      label: 'Property'
    }, {
      key: 'unit',
      label: 'Unit',
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'Roboto Mono',
          color: '#13314c'
        }
      }, r.unit)
    }, {
      key: 'status',
      label: 'Status',
      render: r => /*#__PURE__*/React.createElement(Badge, {
        kind: STATUS_BADGE[r.status].kind,
        icon: STATUS_BADGE[r.status].icon
      }, r.status)
    }, {
      key: 'balance',
      label: 'Balance',
      align: 'right',
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'Roboto Mono',
          color: r.balance > 0 ? '#eb343c' : '#666',
          fontWeight: r.balance > 0 ? 500 : 400
        }
      }, fmtMoney(r.balance))
    }, {
      key: 'lease',
      label: 'Lease end',
      color: '#666'
    }, {
      key: 'phone',
      label: 'Phone',
      color: '#666'
    }],
    rows: TENANTS,
    onRowClick: setSelectedTenant
  })))), /*#__PURE__*/React.createElement(Dialog, {
    open: dialogOpen,
    title: `Post charge — ${selectedTenant.name}`,
    onClose: () => setDialogOpen(false),
    primaryAction: /*#__PURE__*/React.createElement(Button, {
      kind: "primary",
      onClick: () => {
        setDialogOpen(false);
        showToast(`Posted $${chargeAmount} charge to ${selectedTenant.name}`);
        setChargeMemo('');
      }
    }, "Post charge"),
    secondaryAction: /*#__PURE__*/React.createElement(Button, {
      kind: "secondary",
      onClick: () => setDialogOpen(false)
    }, "Cancel")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: '#666'
    }
  }, "Add a one-time charge to ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: '#13314c'
    }
  }, selectedTenant.unit, " \xB7 ", selectedTenant.property), "."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Charge type",
    value: "Late Fee",
    trailingIcon: "keyboard_arrow_down",
    width: "100%"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "GL Account",
    value: "4100 \xB7 Late Fees",
    trailingIcon: "keyboard_arrow_down",
    width: "100%"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Amount",
    required: true,
    value: chargeAmount,
    onChange: setChargeAmount,
    leadingIcon: "attach_money",
    width: "100%"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Posting date",
    value: "10/14/2025",
    leadingIcon: "event",
    width: "100%"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Memo",
    value: chargeMemo,
    onChange: setChargeMemo,
    placeholder: "Briefly describe the charge",
    width: "100%"
  }))), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 1100,
      minWidth: 280
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    kind: toast.kind,
    onDismiss: () => setToast(null)
  }, toast.msg)));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/rentmanager-app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/rentmanager-app/browser-window.jsx
try { (() => {
// Chrome.jsx — Simplified Chrome browser window (dark theme, macOS)
// No dependencies, no image assets. All inline styles + inline SVG.

const CHROME_C = {
  barBg: '#202124',
  tabBg: '#35363a',
  text: '#e8eaed',
  dim: '#9aa0a6',
  urlBg: '#282a2d'
};
function ChromeTrafficLights() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: '#ff5f57'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: '#febc2e'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: '#28c840'
    }
  }));
}

// Single tab (active has curved scoops)
function ChromeTab({
  title = 'New Tab',
  active = false
}) {
  const curve = flip => /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "10",
    viewBox: "0 0 8 10",
    style: {
      position: 'absolute',
      bottom: 0,
      [flip ? 'right' : 'left']: -8,
      transform: flip ? 'scaleX(-1)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M0 10C2 9 6 8 8 0V10H0Z",
    fill: CHROME_C.tabBg
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 34,
      alignSelf: 'flex-end',
      padding: '0 12px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: active ? CHROME_C.tabBg : 'transparent',
      borderRadius: '8px 8px 0 0',
      minWidth: 120,
      maxWidth: 220,
      fontFamily: 'system-ui, sans-serif',
      fontSize: 12,
      color: active ? CHROME_C.text : CHROME_C.dim
    }
  }, active && curve(false), active && curve(true), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 14,
      height: 14,
      borderRadius: '50%',
      background: '#5f6368',
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, title));
}
function ChromeTabBar({
  tabs = [{
    title: 'New Tab'
  }],
  activeIndex = 0
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      height: 44,
      background: CHROME_C.barBg,
      paddingRight: 8
    }
  }, /*#__PURE__*/React.createElement(ChromeTrafficLights, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      height: '100%',
      paddingLeft: 4,
      flex: 1
    }
  }, tabs.map((t, i) => /*#__PURE__*/React.createElement(ChromeTab, {
    key: i,
    title: t.title,
    active: i === activeIndex
  }))));
}
function ChromeToolbar({
  url = 'example.com'
}) {
  const iconDot = /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      background: CHROME_C.dim,
      opacity: 0.4
    }
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 40,
      background: CHROME_C.tabBg,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      padding: '0 8px'
    }
  }, iconDot, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 30,
      borderRadius: 15,
      background: CHROME_C.urlBg,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 14px',
      margin: '0 6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      borderRadius: '50%',
      background: CHROME_C.dim,
      opacity: 0.4
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      color: CHROME_C.text,
      fontSize: 13,
      fontFamily: 'system-ui, sans-serif'
    }
  }, url)), iconDot);
}
function ChromeWindow({
  tabs = [{
    title: 'New Tab'
  }],
  activeIndex = 0,
  url = 'example.com',
  width = 900,
  height = 600,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      background: CHROME_C.tabBg
    }
  }, /*#__PURE__*/React.createElement(ChromeTabBar, {
    tabs: tabs,
    activeIndex: activeIndex
  }), /*#__PURE__*/React.createElement(ChromeToolbar, {
    url: url
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: '#fff',
      overflow: 'auto'
    }
  }, children));
}
Object.assign(window, {
  ChromeWindow,
  ChromeTabBar,
  ChromeToolbar,
  ChromeTab,
  ChromeTrafficLights
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/rentmanager-app/browser-window.jsx", error: String((e && e.message) || e) }); }

// ui_kits/rentmanager-app/components.jsx
try { (() => {
// Rent Manager UI components — load with <script type="text/babel" src="components.jsx"></script>
// Exposes window.RMX = { Header, ContextBar, PageHeader, MegaMenu, Button, Field, ... }

const {
  useState,
  useEffect,
  useRef
} = React;

// ---------- atoms ----------
const Icon = ({
  name,
  size = 20,
  style,
  color,
  fill = 0
}) => /*#__PURE__*/React.createElement("span", {
  className: "material-symbols-outlined",
  style: {
    fontSize: size,
    color: color || 'inherit',
    fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
    lineHeight: 1,
    flexShrink: 0,
    userSelect: 'none',
    ...style
  }
}, name);
const Avatar = ({
  initials = 'MR',
  color = '#008dd5',
  size = 32
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: size,
    height: size,
    borderRadius: '50%',
    background: color,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.4,
    fontWeight: 500,
    flexShrink: 0
  }
}, initials);

// ---------- buttons ----------
const Button = ({
  kind = 'primary',
  size = 'default',
  leadingIcon,
  trailingIcon,
  children,
  onClick,
  disabled,
  style
}) => {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
  const heights = {
    default: 36,
    compact: 28
  };
  const styles = {
    primary: {
      background: disabled ? '#cedbe7' : pressed ? '#195ca4' : hover ? '#0071aa' : '#008dd5',
      color: '#fff',
      border: 'none'
    },
    secondary: {
      background: disabled ? '#f5f8fa' : hover ? '#ebf1f5' : '#fff',
      color: disabled ? '#b3b3b3' : '#008dd5',
      border: `1px solid ${disabled ? '#cedbe7' : '#008dd5'}`
    },
    ghost: {
      background: hover ? '#ebf1f5' : 'transparent',
      color: disabled ? '#b3b3b3' : '#008dd5',
      border: 'none'
    },
    onBlue: {
      background: hover ? 'rgba(255,255,255,.15)' : 'transparent',
      color: '#fff',
      border: '1px solid rgba(255,255,255,.4)'
    }
  };
  return /*#__PURE__*/React.createElement("button", {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPressed(false);
    },
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
    onClick: disabled ? null : onClick,
    style: {
      height: heights[size],
      padding: '0 16px',
      borderRadius: 4,
      fontFamily: 'Roboto',
      fontSize: 14,
      lineHeight: '20px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 120ms ease',
      ...styles[kind],
      ...style
    }
  }, leadingIcon && /*#__PURE__*/React.createElement(Icon, {
    name: leadingIcon,
    size: 20
  }), children, trailingIcon && /*#__PURE__*/React.createElement(Icon, {
    name: trailingIcon,
    size: 20
  }));
};

// ---------- field ----------
const Field = ({
  label,
  required,
  leadingIcon,
  trailingIcon,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  readOnly,
  focused: forcedFocus,
  width = 248,
  style
}) => {
  const [focused, setFocused] = useState(false);
  const isFocused = forcedFocus ?? focused;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      width,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'Roboto',
      fontSize: 14,
      color: '#666'
    }
  }, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#eb343c',
      marginRight: 2
    }
  }, "*"), label), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 36,
      borderRadius: 4,
      background: disabled ? '#fff' : '#f5f8fa',
      border: `1px solid ${error ? '#eb343c' : isFocused ? '#008dd5' : '#cedbe7'}`,
      boxShadow: isFocused && !error ? '0 0 0 4px rgba(0,141,213,0.20)' : 'none',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '0 8px',
      transition: 'border-color 120ms, box-shadow 120ms'
    }
  }, leadingIcon && /*#__PURE__*/React.createElement(Icon, {
    name: leadingIcon,
    size: 20,
    color: "#008dd5"
  }), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: value ?? '',
    onChange: onChange ? e => onChange(e.target.value) : undefined,
    readOnly: readOnly || !onChange && value !== undefined,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    placeholder: placeholder,
    disabled: disabled,
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'Roboto',
      fontSize: 14,
      color: disabled ? '#b3b3b3' : '#000',
      fontStyle: disabled ? 'italic' : 'normal',
      minWidth: 0
    }
  }), trailingIcon && /*#__PURE__*/React.createElement(Icon, {
    name: trailingIcon,
    size: 20,
    color: error ? '#eb343c' : '#666'
  })));
};

// ---------- badge ----------
const Badge = ({
  kind = 'neutral',
  icon,
  children
}) => {
  const map = {
    success: {
      bg: '#e2f1da',
      fg: '#3f7e1f'
    },
    error: {
      bg: '#fde8e9',
      fg: '#a8232a'
    },
    warning: {
      bg: '#fdebd9',
      fg: '#a85e0e'
    },
    info: {
      bg: '#ebf1f5',
      fg: '#0071aa'
    },
    magenta: {
      bg: '#fce0eb',
      fg: '#a52e57'
    },
    neutral: {
      bg: '#f5f8fa',
      fg: '#666',
      border: '1px solid #cedbe7'
    },
    onBlue: {
      bg: 'rgba(255,255,255,.18)',
      fg: '#fff'
    }
  };
  const c = map[kind];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 4,
      background: c.bg,
      color: c.fg,
      border: c.border || 'none',
      fontFamily: 'Roboto',
      fontSize: 12,
      lineHeight: '16px',
      fontWeight: 500
    }
  }, icon && /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 14
  }), children);
};

// ---------- checkbox / radio ----------
const Checkbox = ({
  checked,
  disabled,
  label,
  onChange
}) => /*#__PURE__*/React.createElement("label", {
  style: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'Roboto',
    fontSize: 14,
    color: disabled ? '#b3b3b3' : '#666',
    cursor: disabled ? 'not-allowed' : 'pointer'
  }
}, /*#__PURE__*/React.createElement("span", {
  onClick: () => !disabled && onChange && onChange(!checked),
  style: {
    width: 18,
    height: 18,
    borderRadius: 2,
    border: `2px solid ${checked ? disabled ? '#cedbe7' : '#008dd5' : disabled ? '#cedbe7' : '#b3b3b3'}`,
    background: checked ? disabled ? '#cedbe7' : '#008dd5' : '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: 14
  }
}, checked ? '✓' : ''), label);

// ---------- header w/ Rent Manager logo + nav ----------
// White Rent Manager mark — currentColor so we can recolor via parent.
const RentManagerMark = ({
  size = 32
}) => /*#__PURE__*/React.createElement("svg", {
  width: size,
  height: size,
  viewBox: "0 0 31.982 31.982",
  fill: "none",
  style: {
    display: 'block',
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("path", {
  d: "M 15.267 2.428 L 26.943 10.329 L 30.533 10.329 L 25.304 6.792 L 25.304 3.114 L 19.87 3.114 L 15.267 0 L 10.663 3.114 L 5.226 3.114 L 5.226 6.792 L 0 10.329 L 3.587 10.329 L 15.267 2.428 Z",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("rect", {
  x: "5.226",
  y: "10.5",
  width: "20.115",
  height: "16.5",
  fill: "currentColor",
  opacity: ".22"
}), [0, 1, 2].map(r => [0, 1, 2].map(c => /*#__PURE__*/React.createElement("rect", {
  key: `${r}-${c}`,
  x: 7.902 + c * 5.616,
  y: 12.483 + r * 5.001,
  width: 3.515,
  height: 3.526,
  rx: 0.6,
  fill: "currentColor"
}))), /*#__PURE__*/React.createElement("path", {
  d: "M 20.756 25.611 C 12.969 29.68 5.221 30.226 3.451 26.822 C 2.946 25.859 2.996 24.673 3.484 23.384 C 1.756 25.737 1.118 27.985 1.969 29.631 C 3.834 33.208 11.979 32.636 20.162 28.368 C 27.9 24.325 32.896 18.409 31.842 14.754 C 31.045 18.121 26.777 22.456 20.756 25.611 Z",
  fill: "currentColor"
}));
const RentManagerWordmark = ({
  height = 22
}) =>
/*#__PURE__*/
// Uses the imported wordmark via <img> with currentColor not possible — we draw with currentColor svg.
// Wordmark glyph paths copied from /assets/logo-rentmanager-wordmark.svg
React.createElement("svg", {
  width: Math.round(height * 139 / 21.656),
  height: height,
  viewBox: "0 0 139 21.656",
  fill: "currentColor",
  style: {
    display: 'block',
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("path", {
  d: "M 0.007 0.365 C 1.159 0.149 2.829 0 4.573 0 C 6.956 0 8.55 0.392 9.679 1.317 C 10.587 2.073 11.103 3.222 11.103 4.633 C 11.103 6.757 9.652 8.196 8.084 8.733 L 8.084 8.804 C 9.288 9.243 9.999 10.388 10.389 11.975 C 10.93 14.025 11.372 15.926 11.692 16.557 L 8.598 16.557 C 8.353 16.074 7.935 14.727 7.49 12.68 C 6.997 10.536 6.235 9.851 4.518 9.803 L 2.995 9.803 L 2.995 16.557 L 0 16.557 L 0 0.365 Z M 3.002 7.608 L 4.794 7.608 C 6.83 7.608 8.084 6.534 8.084 4.9 C 8.084 3.12 6.83 2.266 4.865 2.266 C 3.91 2.266 3.298 2.337 3.002 2.411 L 3.002 7.608 Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 15.081 11.465 C 15.156 13.613 16.825 14.538 18.763 14.538 C 20.164 14.538 21.146 14.318 22.078 14.001 L 22.52 16.051 C 21.489 16.49 20.065 16.807 18.345 16.807 C 14.466 16.807 12.181 14.44 12.181 10.806 C 12.181 7.514 14.194 4.417 18.025 4.417 C 21.857 4.417 23.183 7.588 23.183 10.195 C 23.183 10.756 23.132 11.195 23.084 11.465 L 15.081 11.465 Z M 20.334 9.368 C 20.361 8.27 19.868 6.464 17.855 6.464 C 15.989 6.464 15.203 8.142 15.081 9.368 L 20.334 9.368 Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 24.631 8.22 C 24.631 6.855 24.583 5.71 24.536 4.684 L 27.16 4.684 L 27.31 6.467 L 27.381 6.467 C 27.918 5.538 29.224 4.417 31.213 4.417 C 33.201 4.417 35.459 5.758 35.459 9.513 L 35.459 16.561 L 32.437 16.561 L 32.437 9.857 C 32.437 8.149 31.797 6.855 30.152 6.855 C 28.948 6.855 28.112 7.71 27.796 8.615 C 27.697 8.854 27.646 9.219 27.646 9.564 L 27.646 16.561 L 24.624 16.561 L 24.624 8.22 Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 41.038 1.638 L 41.038 4.684 L 43.91 4.684 L 43.91 6.93 L 41.038 6.93 L 41.038 12.171 C 41.038 13.636 41.429 14.369 42.585 14.369 C 43.125 14.369 43.421 14.345 43.764 14.247 L 43.815 16.517 C 43.373 16.686 42.564 16.831 41.629 16.831 C 40.501 16.831 39.593 16.466 39.025 15.855 C 38.362 15.173 38.066 14.075 38.066 12.515 L 38.066 6.93 L 36.373 6.93 L 36.373 4.687 L 38.066 4.687 L 38.066 2.469 L 41.038 1.641 Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 63.404 9.854 C 63.306 7.73 63.183 5.17 63.207 2.951 L 63.136 2.951 C 62.595 4.954 61.908 7.169 61.171 9.246 L 58.737 16.365 L 56.428 16.365 L 54.222 9.341 C 53.583 7.244 52.994 5.001 52.553 2.951 L 52.502 2.951 C 52.427 5.096 52.328 7.71 52.209 9.952 L 51.835 16.561 L 49.013 16.561 L 50.118 0.125 L 54.096 0.125 L 56.255 6.734 C 56.843 8.662 57.363 10.61 57.778 12.441 L 57.853 12.441 C 58.295 10.661 58.859 8.638 59.498 6.71 L 61.779 0.125 L 65.706 0.125 L 66.665 16.561 L 63.717 16.561 L 63.398 9.857 Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 78.016 13.707 C 78.016 14.781 78.067 15.828 78.213 16.561 L 75.487 16.561 L 75.266 15.244 L 75.191 15.244 C 74.477 16.169 73.229 16.827 71.655 16.827 C 69.252 16.827 67.899 15.098 67.899 13.292 C 67.899 10.317 70.578 8.78 74.997 8.804 L 74.997 8.611 C 74.997 7.828 74.678 6.534 72.563 6.534 C 71.387 6.534 70.16 6.899 69.347 7.412 L 68.755 5.461 C 69.643 4.927 71.19 4.414 73.08 4.414 C 76.911 4.414 78.016 6.828 78.016 9.435 Z M 75.069 10.756 C 72.934 10.732 70.897 11.171 70.897 12.974 C 70.897 14.149 71.655 14.683 72.614 14.683 C 73.841 14.683 74.702 13.903 74.997 13.052 C 75.069 12.832 75.069 12.613 75.069 12.39 L 75.069 10.756 Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 80.226 8.22 C 80.226 6.855 80.175 5.71 80.127 4.684 L 82.752 4.684 L 82.902 6.467 L 82.973 6.467 C 83.51 5.538 84.812 4.417 86.801 4.417 C 88.79 4.417 91.051 5.758 91.051 9.513 L 91.051 16.561 L 88.028 16.561 L 88.028 9.857 C 88.028 8.149 87.389 6.855 85.747 6.855 C 84.544 6.855 83.707 7.71 83.388 8.615 C 83.289 8.854 83.242 9.219 83.242 9.564 L 83.242 16.561 L 80.223 16.561 L 80.223 8.22 Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 102.569 13.707 C 102.569 14.781 102.616 15.828 102.766 16.561 L 100.043 16.561 L 99.822 15.244 L 99.747 15.244 C 99.033 16.169 97.785 16.827 96.211 16.827 C 93.804 16.827 92.455 15.098 92.455 13.292 C 92.455 10.317 95.13 8.78 99.55 8.804 L 99.55 8.611 C 99.55 7.828 99.23 6.534 97.116 6.534 C 95.939 6.534 94.709 6.899 93.9 7.412 L 93.315 5.461 C 94.195 4.927 95.742 4.414 97.632 4.414 C 101.464 4.414 102.569 6.828 102.569 9.435 Z M 99.625 10.756 C 97.486 10.732 95.45 11.171 95.45 12.974 C 95.45 14.149 96.211 14.683 97.167 14.683 C 98.397 14.683 99.254 13.903 99.55 13.052 C 99.621 12.832 99.621 12.613 99.621 12.39 L 99.621 10.756 Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 115.61 14.828 C 115.61 17.314 115.093 19.1 113.842 20.218 C 112.615 21.319 110.871 21.656 109.225 21.656 C 107.702 21.656 106.084 21.315 105.051 20.711 L 105.714 18.438 C 106.475 18.877 107.753 19.343 109.202 19.343 C 111.167 19.343 112.642 18.32 112.642 15.757 L 112.642 14.73 L 112.595 14.73 C 111.904 15.781 110.701 16.486 109.106 16.486 C 106.135 16.486 104.024 14.048 104.024 10.685 C 104.024 6.781 106.577 4.417 109.45 4.417 C 111.292 4.417 112.35 5.295 112.914 6.271 L 112.965 6.271 L 113.088 4.687 L 115.712 4.687 C 115.661 5.491 115.613 6.47 115.613 8.101 Z M 112.591 9.435 C 112.591 9.141 112.564 8.878 112.493 8.635 C 112.173 7.537 111.313 6.707 110.038 6.707 C 108.342 6.707 107.094 8.169 107.094 10.583 C 107.094 12.61 108.124 14.244 110.014 14.244 C 111.143 14.244 112.125 13.511 112.469 12.414 C 112.567 12.123 112.595 11.708 112.595 11.367 L 112.595 9.439 Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 120.006 11.465 C 120.081 13.613 121.75 14.538 123.691 14.538 C 125.092 14.538 126.071 14.318 127.006 14.001 L 127.448 16.051 C 126.418 16.49 124.99 16.807 123.273 16.807 C 119.394 16.807 117.109 14.44 117.109 10.806 C 117.109 7.514 119.122 4.417 122.953 4.417 C 126.785 4.417 128.111 7.588 128.111 10.195 C 128.111 10.756 128.063 11.195 128.012 11.465 L 120.006 11.465 Z M 125.262 9.368 C 125.286 8.27 124.796 6.464 122.783 6.464 C 120.92 6.464 120.132 8.142 120.009 9.368 L 125.262 9.368 Z"
}), /*#__PURE__*/React.createElement("path", {
  d: "M 129.556 8.513 C 129.556 6.903 129.532 5.734 129.46 4.684 L 132.107 4.684 L 132.205 7.025 L 132.302 7.025 C 132.911 5.295 134.341 4.417 135.689 4.417 C 135.984 4.417 136.155 4.441 136.402 4.488 L 136.402 7.342 C 136.155 7.295 135.886 7.247 135.516 7.247 C 134.04 7.247 133.06 8.196 132.788 9.561 C 132.741 9.83 132.715 10.171 132.715 10.512 L 132.715 16.561 L 129.556 16.561 L 129.556 8.513 Z"
}));

// Header nav button — these are the 3 dark-grey pill buttons attached to the search bar.
// They share the search bar's #425a70 fill and stack flush with no gap.
const HeaderNavButton = ({
  icon,
  label,
  active,
  onClick,
  position = 'middle'
}) => {
  const [hover, setHover] = useState(false);
  const radius = position === 'left' ? '4px 0 0 4px' : position === 'right' ? '0 4px 4px 0' : '0';
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    title: label,
    "aria-label": label,
    style: {
      height: 32,
      width: 39,
      padding: 0,
      border: 'none',
      borderRight: '1px solid rgba(255,255,255,.10)',
      background: active ? '#5a7388' : hover ? '#506a80' : '#425a70',
      borderRadius: radius,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background 100ms'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 20,
    color: "#fff"
  }));
};
const Header = ({
  companyCode = 'lcs-rmexpress',
  user = {
    initials: 'MR'
  },
  onSearch,
  onMega,
  onFavorites,
  onReports,
  active
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    height: 48,
    background: '#13314c',
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    gap: 16,
    color: '#fff',
    fontFamily: 'Roboto',
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: '#fff',
    minWidth: 175
  }
}, /*#__PURE__*/React.createElement(RentManagerMark, {
  size: 28
}), /*#__PURE__*/React.createElement(RentManagerWordmark, {
  height: 20
})), /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center'
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    height: 32
  }
}, /*#__PURE__*/React.createElement(HeaderNavButton, {
  icon: "menu",
  label: "Mega Menu",
  position: "left",
  onClick: onMega,
  active: active === 'mega'
}), /*#__PURE__*/React.createElement(HeaderNavButton, {
  icon: "list_alt",
  label: "Reports",
  position: "middle",
  onClick: onReports,
  active: active === 'reports'
}), /*#__PURE__*/React.createElement(HeaderNavButton, {
  icon: "star",
  label: "Favorites",
  position: "middle",
  onClick: onFavorites,
  active: active === 'favorites'
}), /*#__PURE__*/React.createElement("div", {
  style: {
    width: 1,
    height: 32,
    background: 'rgba(255,255,255,.10)'
  }
}), /*#__PURE__*/React.createElement("div", {
  style: {
    width: 454,
    height: 32,
    background: '#425a70',
    borderRadius: '0 4px 4px 0',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 8px'
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "search",
  size: 20,
  color: "rgba(255,255,255,.85)"
}), /*#__PURE__*/React.createElement("input", {
  type: "text",
  placeholder: "Command Launch",
  onChange: e => onSearch && onSearch(e.target.value),
  style: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#fff',
    fontStyle: 'italic'
  }
})))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 32,
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    textAlign: 'left',
    fontSize: 12,
    lineHeight: '14px',
    color: '#fff'
  }
}, /*#__PURE__*/React.createElement("div", null, "Company Code"), /*#__PURE__*/React.createElement("div", {
  style: {
    marginTop: 2
  }
}, companyCode)), /*#__PURE__*/React.createElement("div", {
  title: "Notifications",
  style: {
    position: 'relative',
    cursor: 'pointer',
    color: '#fff'
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: "notifications",
  size: 20,
  color: "#fff"
})), /*#__PURE__*/React.createElement(Avatar, {
  initials: user.initials
})));

// ---------- Context Bar ----------
const ContextBar = ({
  title,
  count,
  leadingIcon = 'view_list',
  actions,
  kind = 'register'
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    height: 40,
    background: kind === 'register' ? '#008dd5' : '#13314c',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    color: '#fff',
    fontFamily: 'Roboto',
    flexShrink: 0
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1
  }
}, /*#__PURE__*/React.createElement(Icon, {
  name: leadingIcon,
  size: 20,
  color: "#fff"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    fontWeight: 500,
    fontSize: 14
  }
}, title), count != null && /*#__PURE__*/React.createElement("span", {
  style: {
    fontFamily: 'Roboto Mono',
    fontSize: 12,
    opacity: .85,
    background: 'rgba(255,255,255,.18)',
    padding: '2px 8px',
    borderRadius: 10
  }
}, count.toLocaleString())), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 4
  }
}, actions));
const ContextIconButton = ({
  icon,
  label,
  onClick
}) => {
  const [hover, setHover] = useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    title: label,
    "aria-label": label,
    style: {
      height: 28,
      padding: '0 8px',
      border: 'none',
      background: hover ? 'rgba(255,255,255,.18)' : 'transparent',
      color: '#fff',
      borderRadius: 4,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13,
      fontFamily: 'Roboto'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: 18
  }), label);
};

// ---------- Page Header (with vertical-divider line in figma; here a clean horizontal divider) ----------
const PageHeader = ({
  title,
  subtitle,
  breadcrumbs,
  status,
  actions
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    padding: '20px 24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  }
}, breadcrumbs && /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'Roboto',
    fontSize: 12,
    color: '#666'
  }
}, breadcrumbs.map((b, i) => /*#__PURE__*/React.createElement(React.Fragment, {
  key: i
}, i > 0 && /*#__PURE__*/React.createElement(Icon, {
  name: "chevron_right",
  size: 14,
  color: "#b3b3b3"
}), /*#__PURE__*/React.createElement("span", {
  style: {
    color: i === breadcrumbs.length - 1 ? '#13314c' : '#008dd5',
    cursor: i === breadcrumbs.length - 1 ? 'default' : 'pointer'
  }
}, b)))), /*#__PURE__*/React.createElement("div", {
  style: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 16
  }
}, /*#__PURE__*/React.createElement("div", {
  style: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  }
}, /*#__PURE__*/React.createElement("h1", {
  style: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: 28,
    lineHeight: '36px',
    color: '#13314c',
    margin: 0
  }
}, title), subtitle && /*#__PURE__*/React.createElement("span", {
  style: {
    fontSize: 13,
    color: '#666'
  }
}, subtitle)), status, actions), /*#__PURE__*/React.createElement("div", {
  style: {
    height: 1,
    background: '#cedbe7',
    marginTop: 12
  }
}));

// ---------- Mega Menu Overlay ----------
const MegaMenu = ({
  open,
  onClose,
  modules,
  onPick
}) => {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'fixed',
      left: 0,
      right: 0,
      top: 48,
      bottom: 0,
      background: 'rgba(19,49,76,.20)',
      zIndex: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      margin: '8px 16px 0',
      background: '#fff',
      border: '1px solid #cedbe7',
      borderRadius: 8,
      boxShadow: '0 3px 6px rgba(0,0,0,.10)',
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 0,
      padding: 0,
      overflow: 'hidden'
    }
  }, modules.map((m, i) => /*#__PURE__*/React.createElement("button", {
    key: m.name,
    onClick: () => {
      onPick(m);
      onClose();
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '20px 24px',
      gap: 12,
      border: 'none',
      borderRight: i % 4 !== 3 ? '1px solid #ebf1f5' : 'none',
      borderBottom: i < modules.length - 4 ? '1px solid #ebf1f5' : 'none',
      background: '#fff',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'background 100ms'
    },
    onMouseEnter: e => e.currentTarget.style.background = '#f5f8fa',
    onMouseLeave: e => e.currentTarget.style.background = '#fff'
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 8,
      background: m.color + '22',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: m.icon,
    size: 24,
    color: m.color,
    fill: 1
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'Roboto',
      fontWeight: 500,
      fontSize: 16,
      color: '#13314c'
    }
  }, m.name), /*#__PURE__*/React.createElement("ul", {
    style: {
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, m.items.map(it => /*#__PURE__*/React.createElement("li", {
    key: it,
    style: {
      fontSize: 13,
      color: '#666',
      lineHeight: '18px'
    }
  }, it))))))));
};

// ---------- Card / Table / Dialog / Toast (kept) ----------
const Card = ({
  title,
  headerActions,
  children,
  padding = 16,
  style
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    background: '#fff',
    border: '1px solid #cedbe7',
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
    ...style
  }
}, (title || headerActions) && /*#__PURE__*/React.createElement("div", {
  style: {
    padding: '12px 16px',
    borderBottom: '1px solid #cedbe7',
    display: 'flex',
    alignItems: 'center',
    gap: 12
  }
}, /*#__PURE__*/React.createElement("h3", {
  style: {
    fontFamily: 'Roboto',
    fontWeight: 500,
    fontSize: 14,
    color: '#13314c',
    margin: 0,
    flex: 1
  }
}, title), headerActions), /*#__PURE__*/React.createElement("div", {
  style: {
    padding,
    flex: 1
  }
}, children));
const Table = ({
  columns,
  rows,
  onRowClick,
  selectedKey,
  getKey
}) => /*#__PURE__*/React.createElement("div", {
  style: {
    width: '100%',
    overflow: 'auto'
  }
}, /*#__PURE__*/React.createElement("table", {
  style: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'Roboto',
    fontSize: 14
  }
}, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
  style: {
    background: '#f5f8fa',
    borderBottom: '1px solid #cedbe7'
  }
}, columns.map((c, i) => /*#__PURE__*/React.createElement("th", {
  key: i,
  style: {
    textAlign: c.align || 'left',
    padding: '10px 16px',
    color: '#666',
    fontWeight: 500,
    fontSize: 12,
    letterSpacing: '.04em',
    textTransform: 'uppercase'
  }
}, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, ri) => {
  const k = getKey ? getKey(r) : ri;
  const sel = selectedKey === k;
  return /*#__PURE__*/React.createElement("tr", {
    key: ri,
    onClick: () => onRowClick && onRowClick(r),
    style: {
      borderBottom: '1px solid #ebf1f5',
      cursor: onRowClick ? 'pointer' : 'default',
      background: sel ? '#ebf1f5' : 'transparent'
    },
    onMouseEnter: e => {
      if (!sel) e.currentTarget.style.background = '#f5f8fa';
    },
    onMouseLeave: e => {
      if (!sel) e.currentTarget.style.background = 'transparent';
    }
  }, columns.map((c, ci) => /*#__PURE__*/React.createElement("td", {
    key: ci,
    style: {
      padding: '10px 16px',
      color: c.color || '#424e5b',
      textAlign: c.align || 'left'
    }
  }, c.render ? c.render(r) : r[c.key])));
}))));
const Dialog = ({
  open,
  title,
  children,
  onClose,
  primaryAction,
  secondaryAction,
  width = 480
}) => {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(19,49,76,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    onClick: onClose
  }, /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      width,
      background: '#fff',
      borderRadius: 5,
      boxShadow: '0 3px 6px rgba(0,0,0,0.10)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 24px',
      borderBottom: '1px solid #cedbe7',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      flex: 1,
      margin: 0,
      fontFamily: 'Roboto',
      fontSize: 18,
      fontWeight: 500,
      color: '#13314c'
    }
  }, title), /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 20,
    color: "#666",
    style: {
      cursor: 'pointer'
    },
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 24
    }
  }, children), (primaryAction || secondaryAction) && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 24px',
      borderTop: '1px solid #cedbe7',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 12,
      background: '#f5f8fa'
    }
  }, secondaryAction, primaryAction)));
};
const Toast = ({
  kind = 'success',
  icon,
  children,
  onDismiss
}) => {
  const map = {
    success: {
      bg: '#e2f1da',
      icon: 'check_circle',
      color: '#3f7e1f'
    },
    error: {
      bg: '#fde8e9',
      icon: 'error',
      color: '#a8232a'
    },
    warning: {
      bg: '#fdebd9',
      icon: 'warning',
      color: '#a85e0e'
    },
    info: {
      bg: '#ebf1f5',
      icon: 'info',
      color: '#0071aa'
    }
  };
  const c = map[kind];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 4,
      background: c.bg,
      color: c.color,
      fontFamily: 'Roboto',
      fontSize: 14,
      boxShadow: '0 3px 6px rgba(0,0,0,0.10)',
      border: '1px solid ' + c.color + '33'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon || c.icon,
    size: 20,
    color: c.color,
    fill: 1
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, children), onDismiss && /*#__PURE__*/React.createElement(Icon, {
    name: "close",
    size: 18,
    color: c.color,
    style: {
      cursor: 'pointer'
    },
    onClick: onDismiss
  }));
};
Object.assign(window, {
  RMX: {
    Icon,
    Avatar,
    Button,
    Field,
    Badge,
    Checkbox,
    Header,
    ContextBar,
    ContextIconButton,
    PageHeader,
    MegaMenu,
    Card,
    Table,
    Dialog,
    Toast,
    RentManagerMark,
    RentManagerWordmark
  }
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/rentmanager-app/components.jsx", error: String((e && e.message) || e) }); }

})();
