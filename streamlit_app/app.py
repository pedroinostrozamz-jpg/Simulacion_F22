import streamlit as st
import pandas as pd
import math
from io import BytesIO

# ─────────────────────────────────────────────
# CONFIGURACIÓN DE PÁGINA
# ─────────────────────────────────────────────
st.set_page_config(
    page_title="Simulador APV 2026",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─────────────────────────────────────────────
# ESTILOS GLOBALES
# ─────────────────────────────────────────────
st.markdown("""
<style>
    .main .block-container { padding-top: 1.5rem; padding-bottom: 2rem; }
    h1 { color: #1a3a5c; font-size: 1.4rem !important; }
    h2 { color: #1a3a5c; font-size: 1.1rem !important; border-bottom: 2px solid #e0e5ec; padding-bottom: 6px; }
    h3 { color: #2a5a8c; font-size: 0.95rem !important; }
    .metric-box {
        background: #f0f4f8;
        border: 1px solid #c8d0da;
        border-radius: 8px;
        padding: 12px 16px;
        text-align: center;
    }
    .metric-label { font-size: 0.72rem; text-transform: uppercase; color: #6a6a6a; font-weight: 600; margin-bottom: 4px; }
    .metric-value { font-size: 1.3rem; font-weight: 700; color: #1a3a5c; }
    .metric-sub   { font-size: 0.72rem; color: #8a8a8a; margin-top: 2px; }
    .green  { color: #2e7d32 !important; }
    .red    { color: #c62828 !important; }
    .gold   { color: #b8860b !important; }
    .banner {
        background: linear-gradient(90deg, #1a3a5c, #2a5a8c);
        border-radius: 8px;
        padding: 16px 20px;
        color: white;
        margin-bottom: 1rem;
    }
    .banner h2 { color: white !important; border-bottom: none !important; }
    .info-box {
        background: #e8f0fa;
        border: 1px solid #a8c4e0;
        border-radius: 6px;
        padding: 12px 16px;
        font-size: 0.82rem;
        color: #2a4a6c;
    }
    .devolucion-box {
        background: #e0f2e9;
        border: 1px solid #a5d6a7;
        border-radius: 6px;
        padding: 12px 14px;
        font-size: 0.82rem;
    }
    .pago-box {
        background: #ffebee;
        border: 1px solid #ef9a9a;
        border-radius: 6px;
        padding: 12px 14px;
        font-size: 0.82rem;
    }
    div[data-testid="stSidebar"] { background-color: #1a3a5c; }
    div[data-testid="stSidebar"] label,
    div[data-testid="stSidebar"] .stMarkdown p,
    div[data-testid="stSidebar"] h1,
    div[data-testid="stSidebar"] h2,
    div[data-testid="stSidebar"] h3 { color: #e8f0fa !important; }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
# CONSTANTES IGC 2026
# ─────────────────────────────────────────────
TRAMOS_IGC = [
    {"desde": 0,           "hasta": 11_265_804,    "factor": 0,     "rebaja": 0,            "label": "Exento (0%)"},
    {"desde": 11_265_804,  "hasta": 25_035_120,    "factor": 0.04,  "rebaja": 450_632.16,   "label": "4%"},
    {"desde": 25_035_120,  "hasta": 41_725_200,    "factor": 0.08,  "rebaja": 1_452_036.96, "label": "8%"},
    {"desde": 41_725_200,  "hasta": 58_415_280,    "factor": 0.135, "rebaja": 3_746_922.96, "label": "13,5%"},
    {"desde": 58_415_280,  "hasta": 75_105_360,    "factor": 0.23,  "rebaja": 9_296_374.56, "label": "23%"},
    {"desde": 75_105_360,  "hasta": 100_140_480,   "factor": 0.304, "rebaja": 14_854_171.2, "label": "30,4%"},
    {"desde": 100_140_480, "hasta": 258_696_240,   "factor": 0.35,  "rebaja": 19_460_633.28,"label": "35%"},
    {"desde": 258_696_240, "hasta": float("inf"),  "factor": 0.40,  "rebaja": 32_395_445.28,"label": "40%"},
]
APV_MAX_ANUAL = 42_500_000
UF_CRECIMIENTO = 0.03
ANOS = 10

# ─────────────────────────────────────────────
# FUNCIONES AUXILIARES
# ─────────────────────────────────────────────
def get_tramo(base: float) -> dict:
    for t in TRAMOS_IGC:
        if base <= t["hasta"]:
            return t
    return TRAMOS_IGC[-1]

def calc_igc(base: float) -> float:
    t = get_tramo(base)
    return max(0.0, base * t["factor"] - t["rebaja"])

def fmt_clp(n: float) -> str:
    return f"${n:,.0f}".replace(",", ".")

def fmt_uf(n: float) -> str:
    return f"{n:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")

def fmt_pct(n: float, dec: int = 1) -> str:
    return f"{n*100:.{dec}f}%"

# ─────────────────────────────────────────────
# SESSION STATE
# ─────────────────────────────────────────────
defaults = {
    "nombre": "", "rut": "", "email": "", "telefono": "",
    "asesor": "", "fecha": "",
    "cod170": 0.0, "cod1098": 0.0, "cod110": 0.0, "cod155": 0.0,
    "cod157": 0.0, "cod162": 0.0, "cod198": 0.0, "cod619": 0.0,
    "cod304": 0.0, "cod305": 0.0, "cod85": 0.0, "cod87": 0.0,
    "cod461": 0.0, "cod547": 0.0, "cod750": 0.0, "cod1849": 0.0,
    "cod955": 0.0, "cod1637": 0.0, "nombre_banco": "", "num_cuenta": "",
    "apv_anual": 0.0, "tasa_pct": 11.8, "uf_base": 38500.0,
}
for k, v in defaults.items():
    if k not in st.session_state:
        st.session_state[k] = v

# ─────────────────────────────────────────────
# SIDEBAR — NAVEGACIÓN
# ─────────────────────────────────────────────
with st.sidebar:
    st.markdown("## Simulador APV 2026")
    st.markdown("---")
    seccion = st.radio(
        "Secciones",
        options=[
            "1. Datos del Cliente",
            "2. Formulario 22",
            "3. Tramo Impositivo",
            "4. Simulación APV",
            "5. Proyección Rentabilidad",
        ],
        label_visibility="collapsed",
    )
    st.markdown("---")
    st.markdown("<small style='color:#a8c4e0'>Global Complementario 2026<br>Tablas SII vigentes</small>", unsafe_allow_html=True)

# ─────────────────────────────────────────────
# SECCIÓN 1 — DATOS DEL CLIENTE
# ─────────────────────────────────────────────
if seccion == "1. Datos del Cliente":
    st.markdown("## Sección 1 — Datos del Cliente")

    c1, c2 = st.columns(2)
    with c1:
        st.session_state["nombre"]   = st.text_input("Nombre completo",       value=st.session_state["nombre"])
        st.session_state["rut"]      = st.text_input("RUT",                   value=st.session_state["rut"])
        st.session_state["email"]    = st.text_input("Correo electrónico",    value=st.session_state["email"])
    with c2:
        st.session_state["telefono"] = st.text_input("Teléfono",              value=st.session_state["telefono"])
        st.session_state["asesor"]   = st.text_input("Nombre del asesor",     value=st.session_state["asesor"])
        st.session_state["fecha"]    = st.text_input("Fecha de simulación",   value=st.session_state["fecha"], placeholder="ej: 24/04/2026")

    if st.session_state["nombre"]:
        st.success(f"Cliente registrado: **{st.session_state['nombre']}** | RUT: {st.session_state['rut']}")

# ─────────────────────────────────────────────
# SECCIÓN 2 — FORMULARIO 22
# ─────────────────────────────────────────────
elif seccion == "2. Formulario 22":
    st.markdown("## Sección 2 — Datos del Formulario 22 Compacto")
    st.markdown('<div class="info-box">Ingrese los valores tal como aparecen en el F22 Compacto del cliente. Todos los montos en <b>pesos chilenos (CLP)</b>.</div>', unsafe_allow_html=True)
    st.markdown("")

    st.markdown("### Rentas y Base Imponible")
    c1, c2 = st.columns(2)
    with c1:
        st.session_state["cod1098"] = st.number_input("Cód. 1098 — Sueldos, pensiones y rentas similares",        min_value=0.0, step=1000.0, value=st.session_state["cod1098"], format="%.0f")
        st.session_state["cod110"]  = st.number_input("Cód. 110  — Honorarios (Art. 42 N°2 y 48 LIR)",            min_value=0.0, step=1000.0, value=st.session_state["cod110"],  format="%.0f")
        st.session_state["cod155"]  = st.number_input("Cód. 155  — Rentas capitales mobiliarios (Art. 20 N°2)",    min_value=0.0, step=1000.0, value=st.session_state["cod155"],  format="%.0f")
        st.session_state["cod1849"] = st.number_input("Cód. 1849 — Rentas arrendamiento bienes raíces",            min_value=0.0, step=1000.0, value=st.session_state["cod1849"], format="%.0f")
        st.session_state["cod955"]  = st.number_input("Cód. 955  — Otras rentas propias o de terceros",            min_value=0.0, step=1000.0, value=st.session_state["cod955"],  format="%.0f")
    with c2:
        st.session_state["cod170"]  = st.number_input("Cód. 170  — BASE IMPONIBLE ANUAL IGC (el más importante)",  min_value=0.0, step=1000.0, value=st.session_state["cod170"],  format="%.0f")
        st.session_state["cod157"]  = st.number_input("Cód. 157  — IGC según tabla (Arts. 47, 52 LIR)",            min_value=0.0, step=1000.0, value=st.session_state["cod157"],  format="%.0f")
        st.session_state["cod162"]  = st.number_input("Cód. 162  — Crédito IGC por IUSC (Art. 56 N°2 LIR)",       min_value=0.0, step=1000.0, value=st.session_state["cod162"],  format="%.0f")
        st.session_state["cod304"]  = st.number_input("Cód. 304  — IGC / IUSC Débito fiscal determinado",          min_value=0.0, step=1000.0, value=st.session_state["cod304"],  format="%.0f")
        st.session_state["cod1637"] = st.number_input("Cód. 1637 — Crédito IGC por Impuesto Territorial",          min_value=0.0, step=1000.0, value=st.session_state["cod1637"], format="%.0f")

    st.markdown("### Retenciones")
    c1, c2 = st.columns(2)
    with c1:
        st.session_state["cod198"]  = st.number_input("Cód. 198  — Retenciones honorarios (Recuadro N°1)",         min_value=0.0, step=1000.0, value=st.session_state["cod198"],  format="%.0f")
        st.session_state["cod461"]  = st.number_input("Cód. 461  — Honorarios anuales con retención",              min_value=0.0, step=1000.0, value=st.session_state["cod461"],  format="%.0f")
        st.session_state["cod547"]  = st.number_input("Cód. 547  — Total ingresos brutos",                         min_value=0.0, step=1000.0, value=st.session_state["cod547"],  format="%.0f")
    with c2:
        st.session_state["cod619"]  = st.number_input("Cód. 619  — Impuesto retenido total rentas y retenciones",  min_value=0.0, step=1000.0, value=st.session_state["cod619"],  format="%.0f")
        st.session_state["cod750"]  = st.number_input("Cód. 750  — Intereses crédito hipotecario (Art. 55 bis)",   min_value=0.0, step=1000.0, value=st.session_state["cod750"],  format="%.0f")

    st.markdown("### Resultado de la Declaración")
    c1, c2 = st.columns(2)
    with c1:
        st.session_state["cod305"]  = st.number_input("Cód. 305  — Resultado liquidación (negativo = devolución)", step=1000.0, value=st.session_state["cod305"], format="%.0f")
        st.session_state["cod85"]   = st.number_input("Cód. 85   — Saldo a favor",                                 min_value=0.0, step=1000.0, value=st.session_state["cod85"],   format="%.0f")
        st.session_state["cod87"]   = st.number_input("Cód. 87   — Monto devolución solicitada",                   min_value=0.0, step=1000.0, value=st.session_state["cod87"],   format="%.0f")
    with c2:
        st.session_state["nombre_banco"] = st.text_input("Nombre banco (Cód. 301)", value=st.session_state["nombre_banco"])
        st.session_state["num_cuenta"]   = st.text_input("Número de cuenta (Cód. 306)", value=st.session_state["num_cuenta"])

    # Resumen automático
    res = st.session_state["cod305"]
    if res != 0:
        if res < 0:
            st.markdown(f'<div class="devolucion-box">Estado F22: <b style="color:#2e7d32">DEVOLUCIÓN</b> — Monto: <b>{fmt_clp(abs(res))}</b></div>', unsafe_allow_html=True)
        else:
            st.markdown(f'<div class="pago-box">Estado F22: <b style="color:#c62828">PAGO</b> — Monto: <b>{fmt_clp(res)}</b></div>', unsafe_allow_html=True)

# ─────────────────────────────────────────────
# SECCIÓN 3 — TRAMO IMPOSITIVO
# ─────────────────────────────────────────────
elif seccion == "3. Tramo Impositivo":
    st.markdown("## Sección 3 — Tabla de Tramos IGC 2026")

    # Tabla completa de tramos
    data_tramos = []
    for t in TRAMOS_IGC:
        data_tramos.append({
            "Desde ($)":           "0" if t["desde"] == 0 else fmt_clp(t["desde"]),
            "Hasta ($)":           "y más" if t["hasta"] == float("inf") else fmt_clp(t["hasta"]),
            "Factor":              "Exento" if t["factor"] == 0 else t["factor"],
            "Cantidad a Rebajar":  fmt_clp(t["rebaja"]),
            "Tramo":               t["label"],
        })
    df_tramos = pd.DataFrame(data_tramos)
    st.dataframe(df_tramos, use_container_width=True, hide_index=True)

    # Ubicación del cliente
    base = st.session_state["cod170"]
    if base > 0:
        tramo = get_tramo(base)
        igc   = calc_igc(base)
        tasa_ef = igc / base if base > 0 else 0

        st.markdown("### Tramo del cliente actual")
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Base Imponible (Cód. 170)", fmt_clp(base))
        c2.metric("Tramo IGC",                 tramo["label"])
        c3.metric("IGC Calculado",             fmt_clp(igc))
        c4.metric("Tasa Efectiva",             fmt_pct(tasa_ef))

        # Barra visual de tramo
        st.markdown("### Posición en la escala de tramos")
        for t in TRAMOS_IGC:
            es_actual = (base <= t["hasta"] and base >= t["desde"])
            color = "#2e7d32" if t["factor"] == 0 else ("#e8a020" if t["factor"] <= 0.135 else ("#e85020" if t["factor"] <= 0.23 else "#c62828"))
            marker = " ◄ CLIENTE AQUÍ" if es_actual else ""
            bg = "#e8f5e9" if es_actual else "transparent"
            border = "2px solid #2e7d32" if es_actual else "1px solid #e0e5ec"
            hasta_str = "y más" if t["hasta"] == float("inf") else fmt_clp(t["hasta"])
            st.markdown(
                f'<div style="background:{bg};border:{border};border-radius:4px;padding:6px 12px;margin-bottom:4px;font-size:0.82rem;">'
                f'<b style="color:{color}">{t["label"]}</b> &nbsp;|&nbsp; '
                f'Desde {fmt_clp(t["desde"])} hasta {hasta_str} &nbsp;|&nbsp; '
                f'Rebaja: {fmt_clp(t["rebaja"])}'
                f'<b style="color:#2e7d32">{marker}</b>'
                f'</div>',
                unsafe_allow_html=True,
            )
    else:
        st.info("Ingrese la Base Imponible (Cód. 170) en la Sección 2 para ver el tramo del cliente.")

# ─────────────────────────────────────────────
# SECCIÓN 4 — SIMULACIÓN APV
# ─────────────────────────────────────────────
elif seccion == "4. Simulación APV":
    st.markdown("## Sección 4 — Simulación de Ahorro Tributario APV (Régimen A)")
    st.markdown('<div class="info-box">El APV Régimen A reduce la Base Imponible del IGC, generando una mayor devolución de impuestos proporcional al tramo del cliente.</div>', unsafe_allow_html=True)
    st.markdown("")

    # Input APV
    apv_anual = st.number_input(
        "Monto APV Anual a simular (CLP) — Máx. $42.500.000 (50 UTA 2026)",
        min_value=0.0,
        max_value=float(APV_MAX_ANUAL),
        step=100_000.0,
        value=st.session_state["apv_anual"],
        format="%.0f",
    )
    st.session_state["apv_anual"] = apv_anual

    # Accesos rápidos
    c_r = st.columns(7)
    rapidos = [1_000_000, 3_000_000, 5_000_000, 7_500_000, 10_000_000, 15_000_000, 20_000_000]
    for i, monto in enumerate(rapidos):
        if c_r[i].button(fmt_clp(monto), key=f"rapido_{monto}"):
            st.session_state["apv_anual"] = float(monto)
            st.rerun()

    base = st.session_state["cod170"]

    if base == 0:
        st.warning("Ingrese la Base Imponible (Cód. 170) en la Sección 2 para activar la simulación.")
    else:
        apv = st.session_state["apv_anual"]

        # Cálculos
        igc_sin = calc_igc(base)
        igc_con = calc_igc(max(0.0, base - apv))
        tramo_sin = get_tramo(base)
        tramo_con = get_tramo(max(0.0, base - apv))
        ahorro    = igc_sin - igc_con
        tasa_ef_sin = igc_sin / base if base > 0 else 0
        tasa_ef_con = igc_con / (base - apv) if (base - apv) > 0 else 0
        rent_impl   = ahorro / apv if apv > 0 else 0

        # Resultado liquidación
        res_sin  = st.session_state["cod305"]
        res_con  = res_sin - ahorro
        dev_sin  = -res_sin
        dev_con  = -res_con

        # ── Banner de 4 KPIs ──
        st.markdown("### Resumen de impacto")
        k1, k2, k3, k4 = st.columns(4)

        estado_sin = "DEVOLUCIÓN" if res_sin <= 0 and dev_sin > 0 else ("PAGO" if res_sin > 0 else "—")
        color_sin  = "green" if res_sin <= 0 else "red"
        val_sin    = fmt_clp(dev_sin) if res_sin <= 0 else fmt_clp(res_sin)
        k1.metric("Devolución Actual (sin APV)", val_sin, delta=None, help=f"Estado: {estado_sin} — Cód. 305/87")

        estado_con = "DEVOLUCIÓN" if dev_con > 0 else "PAGO"
        val_con    = fmt_clp(dev_con) if dev_con > 0 else fmt_clp(-dev_con)
        k2.metric("Devolución con APV", val_con, delta=f"+{fmt_clp(ahorro)} extra" if ahorro > 0 else None)

        k3.metric("Ahorro Tributario Anual", fmt_clp(ahorro) if ahorro > 0 else "—")
        k4.metric("Rentabilidad Implícita APV",  fmt_pct(rent_impl) if rent_impl > 0 else "—",
                  help="Ahorro tributario / Monto APV invertido")

        # ── Comparación lado a lado ──
        st.markdown("### Comparación Sin APV vs Con APV")
        col_sin, col_con = st.columns(2)

        with col_sin:
            st.markdown("**Sin APV — Situación actual**")
            df_sin = pd.DataFrame([
                {"Campo": "Base Imponible (Cód. 170)", "Valor": fmt_clp(base)},
                {"Campo": "Tramo IGC",                  "Valor": tramo_sin["label"]},
                {"Campo": "Factor",                     "Valor": tramo_sin["factor"]},
                {"Campo": "Cantidad a Rebajar",         "Valor": fmt_clp(tramo_sin["rebaja"])},
                {"Campo": "IGC Calculado",              "Valor": fmt_clp(igc_sin)},
                {"Campo": "Tasa Efectiva",              "Valor": fmt_pct(tasa_ef_sin)},
            ])
            st.dataframe(df_sin, use_container_width=True, hide_index=True)

            # Resultado liquidación sin APV
            if res_sin < 0:
                st.markdown(f'<div class="devolucion-box"><b>Estado F22:</b> DEVOLUCIÓN<br><b>Cód. 305:</b> {fmt_clp(res_sin)}<br><b>Monto Devolución (Cód. 87):</b> <span style="font-size:1.1rem;color:#2e7d32;font-weight:700">{fmt_clp(dev_sin)}</span></div>', unsafe_allow_html=True)
            elif res_sin > 0:
                st.markdown(f'<div class="pago-box"><b>Estado F22:</b> PAGO<br><b>Monto a pagar (Cód. 91):</b> <span style="font-size:1.1rem;color:#c62828;font-weight:700">{fmt_clp(res_sin)}</span></div>', unsafe_allow_html=True)

        with col_con:
            st.markdown(f"**Con APV de {fmt_clp(apv)} — Proyección**")
            df_con = pd.DataFrame([
                {"Campo": "Base Imponible Reducida",   "Valor": fmt_clp(max(0.0, base - apv))},
                {"Campo": "Nuevo Tramo IGC",            "Valor": tramo_con["label"]},
                {"Campo": "Factor",                     "Valor": tramo_con["factor"]},
                {"Campo": "Cantidad a Rebajar",         "Valor": fmt_clp(tramo_con["rebaja"])},
                {"Campo": "IGC con APV",                "Valor": fmt_clp(igc_con)},
                {"Campo": "Tasa Efectiva",              "Valor": fmt_pct(tasa_ef_con)},
            ])
            st.dataframe(df_con, use_container_width=True, hide_index=True)

            # Resultado liquidación con APV
            if res_con < 0:
                st.markdown(
                    f'<div class="devolucion-box"><b>Estado F22 con APV:</b> DEVOLUCIÓN<br>'
                    f'<b>Cód. 305 proyectado:</b> {fmt_clp(res_con)}<br>'
                    f'<b>Monto Devolución proyectada:</b> <span style="font-size:1.1rem;color:#2e7d32;font-weight:700">{fmt_clp(dev_con)}</span><br>'
                    f'<b style="color:#1a6b2e">Mayor devolución gracias al APV: +{fmt_clp(ahorro)}</b></div>',
                    unsafe_allow_html=True,
                )
            elif res_con > 0:
                st.markdown(f'<div class="pago-box"><b>Estado F22 con APV:</b> PAGO<br><b>Monto a pagar proyectado:</b> <span style="font-size:1.1rem;color:#c62828;font-weight:700">{fmt_clp(res_con)}</span><br><b>Reducción gracias al APV: -{fmt_clp(ahorro)}</b></div>', unsafe_allow_html=True)

        # ── Tabla de escenarios ──
        st.markdown("### Tabla comparativa de escenarios APV")
        escenarios = [1_000_000, 3_000_000, 5_000_000, 7_500_000, 10_000_000, 15_000_000, 20_000_000]
        rows_esc = []
        for m in escenarios:
            base_r = max(0.0, base - m)
            igc_r  = calc_igc(base_r)
            aho_r  = igc_sin - igc_r
            rent_r = aho_r / m if m > 0 else 0
            tr_r   = get_tramo(base_r)
            rows_esc.append({
                "Monto APV Anual":        fmt_clp(m),
                "Base Reducida":          fmt_clp(base_r),
                "Tramo":                  tr_r["label"],
                "IGC con APV":            fmt_clp(igc_r),
                "Ahorro Tributario":      fmt_clp(aho_r),
                "Rentabilidad Implícita": fmt_pct(rent_r),
            })
        df_esc = pd.DataFrame(rows_esc)
        st.dataframe(df_esc, use_container_width=True, hide_index=True)

# ─────────────────────────────────────────────
# SECCIÓN 5 — PROYECCIÓN RENTABILIDAD
# ─────────────────────────────────────────────
elif seccion == "5. Proyección Rentabilidad":
    st.markdown("## Sección 5 — Proyección de Rentabilidad APV a 10 Años")
    st.markdown('<div class="info-box">Valores expresados en <b>CLP y UF</b>. Crecimiento UF estimado: <b>3% anual</b>. La tasa de rentabilidad es editable.</div>', unsafe_allow_html=True)
    st.markdown("")

    # Parámetros editables
    st.markdown("### Parámetros de simulación")
    p1, p2, p3 = st.columns(3)
    with p1:
        tasa_pct = st.number_input(
            "Tasa de rentabilidad anual (%)",
            min_value=0.0, max_value=50.0, step=0.1,
            value=st.session_state["tasa_pct"], format="%.1f",
        )
        st.session_state["tasa_pct"] = tasa_pct
        # Accesos rápidos de tasa
        rc = st.columns(5)
        for i, t in enumerate([8.0, 10.0, 11.8, 13.0, 15.0]):
            if rc[i].button(f"{t}%", key=f"tasa_{t}"):
                st.session_state["tasa_pct"] = t
                st.rerun()
    with p2:
        uf_base = st.number_input(
            "Valor UF actual (CLP)",
            min_value=1.0, step=10.0,
            value=st.session_state["uf_base"], format="%.0f",
        )
        st.session_state["uf_base"] = uf_base
        uf_10 = uf_base * math.pow(1.03, 10)
        st.caption(f"UF proyectada al año 10: **${uf_10:,.0f}**")
    with p3:
        apv = st.session_state["apv_anual"]
        st.markdown("**Resumen de parámetros**")
        st.markdown(f"- Tasa rentabilidad: **{tasa_pct}% anual**")
        st.markdown(f"- Crecimiento UF: **3% anual**")
        st.markdown(f"- APV anual: **{fmt_clp(apv)}**")
        if uf_base > 0 and apv > 0:
            st.markdown(f"- APV en UF hoy: **UF {fmt_uf(apv / uf_base)}**")

    if apv == 0:
        st.warning("Ingrese el monto APV en la Sección 4 para ver la proyección.")
    else:
        tasa      = tasa_pct / 100
        tasa_mens = math.pow(1 + tasa, 1/12) - 1
        aporte_m  = apv / 12

        # Construcción de la tabla
        acum_clp    = 0.0
        aporte_acum = 0.0
        rows_proj   = []

        for year in range(1, ANOS + 1):
            uf_ano = uf_base * math.pow(1 + UF_CRECIMIENTO, year)
            for _ in range(12):
                acum_clp = (acum_clp + aporte_m) * (1 + tasa_mens)
            aporte_acum += apv

            rent_clp = acum_clp - aporte_acum
            roi      = rent_clp / aporte_acum if aporte_acum > 0 else 0

            rows_proj.append({
                "Año":                       year,
                "UF del año":                fmt_clp(round(uf_ano)),
                "Fondo Acumulado (CLP)":     fmt_clp(round(acum_clp)),
                "Fondo Acumulado (UF)":      fmt_uf(acum_clp / uf_ano),
                "Rentabilidad (CLP)":        fmt_clp(round(rent_clp)),
                "Rentabilidad (UF)":         fmt_uf(rent_clp / uf_ano),
                "ROI acumulado":             fmt_pct(roi),
            })

        df_proj = pd.DataFrame(rows_proj)
        final   = rows_proj[-1]

        # KPIs finales
        st.markdown("### Resultado proyectado al año 10")
        k1, k2, k3, k4 = st.columns(4)
        k1.metric("Total Aportado (CLP)",      fmt_clp(aporte_acum))
        k2.metric("Total Aportado (UF)",        f"UF {fmt_uf(aporte_acum / (uf_base * math.pow(1.03, 10)))}")
        k3.metric("Fondo Acumulado (CLP)",      final["Fondo Acumulado (CLP)"])
        k4.metric("Fondo Acumulado (UF)",       f"UF {final['Fondo Acumulado (UF)']}")

        k5, k6, _, _ = st.columns(4)
        k5.metric("Rentabilidad Generada (CLP)", final["Rentabilidad (CLP)"])
        k6.metric("ROI a 10 años",              final["ROI acumulado"])

        # Tabla de proyección
        st.markdown("### Tabla de proyección anual")
        st.dataframe(df_proj, use_container_width=True, hide_index=True)

        # Metodología
        with st.expander("Ver metodología de cálculo"):
            st.markdown(f"""
**Capitalización mensual (aporte al inicio de cada mes):**
```
Fondo = (Fondo + Aporte mensual) × (1 + tasa mensual)
```
Tasa mensual = (1 + {tasa_pct}%)^(1/12) − 1. Se repite 12 veces por año, por lo que desde el año 1 el fondo ya genera intereses.

**UF proyectada (año N):**
```
UF(N) = UF base × (1 + 3%)^N
```

**Conversión a UF:**
```
Monto UF = Monto CLP / UF(N)
```

**ROI del Fondo APV:**
```
ROI = Rentabilidad generada / Total aportado
```
""")

        # ── DESCARGA EXCEL ──
        st.markdown("---")
        st.markdown("### Descargar simulación en Excel")

        def generar_excel():
            output = BytesIO()
            with pd.ExcelWriter(output, engine="openpyxl") as writer:
                # Hoja 1: Datos Cliente
                df_cli = pd.DataFrame([{
                    "Campo": k, "Valor": v
                } for k, v in {
                    "Nombre":          st.session_state["nombre"],
                    "RUT":             st.session_state["rut"],
                    "Email":           st.session_state["email"],
                    "Teléfono":        st.session_state["telefono"],
                    "Asesor":          st.session_state["asesor"],
                    "Fecha":           st.session_state["fecha"],
                }.items()])
                df_cli.to_excel(writer, sheet_name="1. Datos Cliente", index=False)

                # Hoja 2: Formulario 22
                df_f22 = pd.DataFrame([
                    {"Código": "170",  "Descripción": "BASE IMPONIBLE ANUAL IGC",                    "Valor": st.session_state["cod170"]},
                    {"Código": "1098", "Descripción": "Sueldos, pensiones y rentas similares",       "Valor": st.session_state["cod1098"]},
                    {"Código": "110",  "Descripción": "Honorarios (Art. 42 N°2)",                    "Valor": st.session_state["cod110"]},
                    {"Código": "155",  "Descripción": "Rentas capitales mobiliarios",                "Valor": st.session_state["cod155"]},
                    {"Código": "157",  "Descripción": "IGC según tabla",                             "Valor": st.session_state["cod157"]},
                    {"Código": "162",  "Descripción": "Crédito IGC por IUSC",                       "Valor": st.session_state["cod162"]},
                    {"Código": "304",  "Descripción": "IGC / Débito fiscal determinado",            "Valor": st.session_state["cod304"]},
                    {"Código": "198",  "Descripción": "Retenciones honorarios",                     "Valor": st.session_state["cod198"]},
                    {"Código": "619",  "Descripción": "Impuesto retenido total rentas",             "Valor": st.session_state["cod619"]},
                    {"Código": "305",  "Descripción": "Resultado liquidación (neg. = devolución)",  "Valor": st.session_state["cod305"]},
                    {"Código": "87",   "Descripción": "Monto devolución solicitada",                "Valor": st.session_state["cod87"]},
                ])
                df_f22.to_excel(writer, sheet_name="2. Formulario 22", index=False)

                # Hoja 3: Tramo IGC
                df_t = pd.DataFrame([{
                    "Desde ($)":          "0" if t["desde"] == 0 else t["desde"],
                    "Hasta ($)":          "y más" if t["hasta"] == float("inf") else t["hasta"],
                    "Factor":             "Exento" if t["factor"] == 0 else t["factor"],
                    "Cantidad a Rebajar": t["rebaja"],
                    "Tramo":              t["label"],
                } for t in TRAMOS_IGC])
                df_t.to_excel(writer, sheet_name="3. Tramo Impositivo", index=False)

                # Hoja 4: Simulación APV
                base_val = st.session_state["cod170"]
                apv_val  = st.session_state["apv_anual"]
                igc_s    = calc_igc(base_val)
                igc_c    = calc_igc(max(0.0, base_val - apv_val))
                aho_val  = igc_s - igc_c
                res_s    = st.session_state["cod305"]
                res_c    = res_s - aho_val
                df_apv = pd.DataFrame([
                    {"Concepto": "Base Imponible sin APV (Cód. 170)", "Valor": base_val},
                    {"Concepto": "APV Anual simulado",                "Valor": apv_val},
                    {"Concepto": "Base Imponible con APV",            "Valor": max(0.0, base_val - apv_val)},
                    {"Concepto": "IGC sin APV",                       "Valor": igc_s},
                    {"Concepto": "IGC con APV",                       "Valor": igc_c},
                    {"Concepto": "Ahorro Tributario Anual",           "Valor": aho_val},
                    {"Concepto": "Resultado F22 sin APV (Cód. 305)",  "Valor": res_s},
                    {"Concepto": "Resultado F22 con APV (proyectado)","Valor": res_c},
                    {"Concepto": "Rentabilidad Implícita APV",        "Valor": f"{aho_val/apv_val*100:.1f}%" if apv_val > 0 else "—"},
                ])
                df_apv.to_excel(writer, sheet_name="4. Simulacion APV", index=False)

                # Hoja 5: Proyección
                df_raw = pd.DataFrame([{
                    "Año":                   r["Año"],
                    "UF del año":            float(r["UF del año"].replace(".", "").replace("$", "").replace(",", ".")),
                    "Fondo Acumulado CLP":   r["Fondo Acumulado (CLP)"],
                    "Fondo Acumulado UF":    r["Fondo Acumulado (UF)"],
                    "Rentabilidad CLP":      r["Rentabilidad (CLP)"],
                    "Rentabilidad UF":       r["Rentabilidad (UF)"],
                    "ROI acumulado":         r["ROI acumulado"],
                } for r in rows_proj])
                df_raw.to_excel(writer, sheet_name="5. Proyeccion Rentabilidad", index=False)

            output.seek(0)
            return output.read()

        nombre_archivo = f"Simulador_APV_{st.session_state['nombre'].replace(' ','_') or 'Cliente'}_2026.xlsx"
        st.download_button(
            label="Descargar Excel (.xlsx)",
            data=generar_excel(),
            file_name=nombre_archivo,
            mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            use_container_width=True,
        )
