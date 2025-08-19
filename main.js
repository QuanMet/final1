// ====== NAV: highlight menu on click only ======
document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.navbar a');
    // ====== Account: Hiển thị đăng nhập / đăng xuất ======
  const accountLink = document.getElementById('account-link');
  const accountText = document.getElementById('account-text');
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (accountLink && accountText) {
    if (isLoggedIn) {
      accountText.textContent = 'Đăng xuất';
      accountLink.href = 'logout.html';
    } else {
      accountText.textContent = 'Đăng nhập';
      accountLink.href = 'login.html';
    }
  }
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Search box → chuyển sang menu và filter bằng từ khóa trong query (?q=...)
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('site-search');
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const q = encodeURIComponent(searchInput.value.trim());
      location.href = 'menu.html' + (q ? ('?q=' + q) : '');
    });
  }

  // ====== Product cards: click để mở info.html với query string ======
  document.querySelectorAll('.product-card img, .product-card h3, .open-modal-btn').forEach(el => {
    el.style.cursor = "pointer";
    el.addEventListener("click", () => {
      const card = el.closest(".product-card");
      if (!card) return;
      const btn  = card.querySelector(".open-modal-btn");
      const name  = btn?.dataset.name  || card.querySelector("h3")?.textContent.trim() || "";
      const price = btn?.dataset.price || card.querySelector(".price")?.textContent.trim() || "";
      const img   = btn?.dataset.img   || card.querySelector("img")?.src || "";
      const desc  = btn?.dataset.desc  || card.querySelector("p")?.textContent.trim() || "";
      const sku   = card.querySelector("h3")?.textContent.trim() || "";
      const params = new URLSearchParams({ name, price, img, desc, sku });
      window.location.href = "info.html?" + params.toString();
    });
  });

  // Nếu đang ở menu.html và có ?q=..., lọc quick client-side (ẩn các card không khớp)
  const params = new URLSearchParams(location.search);
  const q = (params.get('q') || '').toLowerCase();
  if (q && document.getElementById('menu-grid')) {
    document.querySelectorAll('#menu-grid .product-card').forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    });
  }

  // ====== Checkout features ======
  const same = document.getElementById('sameAsShipping');
  const ship = id => document.getElementById('ship_' + id);
  const bill = id => document.getElementById('bill_' + id);
  const fields = ['name','phone','address','city','zip'];

  function syncBilling(on) {
    if (!bill('name')) return;
    fields.forEach(k => {
      bill(k).value = on ? (ship(k)?.value || '') : bill(k).value;
      bill(k).readOnly = on;
    });
  }
  if (same) {
    same.addEventListener('change', e => syncBilling(e.target.checked));
    fields.forEach(k => ship(k)?.addEventListener('input', () => same.checked && syncBilling(true)));
    syncBilling(true); // set initial
  }

  // Adaptive credit card length + message
  const cc = document.getElementById('cardNumber');
  const ccMsg = document.getElementById('cardMessage');
  if (cc) {
    function detectType(v){
      v = v.replace(/\D/g,'');
      if (/^4/.test(v)) return {type:'Visa', len:16};
      if (/^5[1-5]/.test(v)) return {type:'MasterCard', len:16};
      if (/^3[47]/.test(v)) return {type:'Amex', len:15};
      return {type:'Thẻ', len:16};
    }
    function format(v){ return v.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim(); }

    cc.addEventListener('input', () => {
      const raw = cc.value.replace(/\D/g,'');
      const {type, len} = detectType(raw);
      const spaces = Math.floor((len - 1) / 4);
      cc.maxLength = len + spaces;
      cc.value = format(raw).slice(0, cc.maxLength);
      if (ccMsg) ccMsg.textContent = `${type} • ${len} số`;
    });
  }

  // Validate checkout form
  const form = document.getElementById('checkoutForm');
  if (form) {
    form.addEventListener('submit', e => {
      let ok = form.checkValidity();
      form.querySelectorAll('[data-error]').forEach(el => el.textContent = '');
      form.querySelectorAll(':invalid').forEach(el => {
        const holder = el.closest('.field')?.querySelector('[data-error]');
        if (holder) holder.textContent = el.dataset.errmsg || 'Thông tin chưa hợp lệ';
      });
      if (!ok) e.preventDefault();
    });
  }
});

// ====== Toggle QR Code when payment method changes ======
const radios = document.querySelectorAll('input[name="paymentMethod"]');
const qrCode = document.getElementById('qr-code');
if (radios.length && qrCode) {
  function toggleQR() {
    const selected = document.querySelector('input[name="paymentMethod"]:checked').value;
    qrCode.style.display = selected === 'bank' ? 'block' : 'none';
  }
  radios.forEach(radio => radio.addEventListener('change', toggleQR));
  toggleQR(); // khởi tạo ban đầu
}
