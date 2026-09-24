/* ============================================================
   RMX Mega Menu. Part of the prototype foundation: every screen gets it,
   the same way every screen gets rmx.css and app.js.

   Built from the real Figma frame (RMX-Pages 5XEzI94nmZsWE7rQQ7OIHP, node
   4077:83115) and trued up against that frame's own SVG export. It is
   injected by script rather than written into a screen's markup because the
   app bar is on every screen, so its menu icon has to work on every screen.
   Emma's call, 2026-09-10: "it should always be clickable".

   templates/screen.html already links it, so a scaffolded screen needs
   nothing. A prototype that predates 4.2.0 gets both files, both tags and the
   button rewired by check.mjs --fix -- there is no manual step.
   (Tags are not written out here on purpose: this file is inlined into every
   published screen, and a literal link tag in a comment shows up in any search
   for un-inlined assets.)

   It wires itself to any button carrying [data-rmx-megamenu] or
   aria-label="Mega Menu", so a screen only has to have the app bar.

   NOTHING IN THIS MENU LINKS ANYWHERE. Not an item, not a header tab, not a
   footer link. The seven categories carry the real Express structure,
   transcribed from the frame, so the menu reads as the real thing -- but it
   is navigation furniture, not navigation. Clicking any of it does nothing,
   the same as any other data-rmx-todo affordance.

   If a prototype genuinely wants one entry to go somewhere it has built,
   give that item an object instead of a string in the prototype's own copy --
   { label: 'Tenants', href: 'tenants.html' } -- and note it in PROTOTYPE.md.
   Never point an item at a screen that does not exist: a menu of 404s reads
   as a broken prototype rather than an unfinished one.

   Everything the menu draws ships in here: the overlay markup, the seven
   categories' real content, and its own mm-* icon sprite. The sprite is
   prefixed so the menu never depends on, or collides with, whichever glyphs
   a host screen happens to carry, the four tab icons and the brand mark are
   harvested from the library, the rest are the canonical core glyphs.
   ============================================================ */
