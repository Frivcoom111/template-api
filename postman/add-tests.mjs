/**
 * Adds afterResponse test scripts to all 32 request YAML files
 * in the Template Api collection, based on actual controller response shapes.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const BASE = resolve(__dirname, "../collections/Template Api");

// ─── helpers ────────────────────────────────────────────────────────────────

/** Build the YAML scripts block from an array of JS code lines */
function scriptsBlock(lines) {
  const body = lines.map((l) => `      ${l}`).join("\n");
  return `scripts:\n  - type: afterResponse\n    language: text/javascript\n    code: |-\n${body}\n`;
}

/** Standard status + timing prefix lines */
function std(status) {
  return [
    `pm.test("Status code is ${status}", () => pm.response.to.have.status(${status}));`,
    `pm.test("Response time < 2000ms", () => pm.expect(pm.response.responseTime).to.be.below(2000));`,
  ];
}

/** Append scripts block to a file that has no existing scripts section */
function appendScripts(filePath, lines) {
  let content = readFileSync(filePath, "utf8");
  // Normalise line endings to LF, strip trailing newline, then re-add cleanly
  content = content.replace(/\r\n/g, "\n").trimEnd();
  content += "\n" + scriptsBlock(lines);
  writeFileSync(filePath, content, "utf8");
}

/** Replace the entire existing scripts: section (Login files) */
function replaceScripts(filePath, lines) {
  let content = readFileSync(filePath, "utf8");
  content = content.replace(/\r\n/g, "\n");
  const idx = content.indexOf("\nscripts:");
  if (idx === -1) throw new Error(`No scripts: section found in ${filePath}`);
  content = content.slice(0, idx + 1) + scriptsBlock(lines);
  writeFileSync(filePath, content, "utf8");
}

// ─── per-request test definitions ───────────────────────────────────────────

