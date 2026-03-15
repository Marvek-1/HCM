<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Unified Dashboard</title>
  <style>
    :root {
      --blue: #0f5bff;
      --blue-dark: #0b49cc;
      --blue-soft: #eaf1ff;
      --bg: #f5f7fb;
      --panel: #ffffff;
      --line: #e8edf5;
      --text: #1c2333;
      --muted: #7c879b;
      --success: #17b26a;
      --warning: #f79009;
      --danger: #f04438;
      --shadow: 0 14px 40px rgba(16, 24, 40, 0.08);
      --radius-xl: 28px;
      --radius-lg: 20px;
      --radius-md: 14px;
      --radius-sm: 10px;
    }

    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      background: linear-gradient(180deg, #eef3fb 0%, #f8faff 100%);
      color: var(--text);
    }

    .app {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 24px;
      min-height: 100vh;
      padding: 18px;
    }

    .sidebar {
      background: linear-gradient(180deg, var(--blue) 0%, #0a47d8 100%);
      color: white;
      border-radius: var(--radius-xl);
      padding: 28px 20px;
      display: flex;
      flex-direction: column;
      box-shadow: var(--shadow);
      overflow: visible;
      position: relative;
      z-index: 2;
    }

    .brand {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 0.04em;
      margin-bottom: 30px;
    }

    .brand span {
      opacity: 0.7;
      font-weight: 600;
    }

    .menu {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 999px;
      color: rgba(255,255,255,0.88);
      font-weight: 600;
      cursor: pointer;
      position: relative;
      z-index: 1;
      border: 0;
      background: transparent;
      width: 100%;
      text-align: left;
      font-size: 15px;
    }

    .menu-item.active {
      background: #fff;
      color: var(--text);
      box-shadow: 0 10px 25px rgba(0,0,0,0.14);
      margin-right: -44px;
      padding-right: 44px;
      border-top-right-radius: 22px;
      border-bottom-right-radius: 22px;
      overflow: visible;
      z-index: 3;
    }

    .menu-item.active::before,
    .menu-item.active::after {
      content: "";
      position: absolute;
      right: 0;
      width: 24px;
      height: 24px;
      background: transparent;
      pointer-events: none;
    }

    .menu-item.active::before {
      top: -24px;
      border-bottom-right-radius: 24px;
      box-shadow: 8px 8px 0 8px #fff;
    }

    .menu-item.active::after {
      bottom: -24px;
      border-top-right-radius: 24px;
      box-shadow: 8px -8px 0 8px #fff;
    }

    .menu-icon {
      width: 18px;
      text-align: center;
      opacity: 0.95;
    }

    .sidebar-footer {
      margin-top: auto;
      display: flex;
      gap: 14px;
      font-size: 12px;
      color: rgba(255,255,255,0.7);
      padding: 8px 10px 0;
    }

    .main-shell {
      background: var(--panel);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow);
      padding: 26px;
      display: flex;
      flex-direction: column;
      gap: 22px;
      overflow: hidden;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 18px;
    }

    .page-title h1 {
      margin: 0;
      font-size: 34px;
      line-height: 1.05;
    }

    .page-title p {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: 14px;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .pill, .icon-btn {
      border: 1px solid var(--line);
      background: #fff;
      border-radius: 999px;
      height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      color: var(--text);
      font-weight: 600;
    }

    .icon-btn {
      width: 42px;
      padding: 0;
      font-size: 16px;
    }

    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ffd29d, #ff8a7a);
      display: grid;
      place-items: center;
      font-weight: 800;
      color: white;
    }

    .tabs {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      border-bottom: 1px solid var(--line);
      padding-bottom: 14px;
    }

    .tab {
      padding: 10px 14px;
      border-radius: 999px;
      color: var(--muted);
      font-weight: 700;
      font-size: 14px;
      background: transparent;
    }

    .tab.active {
      color: var(--blue);
      background: var(--blue-soft);
    }

    .kpis {
      display: grid;
      grid-template-columns: repeat(6, minmax(0, 1fr));
      gap: 16px;
    }

    .products-hero {
      display: grid;
      grid-template-columns: 1.25fr 0.95fr;
      gap: 16px;
      align-items: stretch;
    }

    .hero-banner {
      min-height: 330px;
      background: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.22), transparent 28%), linear-gradient(135deg, #0b4fdf 0%, #1495ff 100%);
      color: white;
      border-radius: 26px;
      padding: 32px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .hero-banner::before {
      content: "";
      position: absolute;
      width: 260px;
      height: 260px;
      right: -60px;
      top: -70px;
      border-radius: 50%;
      background: rgba(255,255,255,0.12);
    }

    .hero-banner::after {
      content: "";
      position: absolute;
      width: 220px;
      height: 220px;
      right: 60px;
      bottom: -120px;
      border-radius: 50%;
      background: rgba(255,255,255,0.08);
    }

    .hero-copy { position: relative; z-index: 1; max-width: 420px; }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(255,255,255,0.12);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .hero-copy h2 { margin: 16px 0 12px; font-size: 38px; line-height: 1.05; letter-spacing: -0.03em; }
    .hero-copy p { margin: 0; color: rgba(255,255,255,0.82); font-size: 14px; line-height: 1.7; max-width: 360px; }
    .hero-actions { position: relative; z-index: 1; display: flex; align-items: center; gap: 12px; margin-top: 26px; flex-wrap: wrap; }
    .hero-btn { height: 44px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.28); background: rgba(255,255,255,0.12); color: white; font-weight: 800; padding: 0 18px; }
    .hero-btn.primary { background: white; color: var(--blue); border-color: white; }
    .hero-visual { position: absolute; right: 26px; bottom: 18px; width: 260px; height: 220px; z-index: 1; }
    .device-screen { position: absolute; right: 18px; top: 0; width: 150px; height: 190px; border-radius: 26px; background: linear-gradient(180deg, #ffffff 0%, #f2f8ff 100%); box-shadow: 0 22px 50px rgba(3, 30, 84, 0.22); border: 8px solid rgba(255,255,255,0.7); }
    .device-screen.small { right: 126px; top: 88px; width: 132px; height: 88px; border-radius: 18px; border-width: 6px; }
    .device-ui { padding: 16px; display: grid; gap: 10px; }
    .ui-line, .ui-box { background: linear-gradient(90deg, #dcecff, #b9d7ff); border-radius: 999px; height: 10px; }
    .ui-box { height: 58px; border-radius: 18px; }
    .hero-side { display: grid; gap: 16px; }
    .spotlight-card { min-height: 157px; display: grid; grid-template-columns: 108px 1fr; gap: 16px; align-items: center; background: linear-gradient(180deg, #fbfdff 0%, #f2f8ff 100%); }
    .product-art { width: 108px; height: 108px; border-radius: 28px; background: linear-gradient(180deg, #dff0ff 0%, #9ad0ff 100%); position: relative; box-shadow: inset 0 10px 25px rgba(255,255,255,0.55), 0 16px 30px rgba(15,91,255,0.08); }
    .product-art.mask::before { content: ""; position: absolute; left: 18px; top: 28px; width: 72px; height: 42px; border-radius: 16px; background: white; box-shadow: 0 8px 18px rgba(15,91,255,0.15); }
    .product-art.mask::after { content: ""; position: absolute; left: 10px; top: 42px; width: 14px; height: 14px; border-radius: 50%; background: white; box-shadow: 84px 0 0 0 white; }
    .product-art.kit::before { content: ""; position: absolute; left: 22px; top: 18px; width: 64px; height: 72px; border-radius: 20px; background: white; box-shadow: 0 14px 24px rgba(15,91,255,0.16); }
    .product-art.kit::after { content: "+"; position: absolute; left: 47px; top: 36px; color: var(--blue); font-size: 28px; font-weight: 900; }
    .spotlight-copy h3 { margin: 0 0 8px; font-size: 19px; }
    .spotlight-copy p { margin: 0 0 10px; font-size: 13px; color: var(--muted); line-height: 1.6; }
    .chip-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .chip { height: 30px; padding: 0 12px; border-radius: 999px; background: var(--blue-soft); color: var(--blue); display: inline-flex; align-items: center; font-size: 12px; font-weight: 800; }
    .products-layout { display: grid; grid-template-columns: 280px 1fr; gap: 16px; }
    .filters-card { display: grid; gap: 18px; align-content: start; background: linear-gradient(180deg, #fbfdff 0%, #f6faff 100%); }
    .products-shell { display: grid; gap: 18px; }
    .products-shell.hidden { display: none; }
    .category-stack { display: grid; gap: 10px; }
    .category-button {
      width: 100%; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.92); border-radius: 16px; padding: 12px 14px; text-align: left;
      display: flex; align-items: center; justify-content: space-between; font-weight: 700; font-size: 14px;
    }
    .category-button.active { background: rgba(255,255,255,0.18); color: white; }
    .sidebar-subhead { margin-top: 18px; margin-bottom: 10px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.62); font-weight: 800; }
    .sidebar-back {
      display: none; width: 100%; height: 42px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.14);
      background: rgba(255,255,255,0.12); color: white; font-weight: 800; text-align: left; padding: 0 16px;
      align-items: center; gap: 10px;
    }
    .sidebar-back.show { display: inline-flex; }
    .sidebar.compact .menu { gap: 8px; }
    .sidebar.compact .menu-item:not([data-page="products"]) { display: none; }
    .sidebar.compact .menu-item[data-page="products"] { margin-bottom: 2px; }
    .products-detail-page { display: none; grid-template-columns: 1.15fr 0.85fr; gap: 16px; }
    .products-detail-page.active { display: grid; }
    .order-panel { display: grid; gap: 16px; }
    .order-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
    .field { display: grid; gap: 8px; }
    .field label { font-size: 12px; font-weight: 800; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .field input, .field select, .field textarea {
      width: 100%; border: 1px solid var(--line); border-radius: 14px; background: #fff; min-height: 46px;
      padding: 12px 14px; font: inherit; color: var(--text);
    }
    .field textarea { min-height: 108px; resize: vertical; }
    .qty-stepper { display: inline-flex; align-items: center; gap: 10px; padding: 6px; border: 1px solid var(--line); border-radius: 999px; background: #fff; }
    .qty-stepper button { width: 34px; height: 34px; border-radius: 50%; border: 0; background: var(--blue-soft); color: var(--blue); font-size: 18px; font-weight: 900; }
    .qty-value { min-width: 24px; text-align: center; font-weight: 800; }
    .summary-list { display: grid; gap: 12px; }
    .summary-row { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; font-weight: 700; }
    .summary-row.muted { color: var(--muted); font-weight: 600; }
    .summary-row.total { padding-top: 12px; border-top: 1px solid var(--line); font-size: 18px; }
    .order-actions { display: flex; gap: 12px; flex-wrap: wrap; }
    .ghost-btn { height: 42px; padding: 0 16px; border-radius: 999px; border: 1px solid var(--line); background: #fff; color: var(--text); font-weight: 800; }
    .who-shell { display: none; grid-template-columns: 1fr; gap: 16px; }
    .who-shell.active { display: grid; }
    .who-header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .who-banner { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
    .who-form {
      background: #ffffff; color: #111827; border-radius: 22px; overflow: hidden; border: 2px solid #d9e7fb;
      box-shadow: 0 20px 40px rgba(16,24,40,0.08);
    }
    .who-topline { display: grid; grid-template-columns: 150px 1fr 210px; }
    .who-logo, .who-ref, .who-title { min-height: 48px; display: flex; align-items: center; }
    .who-logo { padding: 10px 14px; background: #ffffff; color: #0b83d8; font-weight: 900; font-size: 14px; border-bottom: 1px solid #d9e7fb; }
    .who-title { justify-content: center; background: #ffffff; color: #e02626; font-weight: 900; font-size: 26px; letter-spacing: 0.03em; text-transform: uppercase; border-bottom: 1px solid #d9e7fb; }
    .who-ref { justify-content: center; background: #ffffff; color: #111; font-weight: 900; font-size: 13px; text-align: center; padding: 8px 12px; border-bottom: 1px solid #d9e7fb; }
    .who-grid { display: grid; grid-template-columns: 1.15fr 0.65fr 0.75fr; }
    .who-cell {
      min-height: 34px; border-right: 1px solid #d9e7fb; border-top: 1px solid #d9e7fb; padding: 8px 10px;
      font-size: 12px; line-height: 1.35; background: #ffffff;
    }
    .who-cell.label { background: #f3f6fb; color: #111; font-weight: 800; }
    .who-cell.yellow { background: #ffffff; color: #111; font-weight: 800; }
    .who-cell.blue { background: #eef6ff; color: #111; font-weight: 800; }
    .who-cell.gray { background: #f7f8fa; color: #111; }
    .who-cell.center { text-align: center; }
    .who-cell.right { text-align: right; }
    .who-cell.red { color: #ff3b30; font-weight: 800; }
    .who-section-title {
      background: #11a7e8; color: #fff; font-weight: 900; text-transform: uppercase; letter-spacing: 0.04em;
      padding: 9px 12px; border-top: 2px solid #ffffff;
    }
    .who-items table { width: 100%; background: #ffffff; color: #111827; }
    .who-items thead th {
      background: #f3f6fb; color: #111; border-right: 1px solid #d9e7fb; border-bottom: 1px solid #d9e7fb; padding: 8px 10px;
      font-size: 11px; text-transform: none;
    }
    .who-items tbody td {
      border-right: 1px solid #d9e7fb; border-bottom: 1px solid #d9e7fb; padding: 7px 10px; font-size: 12px;
    }
    .who-items tbody tr:nth-child(even) td { background: #fafcff; }
    .who-signoff { display: grid; grid-template-columns: 1fr 1fr 1fr; border-top: 2px solid #11a7e8; }
    .who-sign { min-height: 88px; border-right: 1px solid #d9e7fb; position: relative; }
    .who-sign:last-child { border-right: 0; }
    .who-sign span {
      position: absolute; left: 0; right: 0; top: 10px; text-align: center; color: #8b6d00; font-size: 12px; font-style: italic; font-weight: 800;
    }
    .who-steps { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
    .who-step-card { border: 1px solid var(--line); border-radius: 18px; padding: 16px; background: linear-gradient(180deg, #fbfdff 0%, #f4f8ff 100%); }
    .who-step-card b { display: block; margin-bottom: 6px; font-size: 14px; }
    .who-step-card p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
    .lock-note { border-radius: 18px; padding: 16px; background: #fff7e8; border: 1px solid #ffd27a; color: #7a5200; font-size: 14px; line-height: 1.7; }
    .order-detail-grid { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 16px; }
    .status-pills { display: flex; flex-wrap: wrap; gap: 8px; }
    .timeline { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .timeline-step { border: 1px solid var(--line); border-radius: 18px; padding: 16px; background: #fff; position: relative; }
    .timeline-step::before { content: ""; position: absolute; left: 18px; top: 18px; width: 12px; height: 12px; border-radius: 50%; background: #c9d7ef; }
    .timeline-step.active::before { background: var(--blue); }
    .timeline-step.done::before { background: var(--success); }
    .timeline-step h4 { margin: 0 0 8px 22px; font-size: 14px; }
    .timeline-step p { margin: 0 0 0 22px; color: var(--muted); font-size: 12px; line-height: 1.6; }
    .osl-grid { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 16px; }
    .osl-queue-table td .link-btn { height: 32px; padding: 0 12px; }
    .tiny-note { font-size: 12px; color: var(--muted); line-height: 1.6; }
    @media (max-width: 1380px) { .timeline, .osl-grid { grid-template-columns: 1fr; } }
    .status-pill { height: 32px; padding: 0 12px; border-radius: 999px; background: var(--blue-soft); color: var(--blue); display: inline-flex; align-items: center; font-size: 12px; font-weight: 800; }
    @media (max-width: 1380px) { .who-steps, .order-detail-grid { grid-template-columns: 1fr; } .who-topline, .who-grid, .who-signoff { grid-template-columns: 1fr; } }
    .search-box { height: 46px; border-radius: 14px; border: 1px solid var(--line); background: white; display: flex; align-items: center; gap: 10px; padding: 0 14px; color: var(--muted); font-weight: 600; }
    .filter-group { display: grid; gap: 10px; }
    .filter-title { font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); }
    .category-link { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 14px; font-size: 14px; font-weight: 700; color: var(--text); background: white; border: 1px solid var(--line); }
    .category-link.active { color: var(--blue); background: var(--blue-soft); border-color: #cfe0ff; }
    .currency-pills { display: flex; flex-wrap: wrap; gap: 8px; }
    .currency-pill { height: 34px; padding: 0 12px; border-radius: 999px; border: 1px solid var(--line); background: white; color: var(--muted); font-size: 12px; font-weight: 800; cursor: pointer; }
    .currency-pill.active { color: white; background: var(--blue); border-color: var(--blue); }
    .products-main { display: grid; gap: 16px; }
    .products-head { display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap; }
    .products-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .product-card { padding: 0; overflow: hidden; cursor: pointer; transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .product-card:hover { transform: translateY(-3px); box-shadow: 0 18px 38px rgba(16, 24, 40, 0.1); }
    .product-card.active-product { outline: 2px solid #cfe0ff; }
    .product-top { min-height: 162px; padding: 20px; background: linear-gradient(180deg, #f6fbff 0%, #edf5ff 100%); position: relative; overflow: hidden; }
    .product-top .badge { position: absolute; top: 16px; left: 16px; height: 28px; padding: 0 10px; border-radius: 999px; background: rgba(15,91,255,0.1); color: var(--blue); display: inline-flex; align-items: center; font-size: 11px; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; }
    .product-shape { position: absolute; right: 20px; bottom: 14px; width: 124px; height: 110px; border-radius: 30px; background: linear-gradient(180deg, #dff1ff 0%, #a6d6ff 100%); box-shadow: inset 0 10px 20px rgba(255,255,255,0.4), 0 18px 32px rgba(15,91,255,0.1); }
    .product-shape.glove::before { content: ""; position: absolute; left: 38px; top: 22px; width: 44px; height: 56px; border-radius: 22px 22px 28px 28px; background: white; box-shadow: -18px -2px 0 -4px white, 18px -4px 0 -6px white, 30px 6px 0 -9px white; }
    .product-shape.kit::before { content: ""; position: absolute; left: 30px; top: 18px; width: 64px; height: 74px; border-radius: 22px; background: white; }
    .product-shape.kit::after { content: "+"; position: absolute; left: 56px; top: 42px; transform: translateX(-50%); color: var(--blue); font-size: 30px; font-weight: 900; }
    .product-shape.mask::before { content: ""; position: absolute; left: 26px; top: 38px; width: 72px; height: 34px; border-radius: 16px; background: white; }
    .product-shape.mask::after { content: ""; position: absolute; left: 16px; top: 48px; width: 12px; height: 12px; border-radius: 50%; background: white; box-shadow: 80px 0 0 0 white; }
    .product-body { padding: 18px; display: grid; gap: 10px; }
    .product-meta { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
    .product-name { margin: 0; font-size: 18px; }
    .sku { color: var(--muted); font-size: 12px; font-weight: 700; }
    .price-block { text-align: right; }
    .price-block strong { display: block; font-size: 24px; letter-spacing: -0.03em; }
    .price-block span { font-size: 12px; color: var(--muted); font-weight: 700; }
    .spec-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; font-size: 12px; color: var(--muted); font-weight: 700; }
    .spec-list b { display: block; color: var(--text); font-size: 13px; margin-top: 2px; }
    .card-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 4px; }
    .link-btn { height: 38px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--line); background: white; color: var(--text); font-weight: 800; }
    .link-btn.primary { background: var(--blue); border-color: var(--blue); color: white; }
    .detail-panel { display: none; grid-template-columns: 1.1fr 0.9fr; gap: 16px; margin-top: 2px; }
    .detail-panel.active { display: grid; }
    .detail-visual { min-height: 290px; border-radius: 26px; background: linear-gradient(180deg, #f7fbff 0%, #edf6ff 100%); position: relative; overflow: hidden; }
    .detail-visual .product-shape { width: 210px; height: 180px; right: 44px; bottom: 34px; border-radius: 40px; }
    .detail-summary { display: grid; gap: 16px; }
    .detail-title h2 { margin: 0 0 10px; font-size: 30px; line-height: 1.05; letter-spacing: -0.03em; }
    .detail-title p { margin: 0; color: var(--muted); line-height: 1.7; font-size: 14px; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .detail-cell { border: 1px solid var(--line); border-radius: 16px; padding: 14px; background: #fff; }
    .detail-cell span { display: block; color: var(--muted); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
    .detail-cell strong { font-size: 14px; line-height: 1.6; }
    .usage-list { display: grid; gap: 10px; margin: 0; padding-left: 18px; color: var(--text); font-size: 14px; line-height: 1.6; }
    .note-box { border-radius: 18px; padding: 16px; background: linear-gradient(180deg, #f7fbff 0%, #eef6ff 100%); border: 1px solid #dbe8ff; color: var(--text); font-size: 14px; line-height: 1.7; }
    .note-box b { display: block; margin-bottom: 6px; }

    .card {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: var(--radius-lg);
      padding: 18px;
    }

    .kpi-card {
      min-height: 122px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .card-label {
      font-size: 13px;
      color: var(--muted);
      font-weight: 700;
    }

    .card-value {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-top: 8px;
    }

    .trend {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: var(--success);
      margin-top: 10px;
    }

    .trend.down { color: var(--danger); }
    .trend.warn { color: var(--warning); }

    .sparkline {
      height: 34px;
      display: flex;
      align-items: end;
      gap: 4px;
      margin-top: 10px;
    }

    .sparkline span {
      display: block;
      width: 7px;
      background: linear-gradient(180deg, #84aefc, var(--blue));
      border-radius: 999px;
    }

    .grid-analytics {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
    }

    .card-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 18px;
    }

    .card-title h3 {
      margin: 0;
      font-size: 18px;
    }

    .subtle {
      color: var(--muted);
      font-size: 13px;
      font-weight: 600;
    }

    .bar-chart {
      height: 250px;
      display: flex;
      align-items: end;
      gap: 12px;
      padding-top: 10px;
    }

    .bar-group {
      flex: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: end;
      align-items: center;
      gap: 8px;
    }

    .bar-stack {
      width: 100%;
      max-width: 38px;
      height: 100%;
      display: flex;
      align-items: end;
      justify-content: center;
    }

    .bar {
      width: 100%;
      border-radius: 14px 14px 6px 6px;
      background: linear-gradient(180deg, #8fb4ff 0%, var(--blue) 100%);
      position: relative;
    }

    .bar.light {
      background: linear-gradient(180deg, #dbe8ff 0%, #a9c4ff 100%);
    }

    .axis-label {
      font-size: 12px;
      color: var(--muted);
      font-weight: 700;
    }

    .donut-wrap {
      display: grid;
      place-items: center;
      padding: 8px 0 2px;
      gap: 16px;
    }

    .donut {
      width: 190px;
      height: 190px;
      border-radius: 50%;
      background: conic-gradient(var(--blue) 0 42%, #4d86ff 42% 69%, #9fbdff 69% 88%, #dbe7ff 88% 100%);
      position: relative;
    }

    .donut::after {
      content: "84%\A uptime";
      white-space: pre;
      position: absolute;
      inset: 28px;
      border-radius: 50%;
      background: #fff;
      display: grid;
      place-items: center;
      text-align: center;
      font-weight: 800;
      color: var(--text);
      font-size: 24px;
      line-height: 1.1;
      box-shadow: inset 0 0 0 1px var(--line);
    }

    .legend {
      width: 100%;
      display: grid;
      gap: 10px;
    }

    .legend-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: var(--text);
      font-weight: 700;
    }

    .legend-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--blue);
    }

    .flow-grid {
      display: grid;
      grid-template-columns: 1.8fr 1fr;
      gap: 16px;
    }

    .flow-steps {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
      align-items: center;
      position: relative;
      margin-top: 8px;
    }

    .flow-steps::before {
      content: "";
      position: absolute;
      left: 8%;
      right: 8%;
      top: 38px;
      height: 4px;
      background: linear-gradient(90deg, #d7e4ff, var(--blue), #d7e4ff);
      border-radius: 999px;
      z-index: 0;
    }

    .flow-step {
      position: relative;
      z-index: 1;
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 18px;
      padding: 16px 12px;
      text-align: center;
      min-height: 132px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 6px 18px rgba(15, 91, 255, 0.05);
    }

    .step-icon {
      width: 46px;
      height: 46px;
      border-radius: 16px;
      background: var(--blue-soft);
      color: var(--blue);
      display: grid;
      place-items: center;
      font-size: 22px;
      margin: 0 auto 10px;
      font-weight: 800;
    }

    .step-name {
      font-size: 13px;
      font-weight: 800;
    }

    .step-meta {
      font-size: 12px;
      color: var(--muted);
      margin-top: 5px;
      font-weight: 700;
    }

    .step-badge {
      display: inline-flex;
      justify-content: center;
      margin: 10px auto 0;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      background: #eef7f1;
      color: var(--success);
    }

    .right-stack {
      display: grid;
      gap: 16px;
    }

    .gauge {
      width: 180px;
      height: 90px;
      border-top-left-radius: 180px;
      border-top-right-radius: 180px;
      background: conic-gradient(from 180deg, #dce8ff 0 28%, #86adff 28% 55%, var(--blue) 55% 74%, #dce8ff 74% 100%);
      position: relative;
      overflow: hidden;
      margin: 18px auto 10px;
    }

    .gauge::after {
      content: "";
      position: absolute;
      left: 20px;
      right: 20px;
      bottom: -70px;
      height: 140px;
      border-radius: 50%;
      background: #fff;
      box-shadow: inset 0 0 0 1px var(--line);
    }

    .gauge-value {
      text-align: center;
      font-size: 30px;
      font-weight: 800;
      margin-top: -6px;
    }

    .mini-bars {
      display: grid;
      gap: 14px;
      margin-top: 6px;
    }

    .mini-bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .track {
      width: 100%;
      height: 10px;
      background: #edf2fb;
      border-radius: 999px;
      overflow: hidden;
    }

    .fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #8eb3ff, var(--blue));
    }

    .lower-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .line-chart {
      height: 95px;
      position: relative;
      margin-top: 12px;
      background:
        linear-gradient(to top, rgba(15,91,255,0.02), rgba(15,91,255,0)),
        repeating-linear-gradient(to top, #f3f6fb 0, #f3f6fb 1px, transparent 1px, transparent 24px);
      border-radius: 12px;
      overflow: hidden;
    }

    svg { display: block; width: 100%; height: 100%; }

    .table-card { overflow: hidden; padding: 0; }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    thead th {
      text-align: left;
      padding: 18px 20px;
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid var(--line);
      background: #fff;
    }

    tbody td {
      padding: 18px 20px;
      border-bottom: 1px solid var(--line);
      font-weight: 600;
    }

    tbody tr.selected {
      background: linear-gradient(90deg, #0c58f8, #246cff);
      color: white;
    }

    tbody tr.selected td {
      border-bottom-color: rgba(255,255,255,0.14);
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 13px;
    }

    .status .dot { width: 8px; height: 8px; }

    .footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      color: var(--muted);
      font-size: 13px;
      font-weight: 700;
    }

    @media (max-width: 1380px) {
      .products-detail-page { grid-template-columns: 1fr; }
      .order-grid { grid-template-columns: 1fr; }
      .kpis, .lower-grid { grid-template-columns: repeat(3, 1fr); }
      .flow-grid, .grid-analytics, .products-layout, .detail-panel, .products-hero { grid-template-columns: 1fr; }
      .products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 1080px) {
      .app { grid-template-columns: 1fr; }
      .sidebar { min-height: auto; overflow: hidden; }
      .menu-item.active {
        margin-right: 0;
        padding-right: 16px;
        border-radius: 999px;
      }
      .menu-item.active::before,
      .menu-item.active::after {
        display: none;
      }
      .flow-steps { grid-template-columns: repeat(2, 1fr); }
      .flow-steps::before { display: none; }
    }

    .page { display: none; }
    .page.active { display: flex; flex-direction: column; gap: 22px; }

    @media (max-width: 760px) {
      .kpis, .lower-grid, .flow-steps, .products-grid, .detail-grid, .spec-list { grid-template-columns: 1fr; }
      .topbar { flex-direction: column; }
      .main-shell { padding: 18px; }
      .sidebar { border-radius: 20px; }
    }
  </style>
</head>
<body>
  <div class="app">
    <aside class="sidebar">
      <div class="brand">e<span>Control</span></div>
      <nav class="menu" id="sidebarMenu">
        <button class="menu-item active" data-page="dashboard"><span class="menu-icon">◫</span>Dashboard</button>
        <button class="menu-item" data-page="orders"><span class="menu-icon">🧾</span>Order</button>
        <button class="menu-item" data-page="osl"><span class="menu-icon">⬢</span>OSL Operations</button>
        <button class="menu-item" data-page="products"><span class="menu-icon">✚</span>Products</button>
      </nav>
      <button class="sidebar-back" id="productsBackBtn"><span>←</span> Back to products</button>
      <div class="sidebar-subhead" id="sidebarCategoryHead" style="display:none;">Product categories</div>
      <div class="category-stack" id="sidebarCategoryStack" style="display:none;">
        <button class="category-button active" data-category="all">All Products <span>18</span></button>
        <button class="category-button" data-category="kits">Emergency Kits <span>5</span></button>
        <button class="category-button" data-category="ppe">PPE <span>7</span></button>
        <button class="category-button" data-category="respiratory">Respiratory <span>3</span></button>
        <button class="category-button" data-category="sterile">Sterile Accessories <span>3</span></button>
      </div>
      <div class="sidebar-footer">
        <span>Feed</span>
        <span>Alerts</span>
        <span>Logs</span>
      </div>
    </aside>

    <main class="main-shell">
      <section class="page active" id="page-dashboard">
        <section class="topbar">
          <div class="page-title">
            <h1>Dashboard</h1>
            <p>Unified warehouse analytics, throughput monitoring, and live order visibility in one clean control room.</p>
          </div>
          <div class="top-actions">
            <div class="pill">31 Jul 2026 → 03 Aug 2026</div>
            <div class="icon-btn">🔔</div>
            <div class="icon-btn">⌕</div>
            <div class="avatar">AL</div>
          </div>
        </section>

        <section class="tabs">
          <div class="tab active">Overview</div>
          <div class="tab">Dispatch</div>
          <div class="tab">Pending</div>
          <div class="tab">Completed</div>
          <div class="tab">Machine Health</div>
        </section>

        <section class="kpis">
          <div class="card kpi-card">
            <div>
              <div class="card-label">Orders Processed</div>
              <div class="card-value">2,634</div>
              <div class="trend">↗ 8.4% vs last week</div>
            </div>
            <div class="sparkline"><span style="height: 35%"></span><span style="height: 58%"></span><span style="height: 46%"></span><span style="height: 74%"></span><span style="height: 92%"></span><span style="height: 84%"></span></div>
          </div>
          <div class="card kpi-card">
            <div>
              <div class="card-label">Active Production Lines</div>
              <div class="card-value">12</div>
              <div class="trend">↗ 2 lines online</div>
            </div>
            <div class="sparkline"><span style="height: 26%"></span><span style="height: 32%"></span><span style="height: 50%"></span><span style="height: 63%"></span><span style="height: 70%"></span><span style="height: 76%"></span></div>
          </div>
          <div class="card kpi-card">
            <div>
              <div class="card-label">Shipping On-Time</div>
              <div class="card-value">94.2%</div>
              <div class="trend">↗ 1.9% improvement</div>
            </div>
            <div class="sparkline"><span style="height: 50%"></span><span style="height: 62%"></span><span style="height: 59%"></span><span style="height: 68%"></span><span style="height: 78%"></span><span style="height: 88%"></span></div>
          </div>
          <div class="card kpi-card">
            <div>
              <div class="card-label">Maintenance Alerts</div>
              <div class="card-value">07</div>
              <div class="trend warn">↗ 2 require review</div>
            </div>
            <div class="sparkline"><span style="height: 18%"></span><span style="height: 24%"></span><span style="height: 29%"></span><span style="height: 46%"></span><span style="height: 57%"></span><span style="height: 61%"></span></div>
          </div>
          <div class="card kpi-card">
            <div>
              <div class="card-label">Capacity Utilization</div>
              <div class="card-value">61%</div>
              <div class="trend">↗ 4.1% utilization</div>
            </div>
            <div class="sparkline"><span style="height: 38%"></span><span style="height: 41%"></span><span style="height: 45%"></span><span style="height: 52%"></span><span style="height: 64%"></span><span style="height: 72%"></span></div>
          </div>
          <div class="card kpi-card">
            <div>
              <div class="card-label">Low Stock SKUs</div>
              <div class="card-value">23</div>
              <div class="trend down">↘ 5 urgent shortages</div>
            </div>
            <div class="sparkline"><span style="height: 78%"></span><span style="height: 70%"></span><span style="height: 65%"></span><span style="height: 55%"></span><span style="height: 46%"></span><span style="height: 40%"></span></div>
          </div>
        </section>

        <section class="grid-analytics">
          <div class="card">
            <div class="card-title">
              <h3>Hourly Throughput</h3>
              <span class="subtle">Units processed</span>
            </div>
            <div class="bar-chart">
              <div class="bar-group"><div class="bar-stack"><div class="bar light" style="height: 38%"></div></div><div class="axis-label">02:00</div></div>
              <div class="bar-group"><div class="bar-stack"><div class="bar light" style="height: 52%"></div></div><div class="axis-label">04:00</div></div>
              <div class="bar-group"><div class="bar-stack"><div class="bar light" style="height: 44%"></div></div><div class="axis-label">06:00</div></div>
              <div class="bar-group"><div class="bar-stack"><div class="bar light" style="height: 57%"></div></div><div class="axis-label">08:00</div></div>
              <div class="bar-group"><div class="bar-stack"><div class="bar light" style="height: 76%"></div></div><div class="axis-label">10:00</div></div>
              <div class="bar-group"><div class="bar-stack"><div class="bar" style="height: 95%"></div></div><div class="axis-label">12:00</div></div>
              <div class="bar-group"><div class="bar-stack"><div class="bar light" style="height: 80%"></div></div><div class="axis-label">14:00</div></div>
              <div class="bar-group"><div class="bar-stack"><div class="bar light" style="height: 42%"></div></div><div class="axis-label">16:00</div></div>
              <div class="bar-group"><div class="bar-stack"><div class="bar light" style="height: 81%"></div></div><div class="axis-label">18:00</div></div>
              <div class="bar-group"><div class="bar-stack"><div class="bar light" style="height: 83%"></div></div><div class="axis-label">20:00</div></div>
              <div class="bar-group"><div class="bar-stack"><div class="bar light" style="height: 82%"></div></div><div class="axis-label">22:00</div></div>
              <div class="bar-group"><div class="bar-stack"><div class="bar light" style="height: 84%"></div></div><div class="axis-label">24:00</div></div>
            </div>
          </div>

          <div class="card">
            <div class="card-title">
              <h3>Regional Output Share</h3>
              <span class="subtle">Live allocation</span>
            </div>
            <div class="donut-wrap">
              <div class="donut"></div>
              <div class="legend">
                <div class="legend-row"><div class="legend-left"><span class="dot" style="background:#0f5bff"></span>North Hub</div><span>42%</span></div>
                <div class="legend-row"><div class="legend-left"><span class="dot" style="background:#4d86ff"></span>East Hub</div><span>27%</span></div>
                <div class="legend-row"><div class="legend-left"><span class="dot" style="background:#9fbdff"></span>South Hub</div><span>19%</span></div>
                <div class="legend-row"><div class="legend-left"><span class="dot" style="background:#dbe7ff"></span>Overflow</div><span>12%</span></div>
              </div>
            </div>
          </div>
        </section>

        <section class="flow-grid">
          <div class="card">
            <div class="card-title">
              <h3>Fulfillment Pipeline</h3>
              <span class="subtle">Clean replacement for the factory strip</span>
            </div>
            <div class="flow-steps">
              <div class="flow-step"><div><div class="step-icon">1</div><div class="step-name">Receiving</div><div class="step-meta">428 units inbound</div></div><div class="step-badge">Stable</div></div>
              <div class="flow-step"><div><div class="step-icon">2</div><div class="step-name">Sorting</div><div class="step-meta">96.4% accuracy</div></div><div class="step-badge">Healthy</div></div>
              <div class="flow-step"><div><div class="step-icon">3</div><div class="step-name">Assembly</div><div class="step-meta">12 active lines</div></div><div class="step-badge">Running</div></div>
              <div class="flow-step"><div><div class="step-icon">4</div><div class="step-name">Packing</div><div class="step-meta">189 queued cartons</div></div><div class="step-badge" style="background:#fff6e8;color:#f79009;">Watch</div></div>
              <div class="flow-step"><div><div class="step-icon">5</div><div class="step-name">Dispatch</div><div class="step-meta">41 trucks assigned</div></div><div class="step-badge">On Time</div></div>
            </div>
          </div>

          <div class="right-stack">
            <div class="card">
              <div class="card-title"><h3>Capacity Gauge</h3><span class="subtle">Line saturation</span></div>
              <div class="gauge"></div>
              <div class="gauge-value">61%</div>
              <div class="subtle" style="text-align:center; margin-top:4px;">Balanced load across production groups</div>
            </div>
            <div class="card">
              <div class="card-title"><h3>Inventory Pressure</h3><span class="subtle">SKU health</span></div>
              <div class="mini-bars">
                <div><div class="mini-bar-label"><span>GR150-1</span><span>75 / 100</span></div><div class="track"><div class="fill" style="width:75%"></div></div></div>
                <div><div class="mini-bar-label"><span>Stack A2</span><span>46 / 100</span></div><div class="track"><div class="fill" style="width:46%"></div></div></div>
                <div><div class="mini-bar-label"><span>Pack SF</span><span>23 / 100</span></div><div class="track"><div class="fill" style="width:23%"></div></div></div>
                <div><div class="mini-bar-label"><span>GR150-2</span><span>67 / 100</span></div><div class="track"><div class="fill" style="width:67%"></div></div></div>
              </div>
            </div>
          </div>
        </section>

        <section class="lower-grid">
          <div class="card"><div class="card-title"><h3>Throughput Trend</h3><span class="subtle">7 day view</span></div><div class="card-value" style="font-size:26px;">37,604</div><div class="line-chart"><svg viewBox="0 0 300 100" preserveAspectRatio="none"><polyline fill="none" stroke="#0f5bff" stroke-width="4" points="0,82 40,74 80,65 120,58 160,39 200,46 240,24 300,18" /></svg></div></div>
          <div class="card"><div class="card-title"><h3>Error Rate</h3><span class="subtle">Exceptions</span></div><div class="card-value" style="font-size:26px;">782</div><div class="line-chart"><svg viewBox="0 0 300 100" preserveAspectRatio="none"><polyline fill="none" stroke="#0f5bff" stroke-width="4" points="0,24 40,29 80,34 120,39 160,45 200,52 240,58 300,73" /></svg></div></div>
          <div class="card"><div class="card-title"><h3>Machine Efficiency</h3><span class="subtle">Pass rate</span></div><div class="card-value" style="font-size:26px;">31,323</div><div class="line-chart"><svg viewBox="0 0 300 100" preserveAspectRatio="none"><polyline fill="none" stroke="#0f5bff" stroke-width="4" points="0,85 40,80 80,62 120,47 160,32 200,24 240,19 300,11" /></svg></div></div>
          <div class="card"><div class="card-title"><h3>Workload Balance</h3><span class="subtle">Zone spread</span></div><div class="card-value" style="font-size:26px;">5,624</div><div class="line-chart"><svg viewBox="0 0 300 100" preserveAspectRatio="none"><polyline fill="none" stroke="#0f5bff" stroke-width="4" points="0,60 40,68 80,53 120,47 160,56 200,39 240,44 300,28" /></svg></div></div>
        </section>

        <section class="card table-card">
          <div class="card-title" style="padding:18px 20px 0;"><h3>Live Work Orders</h3><span class="subtle">Detailed admin layer from the first dashboard style</span></div>
          <table>
            <thead><tr><th>Order ID</th><th>Name</th><th>Address</th><th>Date</th><th>Value</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>#2632</td><td>Brooklyn Zoe</td><td>302 Slider Street, Rutland, VT</td><td>31 Jul 2026</td><td>$64.00</td><td><span class="status"><span class="dot" style="background:#f79009"></span>Pending</span></td><td>⚙</td></tr>
              <tr class="selected"><td>#2633</td><td>John McCormick</td><td>1095 Wiseman Street, Calmar, IA</td><td>01 Aug 2026</td><td>$35.00</td><td><span class="status"><span class="dot" style="background:#56d39b"></span>Dispatch</span></td><td>⚙</td></tr>
              <tr><td>#2634</td><td>Sandra Pugh</td><td>1640 Thorn Street, Salt City, CA</td><td>02 Aug 2026</td><td>$74.00</td><td><span class="status"><span class="dot" style="background:#b2bfd4"></span>Completed</span></td><td>⚙</td></tr>
              <tr><td>#2635</td><td>Verrie Herr</td><td>1488 Oak Drive, Dover, DE</td><td>02 Aug 2026</td><td>$82.00</td><td><span class="status"><span class="dot" style="background:#f79009"></span>Pending</span></td><td>⚙</td></tr>
              <tr><td>#2636</td><td>Mark Clark</td><td>195 Augusta Park, Nassau, NY</td><td>03 Aug 2026</td><td>$39.00</td><td><span class="status"><span class="dot" style="background:#17b26a"></span>Dispatch</span></td><td>⚙</td></tr>
              <tr><td>#2637</td><td>Rebekah Foster</td><td>1445 Park Boulevard, Biola, CA</td><td>03 Aug 2026</td><td>$67.00</td><td><span class="status"><span class="dot" style="background:#f04438"></span>Flagged</span></td><td>⚙</td></tr>
            </tbody>
          </table>
          <div class="footer-row"><span>Showing 01–06 of 28 orders</span><span>‹ 1 2 3 4 ›</span></div>
        </section>
      </section>

      <section class="page" id="page-orders">
        <section class="topbar">
          <div class="page-title">
            <h1>Order</h1>
            <p>28 orders found</p>
          </div>
          <div class="top-actions">
            <div class="pill">31 Jul 2026</div>
            <div class="pill">03 Aug 2026</div>
            <div class="icon-btn">🔔</div>
            <div class="icon-btn">⌕</div>
            <div class="avatar">AL</div>
          </div>
        </section>

        <div id="ordersListView">
          <section class="tabs">
            <div class="tab active">All orders</div>
            <div class="tab">Dispatch</div>
            <div class="tab">Pending</div>
            <div class="tab">Complete</div>
          </section>

          <section class="card table-card">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>#2632</td>
                  <td>Brooklyn Zoe</td>
                  <td>302 Slider Street, Rutland, VT 05701</td>
                  <td>31 Jul 2026</td>
                  <td>$64.00</td>
                  <td><span class="status"><span class="dot" style="background:#f79009"></span>Pending</span></td>
                  <td><button class="link-btn order-open-btn">Open</button></td>
                </tr>
                <tr class="selected">
                  <td>#2633</td>
                  <td>John McCormick</td>
                  <td>1095 Wiseman Street, Calmar, IA 52132</td>
                  <td>01 Aug 2026</td>
                  <td>$35.00</td>
                  <td><span class="status"><span class="dot" style="background:#56d39b"></span>Dispatch</span></td>
                  <td><button class="link-btn order-open-btn">Open</button></td>
                </tr>
                <tr>
                  <td>#2634</td>
                  <td>Sandra Pugh</td>
                  <td>1640 Thorn Street, Salt City, CA 88116</td>
                  <td>02 Aug 2026</td>
                  <td>$74.00</td>
                  <td><span class="status"><span class="dot" style="background:#b2bfd4"></span>Completed</span></td>
                  <td><button class="link-btn order-open-btn">Open</button></td>
                </tr>
                <tr>
                  <td>#2635</td>
                  <td>Verrie Herr</td>
                  <td>1488 Oak Drive, Dover, DE 19906</td>
                  <td>02 Aug 2026</td>
                  <td>$82.00</td>
                  <td><span class="status"><span class="dot" style="background:#f79009"></span>Pending</span></td>
                  <td><button class="link-btn order-open-btn">Open</button></td>
                </tr>
                <tr>
                  <td>#2636</td>
                  <td>Mark Clark</td>
                  <td>195 Augusta Park, Nassau, NY 10062</td>
                  <td>03 Aug 2026</td>
                  <td>$39.00</td>
                  <td><span class="status"><span class="dot" style="background:#17b26a"></span>Dispatch</span></td>
                  <td><button class="link-btn order-open-btn">Open</button></td>
                </tr>
                <tr>
                  <td>#2637</td>
                  <td>Rebekah Foster</td>
                  <td>1445 Park Boulevard, Biola, CA 93606</td>
                  <td>03 Aug 2026</td>
                  <td>$67.00</td>
                  <td><span class="status"><span class="dot" style="background:#f04438"></span>Pending</span></td>
                  <td><button class="link-btn order-open-btn">Open</button></td>
                </tr>
              </tbody>
            </table>
            <div class="footer-row"><span>Showing 01–06 of 28</span><span>‹ 1 2 3 4 ›</span></div>
          </section>
        </div>

        <section class="who-shell" id="orderDetailView">
          <div class="who-banner">
            <div>
              <h2 style="margin:0; font-size:28px;">Order request</h2>
              <p style="margin:8px 0 0; color:var(--muted);">Populated from checkout. Requester can adjust within the validation window before OSL review starts.</p>
            </div>
            <div class="who-header-actions">
              <button class="ghost-btn" id="orderBackBtn">Back to orders</button>
              <button class="link-btn">Save draft</button>
              <button class="link-btn primary" id="sendOrderBtn">Validate & send</button>
            </div>
          </div>

          <div class="lock-note"><b style="display:block; margin-bottom:6px;">Workflow guardrail</b>Mandatory fields must validate before submit. After submission, the request stays editable for 1 hour. Once OSL Operations approves it, the request locks and only stock release can proceed.</div>

          <div class="timeline" id="requestTimeline">
            <div class="timeline-step done"><h4>Checkout completed</h4><p>Items transferred from product catalog into a draft order request.</p></div>
            <div class="timeline-step active"><h4>Requester adjustment window</h4><p>1 hour window for edits, PTEAO, shipment data, and requester references.</p></div>
            <div class="timeline-step"><h4>OSL Operations review</h4><p>Operations validates and routes approved requests to stock release.</p></div>
            <div class="timeline-step"><h4>Stock release</h4><p>Warehouse release is generated after approval.</p></div>
          </div>

          <div class="order-detail-grid">
            <div class="card">
              <div class="card-title"><h3>Request status</h3><span class="subtle" id="orderStatusRef">Order #OR-24-001</span></div>
              <div class="status-pills">
                <span class="status-pill" id="orderStatusPill">Draft validated</span>
                <span class="status-pill" id="orderWindowPill">1h adjustment window</span>
                <span class="status-pill">Awaiting OSL review</span>
              </div>
            </div>
            <div class="card">
              <div class="card-title"><h3>Checkout summary</h3><span class="subtle">Current request</span></div>
              <div class="summary-list">
                <div class="summary-row"><span>Cart items</span><strong id="orCartItems">1 line</strong></div>
                <div class="summary-row"><span>Units</span><strong id="orUnits">2</strong></div>
                <div class="summary-row"><span>Estimated value</span><strong id="orValue">$310</strong></div>
                <div class="summary-row total"><span>Route</span><strong>Order Request → OSL Operations</strong></div>
              </div>
            </div>
          </div>

          <div class="who-form">
            <div class="who-topline">
              <div class="who-logo">World Health Organization</div>
              <div class="who-title">Emergency</div>
              <div class="who-ref" id="orderRefTop">REF: OR_24-001_Kenya</div>
            </div>
            <div class="who-grid">
              <div class="who-cell yellow"><b>From (initiator):</b><br><span id="orInitiator">OSL Emergency Response Unit</span></div>
              <div class="who-cell label right"><b>Mode of shipment:</b><br><span id="orShipmentMode">Air freight</span></div>
              <div class="who-cell blue center"><b>PTEAO</b><br><span id="orPteao">Pending input</span></div>

              <div class="who-cell yellow"><b>Consignee address:</b><br><span id="orConsignee">World Health Organization<br>Office of the WHO Representative<br>Kenya Response Desk</span></div>
              <div class="who-cell label right"><b>Nb of lines:</b><br><span id="orLineCount">1</span></div>
              <div class="who-cell blue"><b>Estimated total cost:</b><br><span id="orTotalCost">USD 310.00</span></div>

              <div class="who-cell gray"><b>To (processing unit):</b><br>OSL Operations Desk</div>
              <div class="who-cell label right"><b>Estimated goods cost:</b><br><span id="orGoodsCost">USD 298.00</span></div>
              <div class="who-cell blue"><b>Requester ref:</b><br><span id="orRequesterRef">REQ-EM-001</span></div>

              <div class="who-cell"><b>Notify party:</b><br><span id="orNotify">osl.emergency@who.int<br>ava.lewis@who.int<br>wro.logistics@who.int</span></div>
              <div class="who-cell label right"><b>Requested ready on:</b><br><span id="orReadyDate">05-Aug-26</span></div>
              <div class="who-cell blue"><b>Confirmed ready date:</b><br>Pending OSL</div>

              <div class="who-cell"><b>Shipping dimensions:</b><br><span id="orDimensions">Auto-generated from selected item and quantity.</span></div>
              <div class="who-cell label right"><b>Estimated weight (kg):</b><br><span id="orWeight">24</span></div>
              <div class="who-cell blue"><b>Confirmed weight:</b><br>Pending OSL</div>

              <div class="who-cell"><b>Remarks:</b><br><span id="orRemarks">Draft created from checkout. Awaiting requester validation and submit.</span></div>
              <div class="who-cell label right"><b>Estimated volume (cbm):</b><br><span id="orVolume">0.8</span></div>
              <div class="who-cell blue"><b>Confirmed volume:</b><br>Pending OSL</div>
            </div>
            <div class="who-section-title">Order request line items</div>
            <div class="who-items">
              <table>
                <thead>
                  <tr><th>#</th><th>WHO code</th><th>WHO description</th><th>UoM</th><th>Quantity</th><th>Unit price USD</th><th>Total amount</th><th>Remarks</th></tr>
                </thead>
                <tbody id="orderItemsBody">
                  <tr><td>1</td><td>ERK-204</td><td>Emergency Response Kit</td><td>kit</td><td>2</td><td>149.00</td><td>298.00</td><td>checkout populated</td></tr>
                </tbody>
              </table>
            </div>
            <div class="who-signoff">
              <div class="who-sign"><span>In charge of supply</span></div>
              <div class="who-sign"><span>Reviewer</span></div>
              <div class="who-sign"><span>Approver</span></div>
            </div>
          </div>
        </section>
      </section>

      <section class="page" id="page-osl">
        <section class="topbar">
          <div class="page-title">
            <h1>OSL Operations</h1>
            <p>Operations queue, approval view, and stock release generation for validated order requests.</p>
          </div>
          <div class="top-actions">
            <div class="pill">Live workflow</div>
            <div class="icon-btn">🔔</div>
            <div class="icon-btn">⌕</div>
            <div class="avatar">AL</div>
          </div>
        </section>

        <div class="osl-grid">
          <div class="card osl-queue-table">
            <div class="card-title"><h3>Pending operations queue</h3><span class="subtle">Validated requests</span></div>
            <table>
              <thead><tr><th>Ref</th><th>Requester</th><th>Country</th><th>Status</th><th>Window</th><th>Action</th></tr></thead>
              <tbody>
                <tr class="selected"><td id="oslQueueRef">OR_24-001_Kenya</td><td id="oslQueueRequester">Ava Lewis</td><td>Kenya</td><td><span class="status"><span class="dot" style="background:#17b26a"></span>Ready for review</span></td><td id="oslQueueWindow">1h window</td><td><button class="link-btn primary" id="approveToStockBtn">Send to stock release</button></td></tr>
                <tr><td>OR_24-008_Uganda</td><td>Leah Morris</td><td>Uganda</td><td><span class="status"><span class="dot" style="background:#f79009"></span>Adjustment window</span></td><td>18 min left</td><td><button class="link-btn">Monitor</button></td></tr>
              </tbody>
            </table>
          </div>
          <div class="card">
            <div class="card-title"><h3>Process timeline</h3><span class="subtle">Real-time flow</span></div>
            <div class="timeline" id="oslTimeline" style="grid-template-columns:1fr;">
              <div class="timeline-step done"><h4>Requester sent validated order</h4><p id="oslTimelineRef">OR_24-001_Kenya entered the OSL lane with complete mandatory fields.</p></div>
              <div class="timeline-step active"><h4>OSL review in progress</h4><p>Operations confirms requester ref, shipment method, consignee data, and item lines.</p></div>
              <div class="timeline-step"><h4>Approval & stock release</h4><p>Once approved, the stock release document is generated and request becomes locked.</p></div>
            </div>
            <div class="tiny-note" style="margin-top:14px;">No send-back loop here. Clarifications stay inside ops review while request integrity is preserved.</div>
          </div>
        </div>

        <div class="who-form" id="stockReleaseForm">
          <div class="who-topline">
            <div class="who-logo">World Health Organization</div>
            <div class="who-title">Material stock release</div>
            <div class="who-ref" id="srRefTop">REF: SR_from_OR_24-001_Kenya</div>
          </div>
          <div class="who-grid">
            <div class="who-cell yellow"><b>From:</b><br><span id="srFrom">AFRO Emergency Hub Nairobi, Sierra Leone Country Office</span></div>
            <div class="who-cell label right"><b>Mode of shipment:</b><br><span id="srMode">Air freight</span></div>
            <div class="who-cell blue center"><b>Date</b><br><span id="srDate">05-Aug-26</span></div>

            <div class="who-cell"><b>To / processing unit:</b><br>OSL warehouse release desk</div>
            <div class="who-cell label right"><b>Estimated weight (kg):</b><br><span id="srWeight">24</span></div>
            <div class="who-cell blue"><b>Requested ref:</b><br><span id="srRequesterRef">REQ-EM-001</span></div>

            <div class="who-cell"><b>Notify party:</b><br><span id="srNotify">NBO hub dispatch, field logistics, warehouse control</span></div>
            <div class="who-cell label right"><b>Estimated volume (cbm):</b><br><span id="srVolume">0.8</span></div>
            <div class="who-cell blue"><b>Conf. ready date:</b><br><span id="srReadyDate">05-Aug-26</span></div>

            <div class="who-cell"><b>Shipping dimensions:</b><br><span id="srDimensions">Release against approved OR_24-001. Item lines and quantity carried from approved order request.</span></div>
            <div class="who-cell label right"><b>Freight charges payable:</b><br>WHO</div>
            <div class="who-cell gray"><b>Shipping documents required:</b><br>packing list, release note, airway bill copy</div>
          </div>
          <div class="who-section-title">Released stock lines</div>
          <div class="who-items">
            <table>
              <thead>
                <tr><th>#</th><th>WHO code</th><th>WHO description</th><th>UoM</th><th>Qty</th><th>Batch</th><th>Expiry</th><th>Unit price</th><th>Total price</th><th>Comments</th></tr>
              </thead>
              <tbody id="stockReleaseBody">
                <tr><td>1</td><td>ERK-204</td><td>Emergency Response Kit</td><td>kit</td><td>2</td><td>EK-204-B1</td><td>2029-03</td><td>149.00</td><td>298.00</td><td>awaiting approval</td></tr>
              </tbody>
            </table>
          </div>
          <div class="who-signoff">
            <div class="who-sign"><span>In charge of supply</span></div>
            <div class="who-sign"><span>Control/regulatory</span></div>
            <div class="who-sign"><span>Approver</span></div>
          </div>
        </div>
      </section>

      <section class="page" id="page-products">
        <section class="topbar">
          <div class="page-title">
            <h1>Products</h1>
            <p>Medical supply catalog with emergency kits, PPE, detail view, and multi-currency pricing.</p>
          </div>
          <div class="top-actions">
            <div class="pill">Medical Inventory</div>
            <div class="icon-btn">🔔</div>
            <div class="icon-btn">⌕</div>
            <div class="avatar">AL</div>
          </div>
        </section>

        <div class="products-shell" id="productsCatalogShell">
        <section class="products-hero">
          <div class="hero-banner card" style="border:none;">
            <div class="hero-copy">
              <div class="eyebrow">Medical products • sterile supply</div>
              <h2>Smart care inventory with a premium clinical shelf.</h2>
              <p>Borrowing that glossy product-landing drama from your references, but kept disciplined inside the same dashboard page width.</p>
              <div class="hero-actions">
                <button class="hero-btn primary">Browse catalog</button>
                <button class="hero-btn">Emergency kits</button>
              </div>
            </div>
            <div class="hero-visual">
              <div class="device-screen"><div class="device-ui"><div class="ui-line" style="width:56%"></div><div class="ui-box"></div><div class="ui-line" style="width:88%"></div><div class="ui-line" style="width:72%"></div><div class="ui-line" style="width:64%"></div></div></div>
              <div class="device-screen small"><div class="device-ui" style="padding:12px; gap:8px;"><div class="ui-box" style="height:28px;"></div><div class="ui-line" style="width:70%"></div><div class="ui-line" style="width:48%"></div></div></div>
            </div>
          </div>

          <div class="hero-side">
            <div class="card spotlight-card"><div class="product-art kit"></div><div class="spotlight-copy"><h3>Emergency Health Kits</h3><p>Trauma-ready, sealed, category-labeled kits for field response, clinics, and rapid dispatch stations.</p><div class="chip-row"><span class="chip">IFAK</span><span class="chip">Trauma</span><span class="chip">Rapid Pack</span></div></div></div>
            <div class="card spotlight-card"><div class="product-art mask"></div><div class="spotlight-copy"><h3>PPE Essentials</h3><p>Mask, gloves, shields, gowns, and sterile barrier stock with shelf-life and usage metadata.</p><div class="chip-row"><span class="chip">N95</span><span class="chip">Gloves</span><span class="chip">Sterile</span></div></div></div>
          </div>
        </section>

        <section class="products-layout">
          <aside class="card filters-card">
            <div class="search-box">⌕ Search products, SKUs, kits</div>
            <div class="filter-group">
              <div class="filter-title">Categories</div>
              <div class="category-link active">All Products <span>18</span></div>
              <div class="category-link">Emergency Health Kits <span>5</span></div>
              <div class="category-link">PPE <span>7</span></div>
              <div class="category-link">Respiratory Care <span>3</span></div>
              <div class="category-link">Sterile Accessories <span>3</span></div>
            </div>
            <div class="filter-group">
              <div class="filter-title">Currency</div>
              <div class="currency-pills">
                <button class="currency-pill active" data-currency="USD">USD</button>
                <button class="currency-pill" data-currency="EUR">EUR</button>
                <button class="currency-pill" data-currency="GBP">GBP</button>
                <button class="currency-pill" data-currency="AED">AED</button>
              </div>
            </div>
            <div class="note-box"><b>Catalog note</b>Tap a product card and the detail panel updates with summary, usage guidance, dosage note where relevant, and pricing in the selected currency.</div>
          </aside>

          <div class="products-main">
            <div class="products-head"><div><h3 style="margin:0; font-size:24px;">Featured medical products</h3><div class="subtle" style="margin-top:6px;">Styled with the glossy promo energy of your references, but locked to the same dashboard width.</div></div><div class="chip-row"><span class="chip">Clinic Stock</span><span class="chip">Emergency Ready</span><span class="chip">Multi-currency</span></div></div>
            <div class="products-grid">
              <article class="card product-card active-product" data-product="kit" data-price-usd="149" data-price-eur="137" data-price-gbp="118" data-price-aed="547"><div class="product-top"><span class="badge">Emergency kit</span><div class="product-shape kit"></div></div><div class="product-body"><div class="product-meta"><div><h4 class="product-name">Emergency Response Kit</h4><div class="sku">SKU ERK-204 • Sealed case</div></div><div class="price-block"><strong class="money">$149</strong><span>per kit</span></div></div><div class="spec-list"><div>Category<b>Emergency Health Kits</b></div><div>Stock<b>124 Units</b></div><div>Use case<b>Trauma & field care</b></div><div>Shelf life<b>36 months</b></div></div><div class="card-actions"><button class="link-btn">Summary</button><button class="link-btn primary">View details</button></div></div></article>
              <article class="card product-card" data-product="mask" data-price-usd="42" data-price-eur="39" data-price-gbp="33" data-price-aed="154"><div class="product-top"><span class="badge">PPE</span><div class="product-shape mask"></div></div><div class="product-body"><div class="product-meta"><div><h4 class="product-name">N95 Protective Masks</h4><div class="sku">SKU PPE-118 • Box of 20</div></div><div class="price-block"><strong class="money">$42</strong><span>per box</span></div></div><div class="spec-list"><div>Category<b>PPE</b></div><div>Stock<b>362 Boxes</b></div><div>Use case<b>Airborne barrier</b></div><div>Grade<b>NIOSH style</b></div></div><div class="card-actions"><button class="link-btn">Summary</button><button class="link-btn primary">View details</button></div></div></article>
              <article class="card product-card" data-product="glove" data-price-usd="28" data-price-eur="26" data-price-gbp="22" data-price-aed="103"><div class="product-top"><span class="badge">PPE</span><div class="product-shape glove"></div></div><div class="product-body"><div class="product-meta"><div><h4 class="product-name">Sterile Nitrile Gloves</h4><div class="sku">SKU PPE-441 • Box of 100</div></div><div class="price-block"><strong class="money">$28</strong><span>per box</span></div></div><div class="spec-list"><div>Category<b>PPE</b></div><div>Stock<b>510 Boxes</b></div><div>Use case<b>General examination</b></div><div>Powder-free<b>Yes</b></div></div><div class="card-actions"><button class="link-btn">Summary</button><button class="link-btn primary">View details</button></div></div></article>
            </div>
                      </div>
        </section>
      </div>

      <section class="products-detail-page" id="productsDetailPage">
        <div class="card detail-visual"><div class="eyebrow" style="position:absolute; left:20px; top:20px; color:var(--blue); background:rgba(15,91,255,0.08);">Item detail</div><div class="product-shape kit" id="detailShape"></div></div>
        <div class="order-panel">
          <div class="card detail-summary"><div class="detail-title"><h2 id="detailName">Emergency Response Kit</h2><p id="detailSummary">Comprehensive rapid-response medical kit packed for trauma stabilization, wound control, and fast deployment in clinics, ambulances, and field teams.</p></div><div class="products-head" style="padding:0;"><div class="price-block" style="text-align:left;"><strong id="detailPrice">$149</strong><span id="detailPriceMeta">per kit • tax excluded</span></div><span class="chip" id="detailCategory">Emergency Health Kits</span></div><div class="detail-grid"><div class="detail-cell"><span>Usage</span><strong id="detailUsage">Acute injury support, wound dressing, bleeding control, and emergency patient prep.</strong></div><div class="detail-cell"><span>Dosage / note</span><strong id="detailDosage">Not a drug product. Use according to included clinical protocol and local medical guidance.</strong></div><div class="detail-cell"><span>Included</span><strong id="detailIncluded">Bandages, sterile gauze, tourniquet, shears, tape, gloves, CPR mask, saline pods.</strong></div><div class="detail-cell"><span>Storage</span><strong id="detailStorage">Store in a cool dry area. Seal integrity should be checked before deployment.</strong></div></div><div><div class="filter-title" style="margin-bottom:10px;">Recommended usage</div><ul class="usage-list" id="detailList"><li>Deploy for trauma preparation, scene response, or clinic rapid intake.</li><li>Inspect seal, expiry labels, and sterile contents before assignment.</li><li>Restock immediately after use to maintain emergency readiness.</li></ul></div></div>
          <div class="card">
            <div class="card-title"><h3>Make order</h3><span class="subtle">Procurement form</span></div>
            <div class="order-grid">
              <div class="field"><label>Department</label><select><option>Emergency Unit</option><option>ICU</option><option>General Ward</option><option>Field Team</option></select></div>
              <div class="field"><label>Priority</label><select><option>Normal</option><option>Urgent</option><option>Critical</option></select></div>
              <div class="field"><label>Quantity</label><div class="qty-stepper"><button type="button" id="qtyMinus">−</button><span class="qty-value" id="qtyValue">2</span><button type="button" id="qtyPlus">+</button></div></div>
              <div class="field"><label>Currency</label><div class="currency-pills"><button class="currency-pill active" data-currency="USD">USD</button><button class="currency-pill" data-currency="EUR">EUR</button><button class="currency-pill" data-currency="GBP">GBP</button><button class="currency-pill" data-currency="AED">AED</button></div></div>
              <div class="field"><label>Requester name</label><input type="text" value="Ava Lewis" /></div>
              <div class="field"><label>Delivery date</label><input type="date" value="2026-08-05" /></div>
              <div class="field" style="grid-column:1 / -1;"><label>Notes</label><textarea>Need sealed units for rapid deployment stock. Confirm expiry window longer than 24 months.</textarea></div>
            </div>
          </div>
          <div class="card">
            <div class="card-title"><h3>Order summary</h3><span class="subtle">Live estimate</span></div>
            <div class="summary-list">
              <div class="summary-row"><span>Item</span><strong id="summaryItem">Emergency Response Kit</strong></div>
              <div class="summary-row"><span>Unit price</span><strong id="summaryUnitPrice">$149</strong></div>
              <div class="summary-row"><span>Quantity</span><strong id="summaryQty">2</strong></div>
              <div class="summary-row muted"><span>Handling</span><strong id="summaryHandling">$12</strong></div>
              <div class="summary-row total"><span>Total</span><strong id="summaryTotal">$310</strong></div>
            </div>
            <div class="order-actions" style="margin-top:18px;"><button class="link-btn primary" id="placeOrderBtn">Checkout to order request</button><button class="ghost-btn" id="detailBackBtn">Back to catalog</button></div>
          </div>
        </div>
      </section>
      </main>
  </div>
  <script>
    const menuItems = document.querySelectorAll('.menu-item');
    const pages = document.querySelectorAll('.page');
    const currencyPills = document.querySelectorAll('.currency-pill');
    const productCards = document.querySelectorAll('.product-card');
    const categoryButtons = document.querySelectorAll('.category-button');
    const productsCatalogShell = document.getElementById('productsCatalogShell');
    const productsDetailPage = document.getElementById('productsDetailPage');
    const productsBackBtn = document.getElementById('productsBackBtn');
    const detailBackBtn = document.getElementById('detailBackBtn');
    const sidebarCategoryHead = document.getElementById('sidebarCategoryHead');
    const sidebarCategoryStack = document.getElementById('sidebarCategoryStack');
    const sidebar = document.querySelector('.sidebar');
    const qtyValue = document.getElementById('qtyValue');
    const qtyMinus = document.getElementById('qtyMinus');
    const qtyPlus = document.getElementById('qtyPlus');
    const ordersListView = document.getElementById('ordersListView');
    const orderDetailView = document.getElementById('orderDetailView');
    const orderBackBtn = document.getElementById('orderBackBtn');
    const orderOpenBtns = document.querySelectorAll('.order-open-btn');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const sendOrderBtn = document.getElementById('sendOrderBtn');
    const approveToStockBtn = document.getElementById('approveToStockBtn');

    const orderBindings = {
      refTop: document.getElementById('orderRefTop'),
      statusRef: document.getElementById('orderStatusRef'),
      initiator: document.getElementById('orInitiator'),
      shipmentMode: document.getElementById('orShipmentMode'),
      pteao: document.getElementById('orPteao'),
      consignee: document.getElementById('orConsignee'),
      lineCount: document.getElementById('orLineCount'),
      totalCost: document.getElementById('orTotalCost'),
      goodsCost: document.getElementById('orGoodsCost'),
      requesterRef: document.getElementById('orRequesterRef'),
      notify: document.getElementById('orNotify'),
      readyDate: document.getElementById('orReadyDate'),
      dimensions: document.getElementById('orDimensions'),
      weight: document.getElementById('orWeight'),
      volume: document.getElementById('orVolume'),
      remarks: document.getElementById('orRemarks'),
      itemsBody: document.getElementById('orderItemsBody'),
      cartItems: document.getElementById('orCartItems'),
      units: document.getElementById('orUnits'),
      value: document.getElementById('orValue'),
      queueRef: document.getElementById('oslQueueRef'),
      queueRequester: document.getElementById('oslQueueRequester'),
      queueWindow: document.getElementById('oslQueueWindow'),
      timelineRef: document.getElementById('oslTimelineRef'),
      srRefTop: document.getElementById('srRefTop'),
      srRequesterRef: document.getElementById('srRequesterRef'),
      srReadyDate: document.getElementById('srReadyDate'),
      srWeight: document.getElementById('srWeight'),
      srVolume: document.getElementById('srVolume'),
      srDimensions: document.getElementById('srDimensions'),
      srNotify: document.getElementById('srNotify'),
      srMode: document.getElementById('srMode'),
      srDate: document.getElementById('srDate'),
      stockBody: document.getElementById('stockReleaseBody')
    };

    const appState = {
      orderCounter: 1,
      currentOrder: {
        ref: 'OR_24-001_Kenya',
        requester: 'Ava Lewis',
        requesterRef: 'REQ-EM-001',
        pteao: 'Pending input',
        shipmentMode: 'Air freight',
        readyDate: '05-Aug-26',
        country: 'Kenya',
        status: 'Draft validated',
        itemCode: 'ERK-204',
        itemName: 'Emergency Response Kit',
        uom: 'kit',
        qty: 2,
        unitPrice: 149,
        total: 298,
        handling: 12,
        grandTotal: 310,
        weight: 24,
        volume: 0.8,
        notes: 'Draft created from checkout. Awaiting requester validation and submit.'
      }
    };

    const productData = {
      kit: {
        name: 'Emergency Response Kit',
        category: 'Emergency Health Kits',
        summary: 'Comprehensive rapid-response medical kit packed for trauma stabilization, wound control, and fast deployment in clinics, ambulances, and field teams.',
        usage: 'Acute injury support, wound dressing, bleeding control, and emergency patient prep.',
        dosage: 'Not a drug product. Use according to included clinical protocol and local medical guidance.',
        included: 'Bandages, sterile gauze, tourniquet, shears, tape, gloves, CPR mask, saline pods.',
        storage: 'Store in a cool dry area. Seal integrity should be checked before deployment.',
        priceMeta: 'per kit • tax excluded',
        list: [
          'Deploy for trauma preparation, scene response, or clinic rapid intake.',
          'Inspect seal, expiry labels, and sterile contents before assignment.',
          'Restock immediately after use to maintain emergency readiness.'
        ],
        shape: 'kit'
      },
      mask: {
        name: 'N95 Protective Masks',
        category: 'PPE',
        summary: 'High-filtration respiratory masks for airborne barrier protection in clinical, laboratory, and public-health response settings.',
        usage: 'Single-user respiratory barrier for procedural and exposure-control environments.',
        dosage: 'Non-pharmaceutical PPE item. Follow fit-check instructions before each use and facility replacement policy.',
        included: '20 folded masks, fit guide insert, lot tracking label, compliance card.',
        storage: 'Keep sealed in a dry room away from direct sunlight and compression damage.',
        priceMeta: 'per box • tax excluded',
        list: [
          'Use for patient-facing workflows and respiratory-risk environments.',
          'Discard immediately after visible contamination or integrity loss.',
          'Verify fit and seal before entering controlled care zones.'
        ],
        shape: 'mask'
      },
      glove: {
        name: 'Sterile Nitrile Gloves',
        category: 'PPE',
        summary: 'Powder-free nitrile examination gloves with sterile presentation for controlled handling and clean procedural work.',
        usage: 'Barrier protection during examination, dressing changes, sample handling, and sterile prep.',
        dosage: 'Non-pharmaceutical PPE item. Select correct size and replace between patients or contaminated tasks.',
        included: '100 gloves per box, size labels, lot number tracking, sterile handling insert.',
        storage: 'Store below excess heat, keep away from puncture sources, and rotate stock by lot.',
        priceMeta: 'per box • tax excluded',
        list: [
          'Use a fresh pair for each patient contact and exposure-prone task.',
          'Avoid use if packaging is damaged or sterile status is compromised.',
          'Dispose according to clinical waste protocol after contaminated use.'
        ],
        shape: 'glove'
      }
    };

    const currencyConfig = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      AED: 'AED '
    };

    let currentCurrency = 'USD';
    let currentQty = 2;
    let currentProductKey = 'kit';

    function activatePage(pageName) {
      menuItems.forEach((item) => {
        item.classList.toggle('active', item.dataset.page === pageName);
      });
      pages.forEach((page) => {
        page.classList.toggle('active', page.id === `page-${pageName}`);
      });

      const inProducts = pageName === 'products';
      const inOrders = pageName === 'orders';
      sidebar.classList.toggle('compact', inProducts);
      sidebarCategoryHead.style.display = inProducts ? 'block' : 'none';
      sidebarCategoryStack.style.display = inProducts ? 'grid' : 'none';
      if (inOrders) {
        productsBackBtn.classList.remove('show');
        ordersListView.style.display = '';
        orderDetailView.classList.remove('active');
      }

      if (inProducts) {
        showProductCatalog();
      }
    }

    function formatPrice(value, currency) {
      return `${currencyConfig[currency]}${value}`;
    }

    function updateOrderSummary() {
      const activeCard = document.querySelector('.product-card.active-product');
      if (!activeCard) return;

      const price = Number(activeCard.dataset[`price${currentCurrency.toLowerCase()}`]);
      const handling = Math.max(8, Math.round(price * 0.08));
      const total = price * currentQty + handling;

      document.getElementById('summaryItem').textContent = productData[currentProductKey].name;
      document.getElementById('summaryUnitPrice').textContent = formatPrice(price, currentCurrency);
      document.getElementById('summaryQty').textContent = currentQty;
      document.getElementById('summaryHandling').textContent = formatPrice(handling, currentCurrency);
      document.getElementById('summaryTotal').textContent = formatPrice(total, currentCurrency);
      qtyValue.textContent = currentQty;
    }

    function updateDetail(card) {
      productCards.forEach((item) => {
        item.classList.toggle('active-product', item === card);
      });

      currentProductKey = card.dataset.product;
      const data = productData[currentProductKey];
      const price = card.dataset[`price${currentCurrency.toLowerCase()}`];

      document.getElementById('detailName').textContent = data.name;
      document.getElementById('detailSummary').textContent = data.summary;
      document.getElementById('detailCategory').textContent = data.category;
      document.getElementById('detailUsage').textContent = data.usage;
      document.getElementById('detailDosage').textContent = data.dosage;
      document.getElementById('detailIncluded').textContent = data.included;
      document.getElementById('detailStorage').textContent = data.storage;
      document.getElementById('detailPrice').textContent = formatPrice(price, currentCurrency);
      document.getElementById('detailPriceMeta').textContent = data.priceMeta;
      document.getElementById('detailList').innerHTML = data.list.map((item) => `<li>${item}</li>`).join('');
      document.getElementById('detailShape').className = `product-shape ${data.shape}`;

      updateOrderSummary();
    }

    function openProductDetail(card) {
      updateDetail(card);
      productsCatalogShell.classList.add('hidden');
      productsDetailPage.classList.add('active');
      productsBackBtn.classList.add('show');
    }

    function showProductCatalog() {
      productsCatalogShell.classList.remove('hidden');
      productsDetailPage.classList.remove('active');
      productsBackBtn.classList.remove('show');
    }

    function updateCurrency(currency) {
      currentCurrency = currency;
      currencyPills.forEach((pill) => {
        pill.classList.toggle('active', pill.dataset.currency === currency);
      });

      productCards.forEach((card) => {
        const price = card.dataset[`price${currency.toLowerCase()}`];
        const money = card.querySelector('.money');
        if (money) money.textContent = formatPrice(price, currency);
      });

      const activeCard = document.querySelector('.product-card.active-product');
      if (activeCard) updateDetail(activeCard);
    }

    function filterProducts(category) {
      categoryButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.category === category);
      });

      productCards.forEach((card) => {
        const product = card.dataset.product;
        const show = category === 'all' ||
          (category === 'kits' && product === 'kit') ||
          (category === 'ppe' && (product === 'mask' || product === 'glove'));
        card.style.display = show ? '' : 'none';
      });
    }

    function renderCurrentOrder() {
      const o = appState.currentOrder;
      orderBindings.refTop.textContent = `REF: ${o.ref}`;
      orderBindings.statusRef.textContent = `Order #${o.ref}`;
      orderBindings.initiator.textContent = 'OSL Emergency Response Unit';
      orderBindings.shipmentMode.textContent = o.shipmentMode;
      orderBindings.pteao.textContent = o.pteao;
      orderBindings.consignee.innerHTML = `World Health Organization<br>Office of the WHO Representative<br>${o.country} Response Desk`;
      orderBindings.lineCount.textContent = '1';
      orderBindings.totalCost.textContent = `USD ${o.grandTotal.toFixed(2)}`;
      orderBindings.goodsCost.textContent = `USD ${o.total.toFixed(2)}`;
      orderBindings.requesterRef.textContent = o.requesterRef;
      orderBindings.notify.innerHTML = `osl.emergency@who.int<br>${o.requester.toLowerCase().replace(/ /g,'.')}@who.int<br>wro.logistics@who.int`;
      orderBindings.readyDate.textContent = o.readyDate;
      orderBindings.dimensions.textContent = `${o.qty} ${o.uom} / estimated ${o.weight} kg / ${o.volume} cbm. Auto-populated from checkout selection.`;
      orderBindings.weight.textContent = o.weight;
      orderBindings.volume.textContent = o.volume;
      orderBindings.remarks.textContent = o.notes;
      orderBindings.itemsBody.innerHTML = `<tr><td>1</td><td>${o.itemCode}</td><td>${o.itemName}</td><td>${o.uom}</td><td>${o.qty}</td><td>${o.unitPrice.toFixed(2)}</td><td>${o.total.toFixed(2)}</td><td>checkout populated</td></tr>`;
      orderBindings.cartItems.textContent = '1 line';
      orderBindings.units.textContent = o.qty;
      orderBindings.value.textContent = formatPrice(o.grandTotal, 'USD');
      orderBindings.queueRef.textContent = o.ref;
      orderBindings.queueRequester.textContent = o.requester;
      orderBindings.queueWindow.textContent = '1h window';
      orderBindings.timelineRef.textContent = `${o.ref} entered the OSL lane with complete mandatory fields.`;
      orderBindings.srRefTop.textContent = `REF: SR_from_${o.ref}`;
      orderBindings.srRequesterRef.textContent = o.requesterRef;
      orderBindings.srReadyDate.textContent = o.readyDate;
      orderBindings.srWeight.textContent = o.weight;
      orderBindings.srVolume.textContent = o.volume;
      orderBindings.srDimensions.textContent = `Release against approved ${o.ref}. ${o.qty} ${o.uom} carried from approved request.`;
      orderBindings.srNotify.textContent = 'NBO hub dispatch, field logistics, warehouse control';
      orderBindings.srMode.textContent = o.shipmentMode;
      orderBindings.srDate.textContent = o.readyDate;
      orderBindings.stockBody.innerHTML = `<tr><td>1</td><td>${o.itemCode}</td><td>${o.itemName}</td><td>${o.uom}</td><td>${o.qty}</td><td>${o.itemCode}-B1</td><td>2029-03</td><td>${o.unitPrice.toFixed(2)}</td><td>${o.total.toFixed(2)}</td><td>${o.status === 'Approved for stock release' ? 'released' : 'awaiting approval'}</td></tr>`;
    }

    function checkoutToOrderRequest() {
      const activeCard = document.querySelector('.product-card.active-product');
      const product = productData[currentProductKey];
      const requesterInput = document.querySelector('.order-grid input[type="text"]');
      const unitPrice = Number(activeCard.dataset.priceusd);
      const total = unitPrice * currentQty;
      const handling = Math.max(8, Math.round(unitPrice * 0.08));
      const grandTotal = total + handling;
      appState.currentOrder = {
        ref: `OR_24-00${appState.orderCounter}_Kenya`,
        requester: requesterInput ? requesterInput.value : 'Ava Lewis',
        requesterRef: `REQ-EM-00${appState.orderCounter}`,
        pteao: 'Pending input',
        shipmentMode: 'Air freight',
        readyDate: '05-Aug-26',
        country: 'Kenya',
        status: 'Draft validated',
        itemCode: currentProductKey === 'kit' ? 'ERK-204' : currentProductKey === 'mask' ? 'PPE-118' : 'PPE-441',
        itemName: product.name,
        uom: currentProductKey === 'kit' ? 'kit' : 'bx',
        qty: currentQty,
        unitPrice: unitPrice,
        total: total,
        handling: handling,
        grandTotal: grandTotal,
        weight: Math.max(8, currentQty * (currentProductKey === 'kit' ? 12 : 2)),
        volume: Number((currentQty * (currentProductKey === 'kit' ? 0.4 : 0.08)).toFixed(1)),
        notes: 'Draft created from checkout. Awaiting requester validation and submit.'
      };
      appState.orderCounter += 1;
      renderCurrentOrder();
      activatePage('orders');
      ordersListView.style.display = 'none';
      orderDetailView.classList.add('active');
    }

    menuItems.forEach((item) => {
      item.addEventListener('click', () => activatePage(item.dataset.page));
    });

    currencyPills.forEach((pill) => {
      pill.addEventListener('click', () => updateCurrency(pill.dataset.currency));
    });

    categoryButtons.forEach((btn) => {
      btn.addEventListener('click', () => filterProducts(btn.dataset.category));
    });

    productCards.forEach((card) => {
      card.addEventListener('click', () => openProductDetail(card));
    });

    placeOrderBtn.addEventListener('click', checkoutToOrderRequest);
    sendOrderBtn.addEventListener('click', () => {
      appState.currentOrder.status = 'Submitted to OSL';
      appState.currentOrder.notes = 'Validated and sent. Live monitoring now active while OSL Operations reviews the request.';
      renderCurrentOrder();
      activatePage('osl');
    });

    approveToStockBtn.addEventListener('click', () => {
      appState.currentOrder.status = 'Approved for stock release';
      appState.currentOrder.notes = 'Approved by OSL Operations. Request locked. Stock release document generated.';
      renderCurrentOrder();
    });

    productsBackBtn.addEventListener('click', showProductCatalog);
    detailBackBtn.addEventListener('click', showProductCatalog);

    qtyMinus.addEventListener('click', () => {
      currentQty = Math.max(1, currentQty - 1);
      updateOrderSummary();
    });

    qtyPlus.addEventListener('click', () => {
      currentQty += 1;
      updateOrderSummary();
    });

    orderOpenBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        ordersListView.style.display = 'none';
        orderDetailView.classList.add('active');
      });
    });

    orderBackBtn.addEventListener('click', () => {
      ordersListView.style.display = '';
      orderDetailView.classList.remove('active');
    });

    renderCurrentOrder();
    filterProducts('all');
    updateCurrency('USD');
  </script>
</body>
</html>
