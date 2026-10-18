
const P = [
    {
        id: 1,
        n: "Audífonos Bluetooth",
        c: "Electrónica",
        b: "Xiaomi",
        p: 799,
        i: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 2,
        n: "Tenis deportivos",
        c: "Deportes",
        b: "Adidas",
        p: 1200,
        i: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 3,
        n: "Camiseta deportiva",
        c: "Ropa",
        b: "Nike",
        p: 450,
        i: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 4,
        n: "Televisor Smart TV",
        c: "Electrónica",
        b: "Samsung",
        p: 6500,
        i: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=700&q=80"
    },
    {
        id: 5,
        n: "Refrigerador",
        c: "Hogar",
        b: "LG",
        p: 8900,
        i: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=700&q=80"
    }
];

const money = n =>
    n.toLocaleString("es-MX", {
        style: "currency",
        currency: "MXN"
    });

const cart = () =>
    JSON.parse(localStorage.getItem("saraCart") || "[]");

function save(c) {
    localStorage.setItem("saraCart", JSON.stringify(c));
    count();
}

function count() {
    const quantity = cart().reduce((sum, item) => sum + item.q, 0);

    document.querySelectorAll("#count, #cart-count").forEach(element => {
        element.textContent = quantity;
    });
}

function add(id) {
    const c = cart();
    const item = c.find(product => product.id === id);

    if (item) {
        item.q++;
    } else {
        c.push({ id, q: 1 });
    }

    save(c);

    const notice = document.querySelector("#notice");
    if (notice) {
        notice.textContent = "Producto agregado al carrito.";
    }
}

function card(p) {
    return `
        <div class="col-sm-6 col-lg-4">
            <article class="card product-card">
                <img src="${p.i}" alt="${p.n}" class="card-img-top">
                <div class="card-body">
                    <span class="badge bg-light text-dark mb-2">Destacado</span>
                    <h2 class="h5">${p.n}</h2>
                    <p class="text-secondary">${p.c} · ${p.b}</p>
                    <p class="price">${money(p.p)}</p>
                    <button class="btn btn-sara w-100" onclick="add(${p.id})">
                        Agregar al carrito
                    </button>
                </div>
            </article>
        </div>
    `;
}

function renderProducts() {
    const element = document.querySelector("#products");
    if (!element) return;

    const searchElement = document.querySelector("#search");
    const categoryElement = document.querySelector("#category");
    const sortElement = document.querySelector("#sort");

    const query = (searchElement?.value || "").trim().toLowerCase();
    const category = categoryElement?.value || "";
    const sort = sortElement?.value || "";

    const results = P.filter(product => {
        const matchesSearch =
            `${product.n} ${product.b} ${product.c}`
                .toLowerCase()
                .includes(query);

        const matchesCategory =
            !category || product.c === category;

        return matchesSearch && matchesCategory;
    });

    if (sort === "low") {
        results.sort((a, b) => a.p - b.p);
    }

    if (sort === "high") {
        results.sort((a, b) => b.p - a.p);
    }

    element.innerHTML = results.length
        ? results.map(card).join("")
        : "<p>No se encontraron productos.</p>";
}

function renderCart() {
    const element = document.querySelector("#cart-items");
    if (!element) return;

    const items = cart();

    if (!items.length) {
        element.innerHTML =
            '<p class="text-center py-5">Tu carrito está vacío. <a href="productos.html">Explora los productos</a>.</p>';
        totals(0);
        return;
    }

    element.innerHTML = items.map(item => {
        const product = P.find(p => p.id === item.id);
        if (!product) return "";

        return `
            <div class="cartrow">
                <img src="${product.i}" alt="${product.n}">
                <div class="flex-grow-1">
                    <strong>${product.n}</strong>
                    <div>${money(product.p)} c/u</div>
                    <button class="btn btn-sm btn-link text-danger p-0"
                        onclick="removeItem(${product.id})">
                        Eliminar
                    </button>
                </div>
                <label>
                    Cant.
                    <input type="number" min="1" max="99" value="${item.q}"
                        style="width:65px"
                        onchange="qty(${product.id}, this.value)">
                </label>
                <strong>${money(product.p * item.q)}</strong>
            </div>
        `;
    }).join("");

    const subtotal = items.reduce((sum, item) => {
        const product = P.find(p => p.id === item.id);
        return sum + (product ? product.p * item.q : 0);
    }, 0);

    totals(subtotal);
}

function totals(subtotal) {
    if (!document.querySelector("#subtotal")) return;

    const shipping =
        subtotal === 0 || subtotal >= 2000 ? 0 : 99;


    const discount =
        sessionStorage.getItem("saraCoupon") === "SARA10"
            ? subtotal * 0.1
            : 0;

    document.querySelector("#subtotal").textContent = money(subtotal);
    document.querySelector("#shipping").textContent =
        shipping ? money(shipping) : "Gratis";
    document.querySelector("#total").textContent =
    money(subtotal + shipping - discount);
}

function removeItem(id) {
    save(cart().filter(item => item.id !== id));
    renderCart();
}

function qty(id, value) {
    const items = cart();
    const item = items.find(product => product.id === id);

    if (item) {
        item.q = Math.max(1, Math.min(99, parseInt(value, 10) || 1));
    }

    save(items);
    renderCart();
}

document.addEventListener("DOMContentLoaded", () => {
    // Leer el término enviado desde el buscador de la página de inicio.
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("buscar");
    const searchElement = document.querySelector("#search");

    if (initialSearch && searchElement) {
        searchElement.value = initialSearch;
    }

    count();
    renderProducts();
    renderCart();

    ["search", "category", "sort"].forEach(id => {
        const element = document.querySelector(`#${id}`);

        element?.addEventListener(
            id === "search" ? "input" : "change",
            renderProducts
        );
    });

    document.querySelector("#clear")?.addEventListener("click", () => {
        save([]);
        renderCart();
    });

    document.querySelector("#apply")?.addEventListener("click", () => {
        const message = document.querySelector("#message");
        const coupon = document.querySelector("#coupon")?.value
            .trim()
            .toUpperCase();

        if (!message) return;

        if (coupon === "SARA10") {
            sessionStorage.setItem("saraCoupon", "SARA10");
            message.textContent = "Cupón aplicado: 10% de descuento.";
        } else {
            sessionStorage.removeItem("saraCoupon");
            message.textContent = "Cupón no válido. Prueba SARA10.";
        }

        renderCart();
    });

    document.querySelector("#checkout")?.addEventListener("click", () => {
        const message = document.querySelector("#message");
        if (!message) return;

        message.textContent = cart().length
            ? "Pedido de demostración listo. No se realizó ningún cobro."
            : "Agrega productos antes de continuar.";
    });
});
