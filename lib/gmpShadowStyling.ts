export function setupShadowDOMStyling() {
  if (!(window as any).gmpShadowPatched) {
    const originalAttachShadow = Element.prototype.attachShadow;

    Element.prototype.attachShadow = function (init) {
      if (this.localName === "gmp-place-autocomplete") {
        const shadow = originalAttachShadow.call(this, {
          ...init,
          mode: "open",
        });

        const style = document.createElement("style");
        style.textContent = `

          :host {
            border-radius: 6px !important;
          }

          /* =========================
             Input Styling
          ========================= */
          .input-container {
            border: 2px solid #00000059 !important;
            border-radius: 6px !important;
            background-color: white !important;
      
          }

          input {
            background: transparent !important;
            color: #000 !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            border: none !important;
            outline: none !important;
            
          }

          .input-container:has(input:focus) {
            border: 2px solid #166534 !important;
          }

          input::placeholder {
            color: #6B7280 !important;
          }

          .focus-ring {
            display: none !important;
          }

          /* =========================
             Dropdown Container
          ========================= */
          .dropdown {
            background: white !important;
            border: 1px solid #E5E7EB !important;
            border-radius: 8px !important;
            box-shadow: 0 10px 20px rgba(22,101,52,0.25) !important;
          }

          .dropdown ul {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* =========================
             LI RESET (IMPORTANT)
          ========================= */
          .dropdown ul li {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            outline: none !important;
          }

          .dropdown ul li:focus-visible {
            outline: none !important;
          }

          /* =========================
             Row Layout
          ========================= */
          .place-autocomplete-element-row {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            box-sizing: border-box !important;
            padding: 10px 12px !important;
          }

          /* =========================
             Default Text & Icons (BLACK)
          ========================= */
          .place-autocomplete-element-place-name,
          .place-autocomplete-element-place-details,
          .place-autocomplete-element-place-result--matched {
            color: #000 !important;
            -webkit-text-fill-color: #000 !important;
            opacity: 1 !important;
            
          }

          .place-autocomplete-element-prediction-item-icon,
          .place-autocomplete-element-prediction-item-icon * {
            fill: #000 !important;
            stroke: #000 !important;
          }

          /* =========================
             LI Hover / Active (THE FIX)
          ========================= */
          .dropdown ul li:hover,
          .dropdown ul li:focus,
          .dropdown ul li:active {
            background-color: #166534 !important;
            color: #fff !important;
            cursor: pointer !important;
          }

          /* Force ALL children white */
          .dropdown ul li:hover *,
          .dropdown ul li:focus *,
          .dropdown ul li:active * {
            color: #fff !important;
            -webkit-text-fill-color: #fff !important;
            fill: #fff !important;
            stroke: #fff !important;
          }

          /* =========================
             Icons (Search / Clear)
          ========================= */
          .autocomplete-icon svg,
          .autocomplete-icon svg * {
            fill: #000 !important;
            stroke: #000 !important;
          }

          .clear-button svg,
          .clear-button svg * {
            fill: #000 !important;
            stroke: #000 !important;
          }

          .clear-button:hover {
            background-color: #166534 !important;
            border-radius: 50% !important;
          }

          .clear-button:hover svg,
          .clear-button:hover svg * {
            fill: #fff !important;
            stroke: #fff !important;
          }
        `;

        shadow.appendChild(style);
        return shadow;
      }

      return originalAttachShadow.call(this, init);
    };

    (window as any).gmpShadowPatched = true;
  }
}