const files = [
  // ── Authentication / Auth ─────────────────────────────────────────────────

  {
    rel: "Authentication/Auth/Register - User.request.yaml",
    lines: [
      ...std(201),
      `pm.test("Response has message and userCreated", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("userCreated");`,
      `  pm.expect(json.userCreated).to.include.keys("id", "name", "email", "role", "isActive");`,
      `});`,
    ],
  },

  {
    rel: "Authentication/Auth/Login - USER.request.yaml",
    replace: true, // has existing token-save script; we rebuild the whole block
    lines: [
      // keep token-save logic first
      `const json = pm.response.json();`,
      `if (json && json.token) {`,
      `  pm.environment.set("userToken", json.token);`,
      `}`,
      ...std(200),
      `pm.test("Response has token and user", () => {`,
      `  const j = pm.response.json();`,
      `  pm.expect(j).to.have.property("token");`,
      `  pm.expect(j).to.have.property("user");`,
      `  pm.expect(j.user).to.include.keys("id", "name", "email", "role", "isActive");`,
      `});`,
    ],
  },

  {
    rel: "Authentication/Auth/Me.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has user object", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("user");`,
      `  pm.expect(json.user).to.include.keys("id", "name", "email", "role", "isActive");`,
      `});`,
    ],
  },

  {
    rel: "Authentication/Auth/Login - ADMIN.request.yaml",
    replace: true,
    lines: [
      `const json = pm.response.json();`,
      `if (json && json.token) {`,
      `  pm.environment.set("adminToken", json.token);`,
      `}`,
      ...std(200),
      `pm.test("Response has token and user", () => {`,
      `  const j = pm.response.json();`,
      `  pm.expect(j).to.have.property("token");`,
      `  pm.expect(j).to.have.property("user");`,
      `  pm.expect(j.user).to.include.keys("id", "name", "email", "role", "isActive");`,
      `});`,
    ],
  },

  {
    rel: "Authentication/Auth/Logout.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message").that.is.a("string");`,
      `});`,
    ],
  },

  {
    rel: "Authentication/Auth/Send-email.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message").that.is.a("string");`,
      `});`,
    ],
  },

  {
    rel: "Authentication/Auth/Verify-email.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message").that.is.a("string");`,
      `});`,
    ],
  },

  // ── Authentication / Users ────────────────────────────────────────────────

  {
    rel: "Authentication/Users/Create - Admin.request.yaml",
    lines: [
      ...std(201),
      `pm.test("Response has message and userCreated", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("userCreated");`,
      `  pm.expect(json.userCreated).to.include.keys("id", "name", "email", "role", "isActive");`,
      `});`,
    ],
  },

  {
    rel: "Authentication/Users/Update.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and updatedUser", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("updatedUser");`,
      `  pm.expect(json.updatedUser).to.include.keys("id", "name", "email", "role", "isActive");`,
      `});`,
    ],
  },

  {
    rel: "Authentication/Users/Update Password.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and updatedUser", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("updatedUser");`,
      `  pm.expect(json.updatedUser).to.include.keys("id", "name", "email", "role", "isActive");`,
      `});`,
    ],
  },

  {
    rel: "Authentication/Users/Update Role.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and updatedUser", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("updatedUser");`,
      `  pm.expect(json.updatedUser).to.include.keys("id", "name", "email", "role", "isActive");`,
      `});`,
    ],
  },

  {
    rel: "Authentication/Users/Toggle.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and userToggle", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("userToggle");`,
      `  pm.expect(json.userToggle).to.include.keys("id", "name", "email", "role", "isActive");`,
      `});`,
    ],
  },

  {
    rel: "Authentication/Users/Listar usuarios.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has paginated data and meta", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("data").that.is.an("array");`,
      `  pm.expect(json).to.have.property("meta");`,
      `  pm.expect(json.meta).to.include.keys("total", "page", "limit", "totalPages");`,
      `});`,
    ],
  },

  // ── Products / Products ───────────────────────────────────────────────────

  {
    rel: "Products/Products/Create.request.yaml",
    lines: [
      ...std(201),
      `pm.test("Response has message and product", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("product");`,
      `  pm.expect(json.product).to.include.keys("id", "name", "mark", "description", "price", "stock", "imageUrl", "slug", "category");`,
      `  pm.expect(json.product.category).to.include.keys("name", "slug");`,
      `});`,
    ],
  },

  {
    rel: "Products/Products/Listar todos Produtos.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has paginated data and meta", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("data").that.is.an("array");`,
      `  pm.expect(json).to.have.property("meta");`,
      `  pm.expect(json.meta).to.include.keys("total", "page", "limit", "totalPages");`,
      `});`,
    ],
  },

  {
    rel: "Products/Products/Listar Produtos pelo Id.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has product object", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("product");`,
      `  pm.expect(json.product).to.include.keys("id", "name", "mark", "description", "price", "stock", "imageUrl", "slug", "category");`,
      `  pm.expect(json.product.category).to.include.keys("name", "slug");`,
      `});`,
    ],
  },

  {
    rel: "Products/Products/Listar Produtos pelo Slug e Search.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has paginated data and meta", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("data").that.is.an("array");`,
      `  pm.expect(json).to.have.property("meta");`,
      `  pm.expect(json.meta).to.include.keys("total", "page", "limit", "totalPages");`,
      `});`,
    ],
  },

  {
    rel: "Products/Products/Update.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and product", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("product");`,
      `  pm.expect(json.product).to.include.keys("id", "name", "slug");`,
      `});`,
    ],
  },

  {
    rel: "Products/Products/Delete.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message, softDeleted flag and product", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("softDeleted").that.is.a("boolean");`,
      `  pm.expect(json).to.have.property("product");`,
      `});`,
    ],
  },

  // ── Products / Categories ─────────────────────────────────────────────────

  {
    rel: "Products/Categories/Create.request.yaml",
    lines: [
      ...std(201),
      `pm.test("Response has message and createdCategory", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("createdCategory");`,
      `  pm.expect(json.createdCategory).to.include.keys("id", "name", "slug");`,
      `});`,
    ],
  },

  {
    rel: "Products/Categories/Listar todas Categorias.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has categories array", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("categories").that.is.an("array");`,
      `});`,
    ],
  },

  {
    rel: "Products/Categories/Update.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and updatedCategory", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("updatedCategory");`,
      `  pm.expect(json.updatedCategory).to.include.keys("id", "name", "slug");`,
      `});`,
    ],
  },

  {
    rel: "Products/Categories/Delete.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and deletedCategory", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("deletedCategory");`,
      `  pm.expect(json.deletedCategory).to.include.keys("id", "name", "slug");`,
      `});`,
    ],
  },

  {
    rel: "Products/Categories/Listar Categorias pelo Slug.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has categories", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("categories");`,
      `});`,
    ],
  },

  // ── Products / Products Images ────────────────────────────────────────────

  {
    rel: "Products/Products Images/Listar Imagens pelo Id Produto.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response is an array of images", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.be.an("array");`,
      `  if (json.length > 0) {`,
      `    pm.expect(json[0]).to.include.keys("id", "url");`,
      `  }`,
      `});`,
    ],
  },

  {
    rel: "Products/Products Images/Create.request.yaml",
    lines: [
      ...std(201),
      `pm.test("Response has message and image", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("image");`,
      `  pm.expect(json.image).to.include.keys("id", "url");`,
      `});`,
    ],
  },

  {
    rel: "Products/Products Images/Delete.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and image", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("image");`,
      `  pm.expect(json.image).to.include.keys("id", "url");`,
      `});`,
    ],
  },

  // ── Cart ──────────────────────────────────────────────────────────────────

  {
    rel: "Cart/Buscar.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has cart with items and total", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("cart");`,
      `  pm.expect(json.cart).to.include.keys("items", "total");`,
      `  pm.expect(json.cart.items).to.be.an("array");`,
      `  pm.expect(json.cart.total).to.be.a("string");`,
      `});`,
    ],
  },

  {
    rel: "Cart/Create Product.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and cart", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("cart");`,
      `  pm.expect(json.cart).to.include.keys("items", "total");`,
      `  pm.expect(json.cart.items).to.be.an("array");`,
      `});`,
    ],
  },

  {
    rel: "Cart/Update Stock.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and cart", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("cart");`,
      `  pm.expect(json.cart).to.include.keys("items", "total");`,
      `});`,
    ],
  },

  {
    rel: "Cart/Delete.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and cart", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("cart");`,
      `  pm.expect(json.cart).to.include.keys("items", "total");`,
      `  pm.expect(json.cart.items).to.be.an("array");`,
      `});`,
    ],
  },

  {
    rel: "Cart/Clear.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and empty cart", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("cart");`,
      `  pm.expect(json.cart).to.include.keys("items", "total");`,
      `  pm.expect(json.cart.items).to.be.an("array");`,
      `});`,
    ],
  },

  // ── Address ───────────────────────────────────────────────────────────────

  {
    rel: "Address/Create.request.yaml",
    lines: [
      ...std(201),
      `pm.test("Response has message and address", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("address");`,
      `  pm.expect(json.address).to.include.keys("id", "street", "number", "city", "state", "zipCode");`,
      `});`,
    ],
  },

  {
    rel: "Address/Listar Enderecos.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has addresses array", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("addresses").that.is.an("array");`,
      `});`,
    ],
  },

  {
    rel: "Address/Listar Enderecos pelo Id.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has address object", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("address");`,
      `  pm.expect(json.address).to.include.keys("id", "street", "number", "city", "state", "zipCode");`,
      `});`,
    ],
  },

  {
    rel: "Address/Update.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and address", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("address");`,
      `  pm.expect(json.address).to.include.keys("id", "street", "number", "city", "state", "zipCode");`,
      `});`,
    ],
  },

  {
    rel: "Address/Delete.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and softDeleted flag", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("softDeleted").that.is.a("boolean");`,
      `});`,
    ],
  },

  // ── Orders ────────────────────────────────────────────────────────────────

  {
    rel: "Orders/Create.request.yaml",
    lines: [
      ...std(201),
      `pm.test("Response has message and order", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("order");`,
      `  pm.expect(json.order).to.include.keys("id", "userId", "addressId", "orderStatus", "total", "items", "address");`,
      `  pm.expect(json.order.items).to.be.an("array");`,
      `});`,
    ],
  },

  {
    rel: "Orders/Listar.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has paginated data and meta", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("data").that.is.an("array");`,
      `  pm.expect(json).to.have.property("meta");`,
      `  pm.expect(json.meta).to.include.keys("total", "page", "limit", "totalPages");`,
      `});`,
    ],
  },

  {
    rel: "Orders/Listar pelo Id.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has order object", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("order");`,
      `  pm.expect(json.order).to.include.keys("id", "userId", "addressId", "orderStatus", "total", "items", "address");`,
      `  pm.expect(json.order.items).to.be.an("array");`,
      `});`,
    ],
  },

  {
    rel: "Orders/Update.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and order", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("order");`,
      `  pm.expect(json.order).to.include.keys("id", "orderStatus");`,
      `});`,
    ],
  },

  {
    rel: "Orders/Delete.request.yaml",
    lines: [
      ...std(200),
      `pm.test("Response has message and order", () => {`,
      `  const json = pm.response.json();`,
      `  pm.expect(json).to.have.property("message");`,
      `  pm.expect(json).to.have.property("order");`,
      `  pm.expect(json.order).to.include.keys("id", "orderStatus");`,
      `});`,
    ],
  },
];

// ─── apply ───────────────────────────────────────────────────────────────────

let ok = 0;
let fail = 0;

for (const { rel, lines, replace } of files) {
  const filePath = join(BASE, rel);
  try {
    if (replace) {
      replaceScripts(filePath, lines);
    } else {
      appendScripts(filePath, lines);
    }
    console.log(`✓  ${rel}`);
    ok++;
  } catch (err) {
    console.error(`✗  ${rel}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone — ${ok} updated, ${fail} failed.`);
