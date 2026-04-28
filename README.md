# JIXTA Quote PDF Worker

Worker này nhận JSON, render `quote-summary-email.html` thành HTML hoàn chỉnh, rồi xuất PDF bằng Cloudflare Browser Run.

## File chính

- `quote-summary-email.html`: template gốc với placeholder `{{...}}`
- `src/render.ts`: map JSON payload sang HTML
- `src/index.ts`: endpoint `/html`, `/pdf`, `/sample`
- `scripts/build-template.mjs`: đóng gói template HTML vào Worker trước khi chạy
- `scripts/render-sample.ts`: render sample payload ra file HTML để preview local

## 1. Cài dependency

```bash
npm install
```

## 2. Đăng nhập Cloudflare

```bash
npx wrangler login
```

## 3. Chạy local

```bash
npm run dev
```

Binding `browser.remote = true` đã bật trong `wrangler.jsonc`, nên local dev sẽ dùng Browser Run thật của Cloudflare.

## 4. Test API

Lấy sample payload:

```bash
curl http://127.0.0.1:8787/sample
```

Render HTML:

```bash
curl -X POST http://127.0.0.1:8787/html \
  -H "Content-Type: application/json" \
  --data @sample-payload.json
```

Render PDF:

```bash
curl -X POST http://127.0.0.1:8787/pdf \
  -H "Content-Type: application/json" \
  --data @sample-payload.json \
  --output quote.pdf
```

Render sample ra HTML file:

```bash
npm run render:sample
```

File output:

```bash
dist/sample-preview.html
```

## 5. Deploy

```bash
npm run deploy
```

Sau khi deploy, thay `http://127.0.0.1:8787` bằng domain Worker của bạn.

## Payload động

Payload backend cần gửi chỉ gồm `quote` và `product`.

- `quote.design_id`: mã design/quote hiển thị trong phần specifications
- `quote.createdAt`: ngày tạo quote
- `quote.deliveryRange`: khoảng thời gian giao dự kiến
- `quote.additionalInstructions`: ghi chú giao hàng, có thể bỏ trống
- `product.previewImageUrl`: ảnh preview public/signed URL hoặc `data:image/...`
- `product.previewImageAlt`: alt text cho ảnh preview
- `product.title`: tên sản phẩm
- `product.subtitle`: mô tả ngắn về size/shape/type
- `product.changeRequest`: nội dung request changes, có thể bỏ trống
- `product.options`: danh sách badge add-on
- `product.specifications`: danh sách thông số `{ "label": "...", "value": "..." }`

CTA, hero text, footer, support info và social links đang được fix cứng trong template/code, không cần truyền từ backend.

## Endpoint

- `GET /`: mô tả service
- `GET /sample`: sample payload
- `GET /healthz`: health check
- `POST /html`: render HTML từ JSON
- `POST /pdf`: render PDF từ JSON

## GitHub -> Cloudflare Workers Builds

Khi connect repo này vào Cloudflare Workers Builds, dùng các giá trị sau:

- Worker name: `email-template`
- Production branch: `main`
- Root directory: để trống nếu repo này là repo riêng
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Non-production branch deploy command: `npx wrangler versions upload`
- Build variable khuyến nghị: `NODE_VERSION=22`

Lưu ý:

- Tên Worker trên dashboard phải khớp với `name` trong `wrangler.jsonc`
- `BROWSER` là Browser Run binding, không phải env var text
- Runtime secret hiện chưa bắt buộc cho bản đầu tiên

## Browser Run binding

Repo này dùng Browser Run binding:

```json
"browser": {
  "binding": "BROWSER",
  "remote": true
}
```

Trên Cloudflare, bạn cần xác nhận Worker có Browser Run binding tên `BROWSER`.

## Ảnh riêng

- Nếu ảnh public: truyền trực tiếp `https://...`
- Nếu ảnh private: dùng signed URL còn hạn hoặc `data:image/...;base64,...`
- Trường ảnh chính là `product.previewImageUrl`
