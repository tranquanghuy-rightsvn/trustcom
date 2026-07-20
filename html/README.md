# TrustCom Media — Website

Website giới thiệu công ty TrustCom Media (truyền thông · quảng cáo · marketing tổng thể 360°).

## Cấu trúc dự án

```
.
├── index.html                 # Trang chủ (landing page)
├── sitemap.xml                # Sitemap cho SEO
├── robots.txt                 # Chỉ dẫn cho công cụ tìm kiếm
├── assets/
│   ├── css/
│   │   └── style.css          # Toàn bộ style (thương hiệu navy–gold)
│   ├── js/
│   │   └── main.js            # Hiệu ứng, nav, form, parallax (Lenis + GSAP)
│   └── img/
│       ├── favicon.svg        # Favicon
│       └── og-cover.svg       # Ảnh chia sẻ mạng xã hội (Open Graph)
└── blog/                      # Các bài viết blog riêng, chuẩn SEO
    ├── chuyen-doi-so-cho-doanh-nghiep-vua-va-nho.html
    ├── gom-bat-trang-ban-online.html
    ├── tiktok-shop-cho-gom-su.html
    └── 3-sai-lam-lang-nghe-ban-online.html
```

## Công nghệ

- HTML/CSS/JS thuần, không cần build step.
- **Lenis** — cuộn mượt (smooth scroll).
- **GSAP + ScrollTrigger** — hiệu ứng parallax và reveal khi cuộn.
  - Tải qua CDN với `defer`; nếu không tải được, JS tự động fallback về
    `IntersectionObserver` để nội dung vẫn hiển thị bình thường.
  - Tôn trọng `prefers-reduced-motion`: tắt hiệu ứng cho người dùng cần.
- Font: Be Vietnam Pro + Space Grotesk (Google Fonts).

## Chạy thử tại máy

Vì là site tĩnh, chỉ cần một web server đơn giản:

```bash
# Python
python3 -m http.server 8080

# hoặc Node
npx serve .
```

Rồi mở http://localhost:8080

## SEO

- Mỗi trang có `title`, `meta description`, `canonical` riêng.
- Thẻ Open Graph + Twitter Card cho chia sẻ mạng xã hội.
- Dữ liệu có cấu trúc (JSON-LD): `Organization` ở trang chủ, `BlogPosting`
  cho mỗi bài blog.
- `sitemap.xml` + `robots.txt`.

> Lưu ý: các URL tuyệt đối dùng tên miền mẫu `https://trustcommedia.vn/`.
> Khi lên tên miền thật, thay chuỗi này trong các thẻ `canonical`, Open Graph
> và `sitemap.xml`.