(function () {
  'use strict';

  /* No path-resolution helper here on purpose. Nothing in this menu links
     anywhere, so there is nothing to resolve. The previous version carried a
     document.currentScript / new URL() dance to make cross-screen hrefs work
     at two different depths and on Pages, and it threw when the file was
     pasted inline rather than linked, which silently killed the whole menu.
     Removed with the links themselves, 2026-09-23. */

  var SPRITE = '<symbol id="mm-workspace" viewBox="0 0 20 20" fill="currentColor" data-figma="Express Icons/Workspace" data-key="c831d806267e70f9844689ae5cbe73b8724d6bbe"><path d="M7.60041 16.8888L5.22443 11.0837L0 8.445L5.22443 5.805L7.60041 0L9.97525 5.805L15.1997 8.44375L9.97525 11.0837L7.60041 16.8888ZM16.1998 20L15.0253 17.0837L12.4007 15.7788L15.0253 14.445L16.1998 11.555L17.4002 14.4438L20 15.7775L17.4002 17.0825L16.1998 20Z"/></symbol>' +
    '<symbol id="mm-dashboard" viewBox="0 0 20 20" fill="currentColor" data-figma="Express Icons/dashboard" data-key="0671a2243610fc76ebf6b1afaacdc9dda5a17b9a"><path d="M9.96576 0.134375C4.49638 0.134375 0.0626327 4.56875 0.0626327 10.0375C0.0626327 15.5062 4.49701 19.9406 9.96576 19.9406C15.4351 19.9406 19.8689 15.5062 19.8689 10.0375C19.8689 4.56875 15.4345 0.134375 9.96576 0.134375ZM9.96576 18.0719C5.52763 18.0719 1.93013 14.4744 1.93013 10.0363C1.93013 5.59813 5.52763 2.00063 9.96576 2.00063C9.96888 2.00063 9.97263 2.00063 9.97638 2.00063C11.6608 2.00063 13.2233 2.52125 14.5114 3.41125C15.1345 3.84188 15.6939 4.35812 16.1733 4.94187C17.3189 6.33 18.0064 8.11 18.0064 10.05C18.0064 14.4856 14.4108 18.0819 9.97576 18.0819C9.97263 18.0819 9.96888 18.0819 9.96576 18.0819V18.0719ZM10.4533 13.2181C10.3714 13.2181 10.2914 13.2238 10.2126 13.235L9.96576 12.6094L8.62826 9.44375C8.55576 9.27312 8.38888 9.15562 8.19576 9.15562C7.93638 9.15562 7.72638 9.36562 7.72638 9.625C7.72638 9.69062 7.73951 9.7525 7.76388 9.80937L9.37576 13.6C8.96513 13.9269 8.70388 14.4269 8.70388 14.9875C8.70388 15.9644 9.49576 16.7556 10.4733 16.7556C11.4508 16.7556 12.2414 15.9637 12.2414 14.9875C12.2414 14.0106 11.4495 13.2181 10.4733 13.2181H10.4533ZM9.96576 4.375H9.94076C7.44076 4.375 5.21576 5.9375 3.92826 8.28437H5.68763C6.73076 6.80937 8.25326 5.8775 9.94326 5.8775H9.96826C11.6501 5.8775 13.1589 6.815 14.1964 8.28437H15.9558C14.6714 5.9375 12.4689 4.375 9.96576 4.375Z"/></symbol>' +
    '<symbol id="mm-admin" viewBox="0 0 20 20" fill="currentColor" data-figma="Express Icons/Admin" data-key="f4bb3a5338ece9c1b2af04936161b14b4cba525c"><path d="M14.7309 15.2323C14.96 15.2353 15.1871 15.1944 15.3975 15.1123C15.6078 15.0302 15.7965 14.9088 15.9513 14.7561C16.1131 14.6079 16.2409 14.4322 16.3272 14.2391C16.4136 14.046 16.4568 13.8394 16.4544 13.6311C16.4553 13.4262 16.4113 13.2231 16.325 13.0337C16.2388 12.8442 16.1118 12.672 15.9516 12.5271C15.7914 12.3822 15.6011 12.2674 15.3915 12.1894C15.182 12.1114 14.9575 12.0716 14.7309 12.0724C14.5007 12.0702 14.2722 12.1093 14.0587 12.1874C13.8452 12.2655 13.6509 12.3811 13.4871 12.5274C13.3182 12.6674 13.184 12.8381 13.0932 13.0283C13.0025 13.2185 12.9573 13.424 12.9605 13.6311C12.967 14.0543 13.1557 14.4585 13.4866 14.7578C13.8175 15.0571 14.2644 15.2278 14.7323 15.2336L14.7309 15.2323ZM14.6922 18.3747C15.2752 18.3826 15.8515 18.262 16.3714 18.0235C16.8772 17.7849 17.3141 17.4424 17.6471 17.0235C17.1907 16.7979 16.707 16.6209 16.2056 16.496C15.717 16.3778 15.2132 16.3185 14.7074 16.3198C14.1967 16.3191 13.688 16.3783 13.1941 16.496C12.6949 16.6164 12.2148 16.7936 11.765 17.0235C12.0952 17.44 12.527 17.7821 13.0269 18.0235C13.5414 18.2631 14.1136 18.3837 14.6922 18.3747ZM14.7752 19.9997C13.4004 19.9922 12.0842 19.4958 11.1108 18.6178C10.1374 17.7398 9.58504 16.5506 9.57309 15.3073C9.56099 14.684 9.68957 14.065 9.95096 13.4882C10.2124 12.9113 10.6011 12.3888 11.0934 11.9524C11.5757 11.5129 12.1495 11.1641 12.7817 10.926C13.4138 10.688 14.0918 10.5654 14.7765 10.5654C15.4613 10.5654 16.1393 10.688 16.7714 10.926C17.4035 11.1641 17.9773 11.5129 18.4597 11.9524C18.9567 12.3865 19.3498 12.9082 19.6146 13.4853C19.8795 14.0624 20.0104 14.6826 19.9994 15.3073C20.0055 15.9233 19.8721 16.5339 19.6073 17.1014C19.3425 17.669 18.9519 18.1814 18.4597 18.6072C17.9831 19.0544 17.4103 19.4086 16.7767 19.648C16.143 19.8875 15.4619 20.0072 14.7752 19.9997ZM8.87929 19.9247H8.67198C8.60133 19.9194 8.53218 19.9033 8.46744 19.8772C6.02803 19.1822 3.91661 17.7678 2.47068 15.8598C0.834427 13.8469 -0.0325338 11.4069 0.000933802 8.90878V3.96519C-0.00429364 3.65195 0.101268 3.34539 0.302223 3.09022C0.495738 2.83798 0.767423 2.64315 1.08309 2.53024L8.2933 0.100314C8.66758 -0.0334381 9.0841 -0.0334381 9.45838 0.100314L16.6727 2.53399C16.9884 2.6469 17.2601 2.84173 17.4536 3.09397C17.6546 3.34914 17.7601 3.6557 17.7549 3.96894V9.68625C17.4864 9.56532 17.2094 9.46052 16.9257 9.37251C16.6563 9.28636 16.3787 9.22317 16.0964 9.18377V3.96519L8.87929 1.55652L1.65941 3.96519V8.90878C1.64893 10.108 1.88319 11.2988 2.35044 12.4212C2.76676 13.4371 3.34959 14.3906 4.0794 15.2498C4.74015 16.0247 5.52559 16.7055 6.40955 17.2698C7.16619 17.7612 7.99824 18.1499 8.87929 18.4235C9.01935 18.6642 9.18655 18.8913 9.37822 19.1009C9.55119 19.3021 9.73571 19.4948 9.93104 19.6784C9.74751 19.7558 9.55701 19.819 9.36163 19.8672C9.20418 19.9047 9.04211 19.924 8.87929 19.9247Z"/></symbol>' +
    '<symbol id="mm-map" viewBox="0 0 20 20" fill="currentColor" data-figma="Express Icons/map" data-key="f5423de78dc4018c3a71c0b9672420b97c9fca1e"><path d="M13.4 18.8L7.4 17L3.575 18.275C3.19167 18.4083 2.83333 18.3583 2.5 18.125C2.16667 17.8917 2 17.5583 2 17.125V4.675C2 4.40833 2.07917 4.17083 2.2375 3.9625C2.39583 3.75417 2.59167 3.60833 2.825 3.525L7.4 2L13.4 3.8L17.225 2.525C17.6083 2.35833 17.9667 2.4 18.3 2.65C18.6333 2.9 18.8 3.24167 18.8 3.675V16.125C18.8 16.3917 18.725 16.6333 18.575 16.85C18.425 17.0667 18.225 17.2083 17.975 17.275L13.4 18.8ZM12.5 16.65V5.4L8.3 4.15V15.4L12.5 16.65ZM14.3 16.6L17 15.7V4.5L14.3 5.4V16.6ZM3.8 16.3L6.5 15.4V4.2L3.8 5.1V16.3Z"/></symbol>' +
    '<symbol id="mm-brand" viewBox="0 0 40 40" data-figma="Express Icons/Admin Menu" data-node="10151:6181"><path d="M19.09 3.07375L33.6912 12.9338H38.18L31.6413 8.52V3.93H24.8463L19.09 0.04375L13.3337 3.93H6.535V8.52L0 12.9338H4.485L19.09 3.07375Z" fill="#3776BC"/><path d="M24.02 31.7038C23.965 31.5675 23.9312 31.4075 23.9287 31.24V29.3462C23.9287 28.65 24.4938 28.085 25.19 28.085H27.0837C27.78 28.085 28.345 28.65 28.345 29.3462V29.5013C29.525 28.8113 30.645 28.0913 31.685 27.3463V13.1513H6.535V33.7963C9.92625 35.7225 16.7837 34.96 24.02 31.7012V31.7038ZM23.9287 16.8763C23.9375 16.1863 24.4988 15.63 25.19 15.63H27.0837C27.775 15.63 28.3375 16.1862 28.345 16.875V18.7688C28.345 19.465 27.78 20.03 27.0837 20.03H25.19C24.4938 20.03 23.9287 19.465 23.9287 18.7688V16.8763ZM23.9287 23.1237C23.9287 22.4275 24.4938 21.8625 25.19 21.8625H27.0837C27.78 21.8625 28.345 22.4275 28.345 23.1237V25.0175C28.345 25.7137 27.78 26.2788 27.0837 26.2788H25.19C24.4938 26.2788 23.9287 25.7137 23.9287 25.0175V23.1237ZM16.9038 16.8688C16.9125 16.1838 17.465 15.6325 18.1488 15.6225H20.0425C20.7337 15.6225 21.2962 16.1788 21.3037 16.8675V18.7613C21.3037 19.4575 20.7387 20.0225 20.0425 20.0225H18.1488C17.4588 20.0138 16.9025 19.4525 16.9025 18.7613L16.9038 16.8688ZM16.9038 23.1137C16.9038 22.4225 17.46 21.86 18.1488 21.8525H20.0425C20.7387 21.8525 21.3037 22.4175 21.3037 23.1137V25.0075C21.3037 25.7038 20.7387 26.2687 20.0425 26.2687H18.1488C17.4588 26.26 16.9025 25.6988 16.9025 25.0075L16.9038 23.1137ZM16.9038 29.355C16.9038 28.6637 17.46 28.1013 18.1488 28.0938H20.0425C20.7387 28.0938 21.3037 28.6587 21.3037 29.355V31.2487C21.2937 31.9375 20.7325 32.4925 20.0425 32.4925H18.1488C17.465 32.4837 16.9138 31.9325 16.9025 31.2512L16.9038 29.355ZM9.88125 16.8688C9.89 16.1788 10.4512 15.6225 11.1425 15.6225H13.0363C13.7213 15.6238 14.2762 16.1813 14.2762 16.8663V16.87V18.7637C14.2762 18.7687 14.2762 18.775 14.2762 18.7825C14.2762 19.4675 13.7213 20.0238 13.0363 20.0263H11.1425C10.4462 20.0263 9.88125 19.4613 9.88125 18.765V16.8688ZM9.88125 23.1137C9.88125 22.4175 10.4462 21.8525 11.1425 21.8525H13.0363C13.7225 21.8638 14.2762 22.4237 14.2762 23.1137V25.0075C14.2762 25.6963 13.725 26.2562 13.0375 26.2687H11.1438C10.4475 26.2687 9.8825 25.7038 9.8825 25.0075L9.88125 23.1137ZM9.88125 29.355C9.88125 28.6587 10.4462 28.0938 11.1425 28.0938H13.0363C13.7213 28.095 14.2762 28.65 14.2762 29.3375C14.2762 29.3437 14.2762 29.3512 14.2762 29.3575V31.25C14.2662 31.9312 13.7175 32.48 13.0375 32.4938H11.1438C10.4538 32.4938 9.8925 31.94 9.8825 31.2525L9.88125 29.355Z" fill="#F58220"/><path d="M25.9538 32.005C16.2175 37.0838 6.52875 37.765 4.315 33.5162C3.68375 32.315 3.74625 30.835 4.35625 29.2263C2.19625 32.1625 1.3975 34.9675 2.4625 37.0225C4.79375 41.4863 14.9788 40.7725 25.2113 35.4463C34.8875 30.4 41.135 23.0175 39.8163 18.4563C38.82 22.6575 33.4838 28.0675 25.9538 32.005Z" fill="#3776BC"/><path d="M6.535 24.9113C7.665 24.8763 8.775 24.8263 9.88125 24.76V23.1137C9.88125 22.4175 10.4462 21.8525 11.1425 21.8525H13.0363C13.7225 21.8638 14.2762 22.4237 14.2762 23.1137V24.435C15.1671 24.3525 16.0517 24.2592 16.93 24.155V23.1137C16.93 22.4225 17.4863 21.86 18.175 21.8525H20.0688C20.765 21.8525 21.33 22.4175 21.33 23.1137V23.545C22.2237 23.4 23.1112 23.2513 23.9862 23.0888C24.0062 22.415 24.5525 21.875 25.2275 21.865H27.1213C27.4775 21.8688 27.7975 22.0187 28.0262 22.2587C29.2875 21.9725 30.5075 21.6625 31.7075 21.3325V13.1588H6.53625L6.535 24.9113ZM23.9287 16.8688C23.9375 16.1788 24.4988 15.6225 25.19 15.6225H27.0837C27.775 15.6225 28.3375 16.1788 28.345 16.8675V18.7613C28.345 19.4575 27.78 20.0225 27.0837 20.0225H25.19C24.4938 20.0225 23.9287 19.4575 23.9287 18.7613V16.8688ZM16.9038 16.8688C16.9125 16.1838 17.465 15.6325 18.1488 15.6225H20.0425C20.7337 15.6225 21.2962 16.1788 21.3037 16.8675V18.7613C21.3037 19.4575 20.7387 20.0225 20.0425 20.0225H18.1488C17.4588 20.0138 16.9025 19.4525 16.9025 18.7613L16.9038 16.8688ZM9.88125 16.8688C9.89 16.1788 10.4512 15.6225 11.1425 15.6225H13.0363C13.7213 15.6238 14.2762 16.1813 14.2762 16.8663V16.87V18.7637C14.2762 18.7687 14.2762 18.775 14.2762 18.7825C14.2762 19.4675 13.7213 20.0238 13.0363 20.0263H11.1425C10.4462 20.0263 9.88125 19.4613 9.88125 18.765V16.8688Z" fill="#F79B4D"/></symbol>' +
    '<symbol id="mm-close" viewBox="0 0 20 20" fill="currentColor"><path d="M15.8334 5.34166L14.6584 4.16666L10 8.82499L5.34169 4.16666L4.16669 5.34166L8.82502 9.99999L4.16669 14.6583L5.34169 15.8333L10 11.175L14.6584 15.8333L15.8334 14.6583L11.175 9.99999L15.8334 5.34166Z"/></symbol>' +
    '<symbol id="mm-search" viewBox="0 0 20 20" fill="currentColor"><path d="M12.9167 11.6667H12.2583L12.025 11.4417C13.025 10.275 13.5417 8.68334 13.2583 6.99167C12.8667 4.675 10.9333 2.825 8.59999 2.54167C5.07499 2.10834 2.10832 5.075 2.54165 8.6C2.82499 10.9333 4.67499 12.8667 6.99165 13.2583C8.68332 13.5417 10.275 13.025 11.4417 12.025L11.6667 12.2583V12.9167L15.2083 16.4583C15.55 16.8 16.1083 16.8 16.45 16.4583C16.7917 16.1167 16.7917 15.5583 16.45 15.2167L12.9167 11.6667ZM7.91665 11.6667C5.84165 11.6667 4.16665 9.99167 4.16665 7.91667C4.16665 5.84167 5.84165 4.16667 7.91665 4.16667C9.99165 4.16667 11.6667 5.84167 11.6667 7.91667C11.6667 9.99167 9.99165 11.6667 7.91665 11.6667Z"/></symbol>' +
    '<symbol id="mm-help" viewBox="0 0 20 20" fill="currentColor"><path d="M9.16669 15H10.8334V13.3334H9.16669V15ZM10 1.66669C5.40002 1.66669 1.66669 5.40002 1.66669 10C1.66669 14.6 5.40002 18.3334 10 18.3334C14.6 18.3334 18.3334 14.6 18.3334 10C18.3334 5.40002 14.6 1.66669 10 1.66669ZM10 16.6667C6.32502 16.6667 3.33335 13.675 3.33335 10C3.33335 6.32502 6.32502 3.33335 10 3.33335C13.675 3.33335 16.6667 6.32502 16.6667 10C16.6667 13.675 13.675 16.6667 10 16.6667ZM10 5.00002C8.15835 5.00002 6.66669 6.49169 6.66669 8.33335H8.33335C8.33335 7.41669 9.08335 6.66669 10 6.66669C10.9167 6.66669 11.6667 7.41669 11.6667 8.33335C11.6667 10 9.16669 9.79169 9.16669 12.5H10.8334C10.8334 10.625 13.3334 10.4167 13.3334 8.33335C13.3334 6.49169 11.8417 5.00002 10 5.00002Z"/></symbol>' +
    '<symbol id="mm-settings" viewBox="0 0 20 20" fill="currentColor"><path d="M15.95 10.7833C15.9833 10.5333 16 10.275 16 10C16 9.73333 15.9833 9.46667 15.9417 9.21667L17.6333 7.9C17.7833 7.78333 17.825 7.55833 17.7333 7.39167L16.1333 4.625C16.0333 4.44167 15.825 4.38333 15.6417 4.44167L13.65 5.24167C13.2333 4.925 12.7917 4.65833 12.3 4.45833L12 2.34167C11.9667 2.14167 11.8 2 11.6 2H8.39999C8.19999 2 8.04166 2.14167 8.00832 2.34167L7.70832 4.45833C7.21666 4.65833 6.76666 4.93333 6.35832 5.24167L4.36666 4.44167C4.18332 4.375 3.97499 4.44167 3.87499 4.625L2.28332 7.39167C2.18332 7.56667 2.21666 7.78333 2.38332 7.9L4.07499 9.21667C4.03332 9.46667 3.99999 9.74167 3.99999 10C3.99999 10.2583 4.01666 10.5333 4.05832 10.7833L2.36666 12.1C2.21666 12.2167 2.17499 12.4417 2.26666 12.6083L3.86666 15.375C3.96666 15.5583 4.17499 15.6167 4.35832 15.5583L6.34999 14.7583C6.76666 15.075 7.20832 15.3417 7.69999 15.5417L7.99999 17.6583C8.04166 17.8583 8.19999 18 8.39999 18H11.6C11.8 18 11.9667 17.8583 11.9917 17.6583L12.2917 15.5417C12.7833 15.3417 13.2333 15.075 13.6417 14.7583L15.6333 15.5583C15.8167 15.625 16.025 15.5583 16.125 15.375L17.725 12.6083C17.825 12.425 17.7833 12.2167 17.625 12.1L15.95 10.7833ZM9.99999 13C8.34999 13 6.99999 11.65 6.99999 10C6.99999 8.35 8.34999 7 9.99999 7C11.65 7 13 8.35 13 10C13 11.65 11.65 13 9.99999 13Z"/></symbol>' +
    '<symbol id="mm-reports" viewBox="0 0 20 20" fill="currentColor"><path d="M12.8125 5.67188H7.18752C6.67002 5.67188 6.25002 5.25188 6.25002 4.73438C6.25002 4.21688 6.67002 3.79688 7.18752 3.79688H12.8125C13.33 3.79688 13.75 4.21688 13.75 4.73438C13.75 5.25188 13.33 5.67188 12.8125 5.67188ZM12.8125 9.90563H7.18752C6.67002 9.90563 6.25002 9.48563 6.25002 8.96813C6.25002 8.45063 6.67002 8.03063 7.18752 8.03063H12.8125C13.33 8.03063 13.75 8.45063 13.75 8.96813C13.75 9.48563 13.33 9.90563 12.8125 9.90563ZM12.8125 14.1406H7.18752C6.67002 14.1406 6.25002 13.7206 6.25002 13.2031C6.25002 12.6856 6.67002 12.2656 7.18752 12.2656H12.8125C13.33 12.2656 13.75 12.6856 13.75 13.2031C13.75 13.7206 13.33 14.1406 12.8125 14.1406ZM15.6625 20H4.33752C3.82002 20 3.40002 19.58 3.40002 19.0625V0.990631C3.40002 0.473131 3.82002 0.0531311 4.33752 0.0531311H15.6625C16.18 0.0531311 16.6 0.473131 16.6 0.990631V19.0625C16.6 19.58 16.18 20 15.6625 20ZM5.28065 18.125H14.7181V1.93438H5.28065V18.125Z"/></symbol>';

  var MARKUP = '<div class="megamenu-overlay" id="megaMenuOverlay" hidden>' +
    '  <div class="megamenu" role="dialog" aria-label="Menu">' +
    '    <div class="megamenu__header">' +
    '      <div class="megamenu__brand">' +
    '        <svg class="megamenu__brandmark" viewBox="0 0 40 40" role="img" aria-label="Rent Manager"><use href="#mm-brand"></use></svg>' +
    '        <span class="megamenu__title">Menu</span>' +
    '      </div>' +
    '      <nav class="megamenu__tabs">' +
    '        <button class="megamenu__tab" data-rmx-todo="Workspace is not built in this prototype"><svg class="rmx-icon"><use href="#mm-workspace"></use></svg>Workspace</button>' +
    '        <button class="megamenu__tab" data-rmx-todo="Dashboard is not built in this prototype"><svg class="rmx-icon"><use href="#mm-dashboard"></use></svg>Dashboard</button>' +
    '        <button class="megamenu__tab" data-rmx-todo="Administration is not built in this prototype"><svg class="rmx-icon"><use href="#mm-admin"></use></svg>Administration</button>' +
    '        <span class="megamenu__tab megamenu__tab--current"><svg class="rmx-icon"><use href="#mm-map"></use></svg>Full Menu</span>' +
    '        <button class="megamenu__tab" data-rmx-todo="Search is not built in this prototype"><svg class="rmx-icon"><use href="#mm-search"></use></svg>Search</button>' +
    '        <button class="megamenu__tab" data-rmx-todo="Help is not built in this prototype"><svg class="rmx-icon"><use href="#mm-help"></use></svg>Help</button>' +
    '      </nav>' +
    '      <button class="megamenu__close" id="megaMenuCloseBtn" aria-label="Close menu"><svg class="rmx-icon"><use href="#mm-close"></use></svg></button>' +
    '    </div>' +
    '    <div class="megamenu__body">' +
    '      <nav class="megamenu__sidebar" id="megaMenuSidebar" aria-label="Menu categories"></nav>' +
    '      <div class="megamenu__content" id="megaMenuContent"></div>' +
    '    </div>' +
    '    <div class="megamenu__footer" id="megaMenuFooter"></div>' +
    '  </div>' +
    '</div>';

  /* ---- Mega Menu ----
     Real content transcribed from the Figma frame (see the comment at the top
     of this file). Every entry is a plain string and renders inert. The object
     form { label, href } exists only so a prototype can opt one item in; none
     ship that way. */
  var MEGA_MENU_ORDER = ['rental-info', 'accounting', 'receivables', 'payables', 'owners', 'services', 'communication'];
  var MEGA_MENU = {
    'rental-info': {
      label: 'Rental Info',
      columns: [
        { title: 'General', items: ['Tenants', 'Tenant Register', 'Prospects', 'Units', 'Properties', 'Unit Types', 'Assets', 'Violations', 'Merge Prospects'] },
        { title: 'Leasing', items: ['Screenings', 'Applications', 'Application Templates', 'Renewal Increases', 'Prospect Leasing Board', 'Create Renewal Offers', 'Lease Renewal Register', 'Lease Renewal Board', 'Export Minnesota CRP'] },
        { title: 'Short Term Rentals', items: ['STR Reservations', 'Check-ins', 'Find Reservation'] },
        { title: 'Online Listing', items: ['Listings'] },
        { title: 'Bird’s Eye View (BEV)', items: ['Manage BEV Maps', 'Manage BEV Map Views'] }
      ],
      footer: [
        { icon: 'settings', label: 'Rental Info Setup' },
        { icon: 'reports', label: 'Rental Info Reports' },
        { icon: 'reports', label: 'Asset Reports' },
        { icon: 'reports', label: 'Short Term Rental Reports' }
      ]
    },
    'accounting': {
      label: 'Accounting',
      columns: [
        { title: 'General', items: ['Charge Type', 'Chart of Accounts', 'Chart Account Mapping', 'Notes', 'Jobs', 'Merge Charge Types', 'Merge GL Accounts', 'Inventory Items'] },
        { title: 'Banking', items: ['Make Deposit', 'Bank Register', 'Credit Card Register', 'Export Positive Pay', 'Bank Reconcile', 'Electronic Bank Reconciliation', 'Credit Card Reconcile', 'Electronic Credit Card Reconciliation', 'Reconciliation Changes Register', 'Reconciliation Register'] },
        { title: 'ePay', items: ['Make ePay Deposit', 'Check ePay Issues', 'Check ePay Returns', 'Resident Payout Issues'] },
        { title: 'Gross Potential Rent', items: ['Post GPR', 'GPR Posting History'] },
        { title: 'Journals', items: ['Journals', 'Memorized Journals', 'Recurring Journals', 'Post Recurring Journals', 'Post Depreciation'] }
      ],
      footer: [
        { icon: 'settings', label: 'Accounting Setup' },
        { icon: 'reports', label: 'Financial Reports' },
        { icon: 'reports', label: 'General Ledger Reports' },
        { icon: 'reports', label: 'Banking Reports' },
        { icon: 'reports', label: 'Accounting Reports' }
      ]
    },
    'receivables': {
      label: 'Receivables',
      columns: [
        { title: 'General', items: ['Invoices', 'Estimates', 'Memorized Invoices', 'Memorized Estimates', 'Post Security Deposit Interest'] },
        { title: 'Loans Receivable', items: ['Loans Receivable', 'Post Loans Receivable', 'Post Loan Receivable Late Fees', 'Export 1098', 'Export Corrected 1098', 'Export to Metro2'] },
        { title: 'Payments', items: ['Receive Payment', 'Batch Payments', 'ePay History', 'Subsidy History', 'Post Recurring ePay', 'ePay Deposit Reconciliation', 'Make Subsidy Payment', 'Scan Tenant/Prospect Checks', 'Scan Vendor/Owner Checks'] },
        { title: 'Recurring Charges', items: ['Post Recurring Charges', 'Post Late Fees', 'Modify Recurring Charges', 'Modify Market Rent'] },
        { title: 'Commercial', items: ['Non Recurring CRE', 'CAM Reconciliation', 'CAM Expense Adjustments'] }
      ],
      footer: [
        { icon: 'settings', label: 'Receivables Setup' },
        { icon: 'reports', label: 'Tenant Reports' },
        { icon: 'reports', label: 'Receivable Reports' }
      ]
    },
    'payables': {
      label: 'Payables',
      columns: [
        { title: 'General', items: ['Vendors', 'Vendor Credits', 'Purchase Orders', 'Account Balance Disbursal', 'Billable Expenses', 'Export 1099', 'Export Corrected 1099', 'Merge Vendors', 'Smart Receipts'] },
        { title: 'Checks', items: ['Checks', 'Write Checks', 'Print Checks', 'Post eChecks', 'eChecks', 'Reorder eChecks'] },
        { title: 'Bills', items: ['Bills', 'Add Bill', 'Recurring Bills', 'Pay Bills', 'Post Recurring Bills', 'Smart Bills'] },
        { title: 'AvidXchange', items: ['AvidInvoice', 'Post AvidPay'] },
        { title: 'Loans Payable', items: ['Loans Payable', 'Post Loans Payable'] }
      ],
      footer: [
        { icon: 'settings', label: 'Payables Setup' },
        { icon: 'reports', label: 'Payables Reports' }
      ]
    },
    'owners': {
      label: 'Owners',
      columns: [
        { title: 'Owners', items: ['Owners', 'Owner Prospects', 'Ownership Transfer Wizard'] },
        { title: 'Owner Payments', items: ['Owner Contributions', 'Manual Owner Pay', 'Owner Check Setups', 'Pay Owners'] },
        { title: 'Management Fees', items: ['Management Fee Templates', 'Post Management Fees'] }
      ],
      footer: [
        { icon: 'settings', label: 'Owners Setup' },
        { icon: 'reports', label: 'Owners Reports' }
      ]
    },
    'services': {
      label: 'Services',
      columns: [
        { title: 'Service Manager', items: ['Issues', 'New Issue', 'Manage Saved Lists', 'Memorized Issues', 'Recurring Issues', 'Service Tech Map', 'Checklist Templates', 'Maintenance Schedule'] },
        { title: 'Metered Utilities', items: ['Utilities', 'Post Utilities', 'File Formats', 'MU Export To File', 'MU Import From File', 'Meter Types', 'Meter Readings', 'Meter Readings Setup', 'Meter Readings Statuses', 'Post RUBS'] },
        { title: 'Inspections', items: ['Inspections', 'Inspection Templates'] },
        { title: 'Calendar', items: ['Calendar', 'Appointments', 'Tasks', 'Memorized Tasks'] },
        { title: 'Community', items: ['Community Calendars', 'Architectural Requests', 'Architectural Request Forms', 'Amenity Reservations'] },
        { title: 'Online Listing', items: ['Workflow Projects', 'Workflow Boards', 'Workflow Templates'] },
        { title: 'Make Ready', items: ['Make Ready Templates', 'Make Ready Board'] }
      ],
      footer: [
        { icon: 'settings', label: 'Service Setup' },
        { icon: 'reports', label: 'Service Reports' }
      ]
    },
    'communication': {
      label: 'Communication',
      columns: [
        { title: 'Letters', items: ['Write Letter', 'Letter Templates', 'Write Letter Batch', 'VPO Register'] },
        { title: 'Email', items: ['Send Email', 'Email Templates', 'Email Center', 'Email Signature'] },
        { title: 'Signable Documents', items: ['Blue Moon eSignatures', 'Document Packets', 'Signable Documents', 'Signable Templates'] },
        { title: 'Texting / Phone', items: ['Send Text', 'Text Templates', 'Text Messaging Center', 'rmVoIP Incoming Call History', 'rmVoIP Unlinked Calls', 'Phone Broadcast', 'Text Broadcast'] },
        { title: 'Web Chat', items: ['Manage Queues', 'My Conversations', 'Closed Conversations', 'Unlinked Conversations', 'Offline Conversations'] },
        { title: 'Surveys', items: ['Surveys'] }
      ],
      footer: [
        { icon: 'reports', label: 'Communications Reports' }
      ]
    }
  };
  var SIDEBAR_LABELS = { 'rental-info': 'Rental Info', 'accounting': 'Accounting', 'receivables': 'Receivables', 'payables': 'Payables', 'owners': 'Owners', 'services': 'Services', 'communication': 'Communication' };

  function inject() {
    if (document.getElementById('megaMenuOverlay')) return;
    var sprite = document.createElement('div');
    sprite.hidden = true;
    sprite.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg">' + SPRITE + '</svg>';
    document.body.appendChild(sprite);
    var host = document.createElement('div');
    host.innerHTML = MARKUP;
    while (host.firstChild) document.body.appendChild(host.firstChild);
  }

  /* Any screen's hamburger opens it. The button is a real affordance now, so
     a screen that still marks it data-rmx-todo gets that stripped, otherwise
     the capture-phase suppressor on My Workspace would eat the click. */
  function wireOpeners(onOpen) {
    var btns = document.querySelectorAll('[data-rmx-megamenu], #megaMenuBtn, [aria-label="Mega Menu"]');
    [].forEach.call(btns, function (b) {
      if (b.getAttribute('data-rmx-todo')) b.removeAttribute('data-rmx-todo');
      b.addEventListener('click', onOpen);
    });
  }

  function init() {
    inject();
  var megaMenuOverlay = document.getElementById('megaMenuOverlay');
  var megaMenuSidebar = document.getElementById('megaMenuSidebar');
  var megaMenuContent = document.getElementById('megaMenuContent');
  var megaMenuFooter = document.getElementById('megaMenuFooter');
  var megaMenuCat = 'rental-info';
  var megaMenuBuilt = false;

  function buildMegaMenuSidebar() {
    megaMenuSidebar.innerHTML = MEGA_MENU_ORDER.map(function (key) {
      return '<button class="megamenu__sidebar-item" data-cat="' + key + '">' + SIDEBAR_LABELS[key] + '</button>';
    }).join('');
  }

  function renderMegaMenuItem(it) {
    if (typeof it === 'object') {
      return '<a class="megamenu__item" href="' + it.href + '">' + it.label + '</a>';
    }
    return '<div class="megamenu__item" data-rmx-todo="' + it + ' is not built in this prototype">' + it + '</div>';
  }

  function renderMegaMenuCategory(key) {
    megaMenuCat = key;
    var cat = MEGA_MENU[key];
    [].slice.call(megaMenuSidebar.children).forEach(function (btn) {
      btn.classList.toggle('megamenu__sidebar-item--active', btn.getAttribute('data-cat') === key);
    });
    megaMenuContent.innerHTML = cat.columns.map(function (col) {
      return '<div class="megamenu__col"><div class="megamenu__col-title">' + col.title + '</div>' +
        col.items.map(renderMegaMenuItem).join('') + '</div>';
    }).join('');
    megaMenuContent.scrollTop = 0;
    megaMenuFooter.innerHTML = '<div class="megamenu__footer-links">' + cat.footer.map(function (f) {
      return '<div class="megamenu__footer-link" data-rmx-todo="' + f.label + ' is not built in this prototype">' +
        '<svg class="rmx-icon"><use href="#mm-' + f.icon + '"></use></svg>' + f.label + '</div>';
    }).join('') + '</div><span class="megamenu__version">Version 12.260554</span>';
  }

  function openMegaMenu() {
    if (!megaMenuBuilt) { buildMegaMenuSidebar(); megaMenuBuilt = true; }
    renderMegaMenuCategory(megaMenuCat);
    megaMenuOverlay.hidden = false;
  }

  function closeMegaMenu() {
    megaMenuOverlay.hidden = true;
  }

  wireOpeners(openMegaMenu);
  document.getElementById('megaMenuCloseBtn').addEventListener('click', closeMegaMenu);
  megaMenuOverlay.addEventListener('click', function (e) {
    if (e.target === megaMenuOverlay) { closeMegaMenu(); return; }
    var catBtn = e.target.closest ? e.target.closest('.megamenu__sidebar-item') : null;
    if (catBtn) renderMegaMenuCategory(catBtn.getAttribute('data-cat'));
  });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !megaMenuOverlay.hidden) closeMegaMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
