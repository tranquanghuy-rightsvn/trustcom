# Contact Page Specification

## Overview
- **Source URL:** https://digiway.com.vn/contact/
- **Target file:** `contact/index.html` (plain HTML/CSS static page, matches project stack — not a Next.js/React project)
- **Screenshots:** `docs/design-references/digiway_contact_desktop_full.png`, `docs/design-references/digiway_contact_mobile_full.png`
- **Interaction model:** static page with a client-side-only contact form (no real backend — form submit is intercepted by JS, shows a confirmation alert, resets fields)
- **Header/Footer:** reused verbatim from the existing site pattern (`company/index.html`), per explicit user instruction ("Sử dụng menu và footer có sẵn trong hệ thống")

## DOM Structure
```
section.page-hero.container
  div.page-hero__grid.page-hero__grid--top   (align-items: start override; 1 col mobile / 2 col ≥992px)
    div  (left column)
      h1
      p.page-hero__lead
      ul.contact-info-list
        li.contact-info-item (email icon + mailto link)
        li.contact-info-item (phone icon + tel link)
        li.contact-info-item (location icon + address text)
    form.contact-form (right column)
      div.contact-form__row (2-col ≥640px) > 2x div.contact-form__field (Họ và tên / Tên doanh nghiệp)
      div.contact-form__row > 2x div.contact-form__field (Email / Điện thoại)
      div.contact-form__field (Link website — full width)
      div.contact-form__field (select: Chức vụ)
      div.contact-form__field (select: Loại hình kinh doanh)
      div.contact-form__field (select: Số đơn hàng tháng)
      div.contact-form__field (select: Quy mô nhân sự)
      div.contact-form__field > div.contact-form__checkbox-list (3 checkboxes: Giải pháp quan tâm)
      div.contact-form__field (textarea: Vấn đề doanh nghiệp)
      button.btn.btn--green.contact-form__submit
```

## Computed Styles (from live site, getComputedStyle)
- H2 (mapped to our `<h1>`): fontSize 48px, fontWeight 700, lineHeight 56px, marginBottom 24px, color rgb(43,43,43) — matches our existing `.page-hero h1` scale closely (our site uses 65px/75px at ≥768px, kept for visual consistency with the rest of our site rather than the source's exact 48px, since global heading scale is shared across all our pages).
- Form label: fontSize ~13.5px, fontWeight 700 → mapped to 14px/700 in our `.contact-form__field label` for readability at our base font scale.
- Input/select/textarea: border 1px solid rgb(220,220,220) (~#dcdcdc, matched to our `--dw-border` #e7e7e7), borderRadius 5px (rounded up to 8px to match our site's existing form control radius, e.g. `.footer-newsletter input`), background white.
- Submit button: background rgb(63,185,113) — matches our existing `--dw-green-alt` (#3fb971) almost exactly; used our standard `.btn.btn--green` component instead for site-wide consistency.

## States & Behaviors
### Form submit (client-only, no backend)
- **Trigger:** `submit` event on `.contact-form`
- **Behavior:** `preventDefault()`, `alert("Cảm ơn bạn đã liên hệ! Đội ngũ Digiway sẽ phản hồi sớm nhất.")`, `form.reset()`
- **Verified:** dispatched click on submit button via CDP → dialog fired with expected message, no console errors.

### Input focus
- **Trigger:** `:focus` on input/select/textarea
- **Before → After:** border-color `var(--dw-border)` → `var(--dw-green)`
- **Transition:** `border-color 0.2s ease`

## Assets
- `../assets/images/global/aa-1.svg` — email envelope icon (downloaded from source, stroke `#ef5941`)
- `../assets/images/home/aa1-1.svg` — phone icon (already present in project from prior extraction)
- `../assets/images/global/aa12-1.svg` — location pin icon (downloaded from source, stroke `#ef5941`)

## Text Content (verbatim from source)
- H1: "Đã đến lúc ngừng mạo hiểm với ngân sách marketing của bạn"
- Lead: "Digiway đồng hành cùng thương hiệu tăng trưởng bền vững!"
- Contact info: `contact@digiway.com.vn`, `0776 686 686`, `09-C14 Khu đô thị, Geleximco C, Dương Nội, Hà Nội`
- Form field labels: Họ và tên, Tên doanh nghiệp, Email, Điện thoại, Link website doanh nghiệp/gian hàng, Chức vụ, Loại hình kinh doanh, Số đơn hàng tháng, Quy mô nhân sự, Giải pháp quan tâm, Vấn đề doanh nghiệp bạn đang gặp phải là gì?
- Select options (verbatim, extracted via `select.options`):
  - Chức vụ: Chọn / Giám đốc / Chủ doanh nghiệp / Quản lý / Trưởng phòng (Brand, Marketing, eCom, ...) / Chuyên viên / Khác
  - Loại hình kinh doanh: Chọn / Thương hiệu / Nhà sản xuất / Reseller / Nhà phân phối / eCommerce Seller / Khác
  - Số đơn hàng tháng: Chọn / < 500 đơn/ tháng / 500 – 2,000 đơn/ tháng / 2,000 – 10,000 đơn/ tháng / > 10,000 đơn/ tháng
  - Quy mô nhân sự: Chọn / 11–50 nhân sự / 51–200 nhân sự / 201–500 nhân sự / 500+ nhân sự
- Checkboxes: Social marketing, Sản xuất video chuyển đổi, Tối ưu gian hàng TMĐT
- Submit button: "Tư vấn tôi"

## Responsive Behavior
- **Desktop (≥992px):** 2-column grid (info left, form right), top-aligned; form fields in 2-col rows where paired (name/company, email/phone) at ≥640px.
- **Mobile (390px):** single column stack, all form fields full width including previously-paired ones.
- **Breakpoints:** grid switches to 2 columns at 992px (`.page-hero__grid`, existing project breakpoint); form row pairs switch to 2 columns at 640px (`.contact-form__row`, new).

## Deviations from source (intentional, for consistency with existing project design system)
- Used our own `.page-hero`/`.btn`/`--dw-*` design tokens instead of the source's raw pixel values, since this page must feel consistent with every other page already built in this project.
- Source uses `<h2>` for the page title; we use `<h1>` to match this project's own convention (every other subpage — company, blog, service pages — uses `<h1>` inside `.page-hero`).
- Form has no real backend (out of scope per clone defaults) — submit is intercepted client-side with a confirmation message.
